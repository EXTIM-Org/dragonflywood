#!/bin/bash
set -e

cd /home/hach/E-Commerce
export PATH="/opt/node-v22.23.3-linux-x64/bin:$PATH"

# Unlink public/uploads symlink so Turbopack doesn't panic on external symlinks
if [ -L public/uploads ]; then
    rm -f public/uploads
fi

cleanup() {
    ln -sf /var/lib/extim-ecommerce/uploads public/uploads
}
trap cleanup EXIT INT TERM

echo "===> Starting Next.js Turbopack build..."
node -e "require('fs').rmSync('.next', {recursive:true, force:true})"
./node_modules/.bin/next build

echo "===> Build completed successfully!"
