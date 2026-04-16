#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "==> Linting"
cd "$ROOT_DIR"
npm run lint

echo
echo "==> Server tests"
cd "$ROOT_DIR/server"
npm test

echo
echo "==> Client tests"
cd "$ROOT_DIR/client"
npm test

echo
echo "==> Flutter tests"
cd "$ROOT_DIR/flutter_client"
flutter test

echo
echo "All checks passed."
