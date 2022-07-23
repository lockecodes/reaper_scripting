import csv
import datetime
import json
import shutil
from pathlib import Path

import pip
import reapy
from jinja2 import Environment, FileSystemLoader

from globals import DEFAULT_PRESET_COMMAND_STATE, DEFAULT_CONFIG


def get_config_dir():
    return reapy.config.resource_path.get_resource_path()


PROJECT_NAME = "ReaRemotePresets"
CONFIG_DIR = get_config_dir()
KB_FILE_PATH = Path(CONFIG_DIR, "reaper-kb.ini")
SCRIPTS_DIR = Path(get_config_dir(), "Scripts")
LOCKE_CODES_DIR = Path(SCRIPTS_DIR, "Locke.Codes")
REMOTE_PRESETS_DIR = Path(LOCKE_CODES_DIR, PROJECT_NAME)
PRESETS_CONFIG_FILE = Path(REMOTE_PRESETS_DIR, "config.json")


def get_kb_config():
    with open(KB_FILE_PATH, newline="") as csvfile:
        reader = csv.DictReader(
            csvfile,
            fieldnames=[
                "entry_type",
                "custom_code",
                "section_id",
                "command_id",
                "description",
                "script_path",
            ],
            delimiter=" ",
            quotechar='"',
        )
        return [conf for conf in reader]


def backup_file(file_path: Path):
    time_escaped = datetime.datetime.now().isoformat().replace(":", "-")
    backup_path = Path(f"{file_path}.{time_escaped}")
    try:
        print(f"Backing up {file_path} to {backup_path}")
        with open(file_path, "r") as src_fp:
            source = src_fp.read()
        with open(backup_path, "w") as dest_fp:
            dest_fp.write(source)
    except FileNotFoundError as e:
        raise e


def write_kb_config(kb_configs: list):
    backup_file(KB_FILE_PATH)
    lines = [
        f'''{config['entry_type']} {config['custom_code']} {config['section_id']} "{config['command_id']}" "{config['description']}" "{config['script_path']}"'''
        for config in kb_configs
    ]
    content = "\n".join(lines)
    with open(KB_FILE_PATH, "w") as fp:
        fp.write(content)


def read_config_json():
    with open(PRESETS_CONFIG_FILE, "r") as fp:
        return json.load(fp=fp)


def write_config_json(config: dict, backup: bool = True):
    if backup and PRESETS_CONFIG_FILE.exists():
        backup_file(PRESETS_CONFIG_FILE)
    with open(PRESETS_CONFIG_FILE, "w") as fp:
        return json.dump(config, fp=fp, indent=2)


def init_config():
    try:
        REMOTE_PRESETS_DIR.mkdir(parents=True, exist_ok=True, mode=0o777)
    except FileExistsError:
        pass
    try:
        config = read_config_json()
    except (FileNotFoundError, json.decoder.JSONDecodeError):
        config = DEFAULT_CONFIG
    config = config or DEFAULT_CONFIG
    write_config_json(config)
    return config


def generate_preset_files(config):
    new_config = config.copy()
    env = Environment(loader=FileSystemLoader("templates/"))
    preset_template = env.get_template("preset.py.jinja2")
    for p in config["presets"]:
        new_config[p] = {}
        preset_dir = Path(REMOTE_PRESETS_DIR, p)
        try:
            shutil.rmtree(preset_dir)
        except FileNotFoundError:
            pass
        try:
            preset_dir.mkdir(parents=True, exist_ok=True, mode=0o777)
        except FileExistsError:
            pass
        with open(Path(preset_dir, "__init__.py"), "w") as fp:
            fp.write("")

        for direction in ("back", "current", "forward"):
            preset_file_name = f"{generate_preset_name(p, direction)}.py"
            description = f"Locke.Codes: {generate_present_command(p, direction)}"
            command_id = f"_Locke_Codes_{generate_present_command(p, direction)}"
            new_config[p][direction] = {
                "description": description,
                "command_id": command_id,
                "preset_file_name": preset_file_name,
            }
            new_config[p]["command_id"] = command_id
            preset_file_path = Path(
                preset_dir, f"{generate_preset_name(p, direction)}.py"
            )
            with open(preset_file_path, "w") as fp:
                fp.write(
                    preset_template.render({"track_name": p, "direction": direction})
                )
    new_config["command_map"] = {
        preset: {
            "back": new_config[preset]["back"]["command_id"],
            "current": new_config[preset]["current"]["command_id"],
            "forward": new_config[preset]["forward"]["command_id"],
        }
        for preset in config["presets"]
    }
    write_config_json(new_config)
    return new_config


def add_preset(script_path: Path):
    try:
        remove_preset(script_path)
    except ValueError:
        pass
    return reapy.add_reascript(str(script_path.absolute()), section_id=0, commit=True)


def remove_preset(script_path: Path):
    reapy.remove_reascript(str(script_path.absolute()), section_id=0, commit=True)


def add_presets(config):
    for preset in config["presets"]:
        for direction in ("back", "current", "forward"):
            add_preset(generate_preset_path(preset, direction))


def generate_preset_path(preset: str, direction: str):
    return Path(
        REMOTE_PRESETS_DIR, preset, f"{generate_preset_name(preset, direction)}.py"
    )


def generate_preset_name(preset: str, direction: str):
    return f"{preset.lower()}_preset_{direction}"


def generate_present_command(preset: str, direction: str):
    return generate_preset_name(preset, direction).lower()


def extract_preset_info_from_kb_path(script_path: str):
    script = Path(script_path)
    script_name = script.name.replace(".py", "")
    direction = script_name.split("_")[-1]
    preset_name = Path(script_path).parent.name
    return preset_name, direction, script_name


def update_kb_config_commands(config):
    kb_configs = get_kb_config()
    new_kb_configs = []
    for kb_config in kb_configs:
        preset_name, direction, script_name = extract_preset_info_from_kb_path(
            kb_config["script_path"]
        )
        try:
            new_kb_config = dict(
                kb_config,
                description=config[preset_name][direction]["description"],
                command_id=config[preset_name][direction]["command_id"],
            )
            new_kb_configs.append(new_kb_config)
        except KeyError:
            new_kb_configs.append(kb_config)
    write_kb_config(new_kb_configs)


def set_command_external_state(config):
    command_map = json.dumps(config["command_map"])
    reapy.set_ext_state(
        section=DEFAULT_PRESET_COMMAND_STATE,
        key="command_map",
        value=command_map,
        persist=True,
    )


def install():
    config = init_config()
    new_config = generate_preset_files(config)
    add_presets(new_config)
    update_kb_config_commands(new_config)
    set_command_external_state(new_config)
    pip.main(["install", "-e", "."])


if __name__ == "__main__":
    install()
    print(f"Config file path is: {PRESETS_CONFIG_FILE.absolute()}")

