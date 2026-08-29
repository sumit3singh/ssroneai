#!/usr/bin/env python3
"""
SSR One AI – Dead Code & Scratch File Cleanup Script
Removes non-production scratch scripts, debug log files, and empty database placeholder folders.
"""
import os
import shutil
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent

FILES_TO_REMOVE = [
    ROOT_DIR / "scratch_alter_postgres.py",
    ROOT_DIR / "scratch_apply_migrations.py",
    ROOT_DIR / "services" / "backend" / "dbcount.py",
    ROOT_DIR / "services" / "backend" / "debug_create_cat.py",
    ROOT_DIR / "services" / "backend" / "test_asgi_post.py",
    ROOT_DIR / "services" / "backend" / "restaurant_category_fix_summary.md",
    ROOT_DIR / "services" / "backend" / "uvicorn_debug.log",
    ROOT_DIR / "scripts" / "copy_bg.py",
]

DIRS_TO_REMOVE = [
    ROOT_DIR / "tools" / "sandbox",
    ROOT_DIR / "database" / "functions",
    ROOT_DIR / "database" / "views",
    ROOT_DIR / "database" / "seed",
]

def main():
    print("==================================================")
    print("SSR One AI – Monorepo Cleanup & Optimization Tool")
    print("==================================================")
    
    removed_count = 0

    # 1. Remove specific scratch files
    for file_path in FILES_TO_REMOVE:
        if file_path.exists() and file_path.is_file():
            print(f"Removing scratch file: {file_path.relative_to(ROOT_DIR)}")
            file_path.unlink()
            removed_count += 1
        elif file_path.exists():
            print(f"Removing path: {file_path.relative_to(ROOT_DIR)}")
            shutil.rmtree(file_path, ignore_errors=True)
            removed_count += 1

    # 2. Remove specified empty or sandbox directories
    for dir_path in DIRS_TO_REMOVE:
        if dir_path.exists() and dir_path.is_dir():
            print(f"Removing directory: {dir_path.relative_to(ROOT_DIR)}")
            shutil.rmtree(dir_path, ignore_errors=True)
            removed_count += 1

    print("--------------------------------------------------")
    print(f"✅ Cleanup complete! Removed {removed_count} obsolete files/directories.")

if __name__ == "__main__":
    main()
