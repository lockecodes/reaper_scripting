from setuptools import setup, find_packages
from os import path


here = path.abspath(path.dirname(__file__))


setup(
    name="UserScripts",
    description="Bag of scripts",
    author="Steven Locke",
    author_email="slocke716@protonmail.com",
    classifiers=[
        "Programming Language :: Python :: 3"
    ],
    packages=find_packages(),
    install_requires=[
        'python-reapy',
    ],
    python_requires=">=3.0"
)