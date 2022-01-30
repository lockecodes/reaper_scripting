from setuptools import setup, find_packages

setup(
    name="ReaRemotePresets",
    description="Handle presets remotely",
    author="Steven Locke @ Locke.Codes",
    author_email="steve@locke.codes",
    classifiers=["Programming Language :: Python :: 3"],
    packages=find_packages(),
    install_requires=["python-reapy", "jinja2"],
    python_requires=">=3.8",
)
