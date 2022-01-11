import reapy
from typing import Optional


_project: Optional[reapy.Project] = None


def get_project():
    global _project
    if _project:
        return _project
    _project = reapy.Project()
    return _project


DEFAULT_PRESET_TAG = "[[REMOTE_PRESET]]"
DEFAULT_PRESET_SECTION = "REMOTE_PRESET_BANK"
