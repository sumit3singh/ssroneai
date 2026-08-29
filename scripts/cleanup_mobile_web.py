#!/usr/bin/env python3
"""
SSR One AI – Cleanup Script for Deprecated mobile-web Application
Deletes the legacy apps/mobile-web directory if present.
"""
import shutil
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
MOBILE_WEB_DIR = ROOT_DIR / "apps" / "mobile-web"

def cleanup():
    if MOBILE_WEB_DIR.exists():
        print(f"Removing deprecated directory: {MOBILE_WEB_DIR}")
        shutil.rmtree(MOBILE_WEB_DIR, ignore_errors=True)
        print("✅ Cleanup complete.")
    else:
        print("ℹ️ apps/mobile-web directory does not exist.")

if __name__ == "__main__":
    cleanup()
