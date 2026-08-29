#!/usr/bin/env python3
"""
SSR One AI – Domain Module Scaffolder Script
Scaffolds standard 5-part frontend domain module structure inside apps/admin-web/src/modules/
"""
import sys
import argparse
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
MODULES_DIR = ROOT_DIR / "apps" / "admin-web" / "src" / "modules"

SUBDIRS = [
    "api", "components", "constants", "domain", "dto",
    "hooks", "mappers", "pages", "permissions", "repositories",
    "services", "store", "tests", "types", "utils", "validators"
]


def scaffold_module(module_name: str) -> None:
    target_dir = MODULES_DIR / module_name
    if target_dir.exists():
        print(f"Error: Module '{module_name}' already exists at {target_dir}")
        sys.exit(1)

    print(f"Scaffolding new module: {module_name}...")
    target_dir.mkdir(parents=True, exist_ok=True)

    for subdir in SUBDIRS:
        (target_dir / subdir).mkdir(exist_ok=True)
        # Touch .gitkeep
        (target_dir / subdir / ".gitkeep").touch()

    # Create module.json metadata
    module_json = f"""{{
  "id": "{module_name}",
  "name": "{module_name.capitalize()}",
  "version": "1.0.0",
  "enabled": true
}}
"""
    (target_dir / "module.json").write_text(module_json, encoding="utf-8")

    # Create index.ts export file
    index_ts = f"""/**
 * {module_name.capitalize()} Module Barrel Exports
 */
export * from "./types";
"""
    (target_dir / "types.ts").write_text(f"export interface {module_name.capitalize()}State {{}}\n", encoding="utf-8")
    (target_dir / "index.ts").write_text(index_ts, encoding="utf-8")

    print(f"✅ Module '{module_name}' successfully scaffolded at apps/admin-web/src/modules/{module_name}")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python scripts/scaffold_module.py <module_name>")
        sys.exit(1)

    scaffold_module(sys.argv[1])
