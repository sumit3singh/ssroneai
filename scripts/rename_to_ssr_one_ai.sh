#!/usr/bin/env bash
set -euo pipefail

DRY_RUN=1
ROOT_DIR="$(pwd)"
EXCLUDE_PATTERNS=("./dist" "./.venv" "./node_modules" "*/dist/*" "*/.venv/*" "*/node_modules/*")

usage() {
  cat <<EOF
Usage: $0 [--apply]

--apply    Actually perform replacements. Default is dry-run which only previews matches.
EOF
}

if [ "${1:-}" = "--apply" ]; then
  DRY_RUN=0
elif [ "${1:-}" = "--help" ] || [ "${1:-}" = "-h" ]; then
  usage
  exit 0
fi

# Build file list (tracked files if in git, else all files excluding patterns)
if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  FILES=$(git ls-files)
else
  # find regular files under cwd excluding binary directories
  FILES=$(find . -type f \
    ! -path "./dist/*" \
    ! -path "./.venv/*" \
    ! -path "./node_modules/*" \
    ! -path "*/dist/*" \
    ! -path "*/.venv/*" \
    ! -path "*/node_modules/*" \
    | sed 's|^\./||')
fi

# Narrow to text files by simple extension filter (common source/docs)
TEXT_FILES=$(echo "$FILES" | grep -Ei '\.(md|ts|tsx|js|jsx|json|html|css|scss|yml|yaml|txt)$' || true)

if [ -z "$TEXT_FILES" ]; then
  echo "No candidate text files found. Exiting."
  exit 0
fi

# Preview occurrences
echo "Scanning candidate files for occurrences..."

COUNT_BAITHAK=$(echo "$TEXT_FILES" | xargs -I{} grep -InH "Baithak" {} 2>/dev/null | wc -l || true)
COUNT_baithak=$(echo "$TEXT_FILES" | xargs -I{} grep -InH "\bbaithak\b" {} 2>/dev/null | wc -l || true)
COUNT_BAITHAK_UPPER=$(echo "$TEXT_FILES" | xargs -I{} grep -InH "BAITHAK" {} 2>/dev/null | wc -l || true)
COUNT_PREFIX=$(echo "$TEXT_FILES" | xargs -I{} grep -InH "baithak_" {} 2>/dev/null | wc -l || true)

echo "Occurrences found:"
echo "  'Baithak' (case-sensitive): $COUNT_BAITHAK"
echo "  'baithak' (word): $COUNT_baithak"
echo "  'BAITHAK' (upper): $COUNT_BAITHAK_UPPER"
echo "  'baithak_' (prefix): $COUNT_PREFIX"

if [ "$DRY_RUN" -eq 1 ]; then
  echo "\nDry-run complete. Run with --apply to perform replacements."
  exit 0
fi

# Perform replacements in order (uppercase, TitleCase, word-lowercase, prefix)
# 1) BAITHAK -> SSR ONE AI
perl -pi -e 's/\bBAITHAK\b/SSR ONE AI/g' $(echo "$TEXT_FILES") || true
# 2) Baithak -> SSR One AI (preserve TitleCase; we'll replace with desired Title Case 'SSR One AI')
perl -pi -e 's/\bBaithak\b/SSR One AI/g' $(echo "$TEXT_FILES") || true
# 3) baithak -> ssr-one-ai (slug)
perl -pi -e 's/\bbaithak\b/ssr-one-ai/g' $(echo "$TEXT_FILES") || true
# 4) baithak_ -> ssr_one_ai_
perl -pi -e 's/baithak_/ssr_one_ai_/g' $(echo "$TEXT_FILES") || true

# Final counts
FINAL_BAITHAK=$(echo "$TEXT_FILES" | xargs -I{} grep -InH "Baithak\|baithak\|BAITHAK" {} 2>/dev/null | wc -l || true)

echo "Replacements applied. Remaining matches (should be 0 or intentional exceptions): $FINAL_BAITHAK"

echo "Done. Please review changes and run tests/build."
