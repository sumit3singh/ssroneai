#!/usr/bin/env python3
"""
SSR One AI – Monorepo Full Directory Tree Generator
Generates clean directory tree representation of the workspace.
"""
import os
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent

EXCLUDE_DIRS = {".git", "node_modules", ".venv", "__pycache__", "dist", "build", ".turbo", ".next"}


def generate_tree(dir_path: Path, prefix: str = "") -> str:
    output = []
    try:
        entries = sorted(list(dir_path.iterdir()), key=lambda x: (not x.is_dir(), x.name.lower()))
    except PermissionError:
        return ""

    entries = [e for e in entries if e.name not in EXCLUDE_DIRS]

    for index, entry in enumerate(entries):
        is_last = (index == len(entries) - 1)
        connector = "└── " if is_last else "├── "
        output.append(f"{prefix}{connector}{entry.name}")

        if entry.is_dir():
            extension = "    " if is_last else "│   "
            sub_tree = generate_tree(entry, prefix + extension)
            if sub_tree:
                output.append(sub_tree)

    return "\n".join(output)


if __name__ == "__main__":
    print(f"SSR One AI Monorepo Tree ({ROOT_DIR.name})")
    print(generate_tree(ROOT_DIR))
