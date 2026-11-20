#!/bin/bash
# PostToolUse hook: pasa por Prettier y ESLint los archivos React/JS/TS/Markdown escritos por Claude.
f=$(jq -r '.tool_input.file_path // empty')
[ -z "$f" ] || [ ! -f "$f" ] && exit 0

case "$f" in
  */node_modules/*|*/.next/*|*/references/*) exit 0 ;;
  *.tsx|*.jsx|*.ts|*.js|*.mjs|*.md) ;;
  *) exit 0 ;;
esac

cd "$CLAUDE_PROJECT_DIR" || exit 0

out=$(npx prettier --write "$f" 2>&1) || { echo "$out" >&2; exit 2; }
out=$(npx eslint --fix "$f" 2>&1) || { echo "$out" >&2; exit 2; }
exit 0
