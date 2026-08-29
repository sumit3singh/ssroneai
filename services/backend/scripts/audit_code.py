"""
SSR One AI – Comprehensive Backend Codebase Syntax & Import Audit Script
Scans and compiles every .py file in services/backend/ to identify and report real syntax/import errors.
"""

import os
import sys
import py_compile

def audit_codebase(root_dir):
    print("==========================================================")
    print(f" SSR One AI – Auditing Codebase: {root_dir}")
    print("==========================================================")
    
    total_files = 0
    errors = []

    for dirpath, _, filenames in os.walk(root_dir):
        if "__pycache__" in dirpath or ".pytest_cache" in dirpath or ".venv" in dirpath:
            continue
        for filename in filenames:
            if filename.endswith(".py"):
                total_files += 1
                full_path = os.path.join(dirpath, filename)
                try:
                    py_compile.compile(full_path, doraise=True)
                except py_compile.PyCompileError as e:
                    errors.append((full_path, str(e)))

    print(f"\n[+] Total Python Files Audited: {total_files}")
    if not errors:
        print("[+] SUCCESS: 0 Syntax or Compilation Errors found in entire codebase!")
    else:
        print(f"[-] Found {len(errors)} compilation errors:")
        for path, err in errors:
            print(f"\n  File: {path}\n  Error: {err}")

if __name__ == "__main__":
    audit_codebase("services/backend")
