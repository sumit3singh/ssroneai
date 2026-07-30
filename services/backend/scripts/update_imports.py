import os
import re

REPLACEMENTS = {
    # Imports starting with "from "
    r"from src\.core\.feature_engine": "from src.engines.licensing",
    r"from src\.core\.rule_engine": "from src.engines.rules",
    r"from src\.core\.workflow": "from src.engines.workflow",
    r"from src\.modules\.hotel_pms": "from src.modules.hotel",
    r"from src\.modules\.hr": "from src.modules.hrmsms",
    r"from src\.modules\.search": "from src.engines.search",
    r"from src\.modules\.notifications": "from src.engines.notification",
    r"from src\.modules\.ai": "from src.ai.copilot",
    r"from src\.app\.": "from src.api.app.",
    r"from src\.shared\.celery_app": "from src.workers.celery_app",
    r"from src\.shared\.tasks": "from src.workers.tasks",

    # Imports starting with "import "
    r"import src\.core\.feature_engine": "import src.engines.licensing",
    r"import src\.core\.rule_engine": "import src.engines.rules",
    r"import src\.core\.workflow": "import src.engines.workflow",
    r"import src\.modules\.hotel_pms": "import src.modules.hotel",
    r"import src\.modules\.hr": "import src.modules.hrmsms",
    r"import src\.modules\.search": "import src.engines.search",
    r"import src\.modules\.notifications": "import src.engines.notification",
    r"import src\.modules\.ai": "import src.ai.copilot",
    r"import src\.app\.": "import src.api.app.",
    r"import src\.shared\.celery_app": "import src.workers.celery_app",
    r"import src\.shared\.tasks": "import src.workers.tasks",
}

def update_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    new_content = content
    for pattern, replacement in REPLACEMENTS.items():
        new_content = re.sub(pattern, replacement, new_content)

    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated: {filepath}")

def main():
    root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    print(f"Scanning directory: {root_dir}")
    for root, dirs, files in os.walk(root_dir):
        for file in files:
            if file.endswith('.py'):
                update_file(os.path.join(root, file))

if __name__ == '__main__':
    main()
