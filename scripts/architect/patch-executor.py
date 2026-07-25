#!/usr/bin/env python3
"""Apply a deterministic patch bundle inside an isolated temporary Git worktree."""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path
from typing import Any

REPOSITORY = "https://github.com/The-Architect-369/Arcanum.git"
ALLOWED_ACTIONS = {"create", "update", "delete