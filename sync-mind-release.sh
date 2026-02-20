#!/bin/bash
# Sync mind-dev to mind repo for release

set -e

echo "🔄 Syncing mind-dev to mind repo..."

DEV_DIR="$HOME/Documents/Kai/Repos/mind-dev"
REPO_DIR="$HOME/Documents/Kai/Repos/mind"
TIMESTAMP=$(date +"%H%M")

cd "$REPO_DIR"

# Create backup of current state
echo "  → Creating backup..."
git add -A 2>/dev/null || true
git stash 2>/dev/null || true

# Clean repo (keep .git and essential files)
echo "  → Cleaning old files..."
find . -maxdepth 1 -not -path "./.git" -not -path "." -exec rm -rf {} \; 2>/dev/null || true

# Copy new files from dev
echo "  → Copying from mind-dev..."
cp -r "$DEV_DIR"/* .

# Ensure .gitignore exists
cat > .gitignore <> 'EOF'
node_modules/
data/
.DS_Store
*.log
*.backup*
.vscode/
.idea/
EOF

echo "✅ Sync complete!"
echo ""
echo "Next steps:"
echo "  1. Review changes: cd $REPO_DIR && git status"
echo "  2. Commit: git add -A && git commit -m 'Release: v1.0 with advisor system'"
echo "  3. Push: git push origin main"
