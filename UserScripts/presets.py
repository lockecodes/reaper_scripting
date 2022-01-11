import reapy
from globals import get_project, DEFAULT_PRESET_TAG, DEFAULT_PRESET_SECTION


def get_track_by_name(track_name: str, project: reapy.Project):
    for track in project.tracks:
        if track.name == track_name:
            return track
    raise ValueError("A track by that name does not exist")


def get_managed_fx_from_track(track: reapy.Track):
    for fx in track.fxs:
        if DEFAULT_PRESET_TAG in fx.name and fx.is_enabled:
            return fx
    raise ValueError("No managed preset for track")


def get_preset(track_name: str, direction: str, project: reapy.Project = None):
    project = project or get_project()
    track = get_track_by_name(track_name=track_name, project=project)
    fx = get_managed_fx_from_track(track)
    if direction == "forward":
        fx.use_next_preset()
    elif direction == "back":
        fx.use_previous_preset()
    else:
        # No-op for current
        pass
    key = f"{track_name}|{fx.name}"
    project.set_ext_state(section=DEFAULT_PRESET_SECTION, key=key, value=fx.preset)
    return fx.preset

