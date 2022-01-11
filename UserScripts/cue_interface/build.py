from pathlib import Path
from jinja2 import Environment, FileSystemLoader
from shutil import copyfile


PROJECT_NAME = "cue_interface"
PROJECT_DIR = Path("/Users/slocke/Library/Application Support/REAPER/reaper_www_root")
INDEX_PATH = Path(PROJECT_DIR, f"{PROJECT_NAME}.html")
STATIC_PATH = Path(PROJECT_DIR, f"{PROJECT_NAME}_static")
SCRIPT_PATH = Path("..", "preset_scripts")


def get_preset_files():
    presets = {}
    for file in SCRIPT_PATH.iterdir():
        if not file.is_dir():
            continue
        presets.setdefault(file.name, [])
        for subfile in file.iterdir():
            if not subfile.is_dir() and subfile.name.endswith(".py") and not subfile.name.startswith("__init__"):
                presets[file.name].append(subfile.name)
    return presets


def build_preset_files():
    env = Environment(
        loader=FileSystemLoader('./templates'),
    )

    template = env.get_template("preset_file.py.jinja2")
    presets = get_preset_files()
    for preset, preset_files in presets.items():
        for direction in preset_files:
            preset_file = template.render({"track_name": preset, "direction": direction.replace(".py", "")})
            file_path = Path(SCRIPT_PATH, preset, direction)
            with open(file_path, "w") as fp:
                fp.write(preset_file)


def build_web_files():
    env = Environment(
        loader=FileSystemLoader('./templates'),
    )

    PROJECT_DIR.absolute().mkdir(parents=True, exist_ok=True)
    template = env.get_template("index.html")
    html = template.render({"static_route": f"{PROJECT_NAME}_static"})
    with open(INDEX_PATH, "w") as fp:
        fp.write(html)

    STATIC_PATH.absolute().mkdir(parents=True, exist_ok=True)
    for file in Path("static").iterdir():
        copyfile(file.absolute(), Path(STATIC_PATH, file.name))


def main():
    build_web_files()
    build_preset_files()


if __name__ == "__main__":
    main()
