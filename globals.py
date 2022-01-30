from typing import Optional

import reapy

_project: Optional[reapy.Project] = None


def get_project():
    global _project
    if _project:
        return _project
    _project = reapy.Project()
    return _project


DEFAULT_PRESET_TAG = "[[REA_REMOTE_PRESET]]"
DEFAULT_PRESET_SECTION = "REA_REMOTE_PRESET_BANK"
DEFAULT_PRESET_COMMAND_STATE = "REA_REMOTE_PRESET_COMMANDS"
DEFAULT_CONFIG = {"presets": []}
