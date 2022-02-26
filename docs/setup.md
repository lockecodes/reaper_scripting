[//]: # (on mac ensure you have python3.8+ `which python3` `python3 --version`)
`brew install python@3.9`
might need `brew link --overwrite python@3.9`
`which python3` `python3 --version`
`pip3 install -r requirements.txt`
`pip3 install -e .`

run this to get your dylib `ls $(python3 -c "import sys;print(sys.base_exec_prefix)")/lib/libpython*`



open reaper:
1. Options -> Preferences
2. ReasScript
   1. Check enable python
   2. set custom path to the output of the libpython command above without the filename
   3. set force reascript section to the filename from above
3. apply
4. restart reaper
5. Actions -> actions list
6. New action -> load script
7. navigate to this directory and select enable_dis_api.py
8. select enable_dist_api.py from the actions and click run
9. restart reaper
10. come back to this directory in term
11. `python3 __init__.py`

the above will setup the needed files

open the config file. the path is in the output of above
add desired preset names to the preset list in the json file
run python3 __init__.py again


quit reaper again so the items show with the correct naming
