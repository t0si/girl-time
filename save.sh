#!/bin/bash
# Back up girl time: the website (public repo) and the iOS app (private repo).
# Usage:  ./save.sh "what you changed"
MSG="${1:-update}"
cd "$(dirname "$0")" || exit 1
git add -A
if git commit -q -m "$MSG" >/dev/null 2>&1; then git push -q && echo "✅ website saved"; else echo "· website: nothing new"; fi
cd ios || exit 1
git add -A
if git commit -q -m "$MSG" >/dev/null 2>&1; then git push -q && echo "✅ iOS app saved (private)"; else echo "· iOS app: nothing new"; fi
