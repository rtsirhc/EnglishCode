#!/bin/zsh
cd "$(dirname "$0")" || exit 1

export NVM_DIR="$HOME/.nvm"
if [ -s "$NVM_DIR/nvm.sh" ]; then
  source "$NVM_DIR/nvm.sh"
fi

export PATH="$HOME/.nvm/versions/node/v24.13.1/bin:/opt/homebrew/bin:/usr/local/bin:$PATH"

echo ""
echo "Starting English World Cup..."
echo ""

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js was not found. Open this folder in Codex and ask me to reinstall the project dependencies."
  echo ""
  echo "Press any key to close this window."
  read -k 1
  exit 1
fi

if [ ! -f "dist/index.html" ]; then
  if ! command -v npm >/dev/null 2>&1; then
    echo "The game build is missing, and npm was not found to rebuild it."
    echo ""
    echo "Press any key to close this window."
    read -k 1
    exit 1
  fi
  npm run build
fi

node scripts/serve-built.mjs

echo ""
echo "The game server stopped. Press any key to close this window."
read -k 1
