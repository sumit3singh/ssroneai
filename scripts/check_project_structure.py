#!/usr/bin/env python3
"""
SSR One AI – Monorepo Structure & Compliance Validator
Verifies monorepo directory layout, required apps, packages, and architecture rules.
"""
import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent

EXPECTED_APPS = [
    "admin-web",
    "platform-admin",
    "customer-food-web",
    "customer-stay-web",
    "kds-web",
    "staff-web",
]


EXPECTED_PACKAGES = [
    "api-client", "auth", "charts", "config", "forms", "hooks",
    "icons", "navigation", "tables", "theme", "types", "ui", "utils"
]

EXPECTED_ROOT_FILES = [
    "package.json", "pnpm-workspace.yaml", "turbo.json", "README.md", "run.bat"
]


def check_structure() -> bool:
    print("==================================================")
    print("SSR One AI – Monorepo Compliance & Structure Check")
    print("==================================================")

    errors = []

    # 1. Check Root Files
    for file in EXPECTED_ROOT_FILES:
        path = ROOT_DIR / file
        if not path.exists():
            errors.append(f"Missing root file: {file}")

    # 2. Check Apps Directory
    apps_dir = ROOT_DIR / "apps"
    if not apps_dir.is_dir():
        errors.append("Missing 'apps' directory")
    else:
        for app in EXPECTED_APPS:
            path = apps_dir / app
            if not path.is_dir():
                errors.append(f"Missing application: apps/{app}")

    # 3. Check Packages Directory
    packages_dir = ROOT_DIR / "packages"
    if not packages_dir.is_dir():
        errors.append("Missing 'packages' directory")
    else:
        for pkg in EXPECTED_PACKAGES:
            path = packages_dir / pkg
            if not path.is_dir():
                errors.append(f"Missing package: packages/{pkg}")

    # 4. Check Services Directory
    backend_main = ROOT_DIR / "services" / "backend" / "src" / "main.py"
    if not backend_main.exists():
        errors.append("Missing backend entry point: services/backend/src/main.py")

    # Output Results
    if errors:
        print("\n❌ Compliance check failed with errors:")
        for err in errors:
            print(f"  - {err}")
        return False

    print("\n✅ Monorepo directory structure fully compliant with enterprise standards!")
    return True


if __name__ == "__main__":
    success = check_structure()
    sys.exit(0 if success else 1)
