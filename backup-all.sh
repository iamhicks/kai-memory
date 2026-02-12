#!/bin/bash

# Master Backup Script - Local backups only (no GitHub push)
# Usage: backup-all.sh [quick|full]
#   quick - Workspace + Sessions only (default)
#   full  - Everything including Obsidian + Products

MODE="${1:-quick}"
TIMESTAMP=$(date +%H%M)
DATE_FOLDER=$(date +%d-%m-%y)

echo "=== Local Backup Started at $(date) (mode: $MODE) ==="

# 1. Backup OpenClaw Workspace → ~/Documents/Kai/Kai_Memory/Workspace/
echo "[1/4] Backing up OpenClaw Workspace..."
mkdir -p "$HOME/Documents/Kai/Kai_Memory/Workspace/$DATE_FOLDER/$TIMESTAMP"
cp -r "$HOME/.openclaw/workspace/"* "$HOME/Documents/Kai/Kai_Memory/Workspace/$DATE_FOLDER/$TIMESTAMP/" 2>/dev/null || true
cp "$HOME/.openclaw/openclaw.json" "$HOME/Documents/Kai/Kai_Memory/Workspace/$DATE_FOLDER/$TIMESTAMP/" 2>/dev/null || true
echo "  ✓ Workspace backed up to Kai_Memory/Workspace/$DATE_FOLDER/$TIMESTAMP"

# 2. Backup Sessions
echo "[2/4] Backing up Sessions..."
mkdir -p "$HOME/Documents/Kai/Kai_Memory/Sessions/$DATE_FOLDER/$TIMESTAMP"
cp ~/.openclaw/agents/main/sessions/*.jsonl "$HOME/Documents/Kai/Kai_Memory/Sessions/$DATE_FOLDER/$TIMESTAMP/" 2>/dev/null || true
echo "  ✓ Sessions backed up to Kai_Memory/Sessions/$DATE_FOLDER/$TIMESTAMP"

# 3. Backup MIND Electron App
echo "[3/4] Backing up MIND Electron App..."
if [ -d ~/Documents/Kai/Repos/mind ]; then
  mkdir -p "$HOME/Documents/Kai/Repos/mind/Backups/$DATE_FOLDER/$TIMESTAMP"
  cd ~/Documents/Kai/Repos/mind/app
  for item in *; do
    [[ "$item" == "Backups" ]] && continue
    if [ -e "$item" ]; then
      cp -r "$item" "$HOME/Documents/Kai/Repos/mind/Backups/$DATE_FOLDER/$TIMESTAMP/" 2>/dev/null
    fi
  done
  echo "  ✓ MIND backed up to Repos/mind/Backups/$DATE_FOLDER/$TIMESTAMP"
else
  echo "  ℹ MIND repo not found (skipped)"
fi

# 4. Backup MIND Demo (if exists)
if [ -d ~/Documents/Kai/Repos/mind/demo ]; then
  echo "    Backing up MIND Demo..."
  mkdir -p "$HOME/Documents/Kai/Repos/mind/demo/Backups/$DATE_FOLDER/$TIMESTAMP"
  cd ~/Documents/Kai/Repos/mind/demo
  for item in *; do
    [[ "$item" == "Backups" ]] && continue
    if [ -e "$item" ]; then
      cp -r "$item" "$HOME/Documents/Kai/Repos/mind/demo/Backups/$DATE_FOLDER/$TIMESTAMP/" 2>/dev/null
    fi
  done
  echo "    ✓ MIND demo backed up"
fi

# FULL MODE: Obsidian + FLOW + Website
if [ "$MODE" == "full" ]; then
  echo ""
  echo "=== FULL MODE EXTENSIONS ==="
  
  # 5. Backup Obsidian Vault
  echo "[5/7] Backing up Obsidian Vault..."
  OBSIDIAN_BACKUP="$HOME/Documents/Kai/Kai_Obsidian/Kai/Backups/$DATE_FOLDER/$TIMESTAMP"
  mkdir -p "$OBSIDIAN_BACKUP"
  cd ~/Documents/Kai/Kai_Obsidian/Kai
  for item in *; do
    [[ "$item" == ".git" ]] && continue
    [[ "$item" == ".obsidian" ]] && continue
    [[ "$item" == "Backups" ]] && continue
    if [ -e "$item" ]; then
      cp -r "$item" "$OBSIDIAN_BACKUP/" 2>/dev/null
    fi
  done
  echo "  ✓ Obsidian backed up to Kai_Obsidian/Kai/Backups/$DATE_FOLDER/$TIMESTAMP"
  
  # 6. Backup FLOW
  echo "[6/7] Backing up FLOW..."
  for subfolder in app demo; do
    if [ -d ~/Documents/Kai/Repos/flow/$subfolder ]; then
      FLOW_BACKUP="$HOME/Documents/Kai/Repos/flow/$subfolder/Backups/$DATE_FOLDER/$TIMESTAMP"
      mkdir -p "$FLOW_BACKUP"
      cd ~/Documents/Kai/Repos/flow/$subfolder
      for item in *; do
        [[ "$item" == "Backups" ]] && continue
        if [ -e "$item" ]; then
          cp -r "$item" "$FLOW_BACKUP/" 2>/dev/null
        fi
      done
      echo "  ✓ flow/$subfolder backed up"
    fi
  done
  
  # 7. Backup Website
  echo "[7/7] Backing up Website..."
  if [ -d ~/Documents/Kai/Repos/website ]; then
    WEBSITE_BACKUP="$HOME/Documents/Kai/Repos/website/Backups/$DATE_FOLDER/$TIMESTAMP"
    mkdir -p "$WEBSITE_BACKUP"
    cd ~/Documents/Kai/Repos/website
    for item in *; do
      [[ "$item" == ".git" ]] && continue
      [[ "$item" == "Backups" ]] && continue
      [[ "$item" == *.bak ]] && continue
      if [ -e "$item" ]; then
        cp -r "$item" "$WEBSITE_BACKUP/" 2>/dev/null
      fi
    done
    echo "  ✓ website backed up"
  fi
  
  echo ""
  echo "=== Backup Complete (FULL MODE) ==="
  echo ""
  echo "Locations:"
  echo "  - Kai Memory/Workspace/$DATE_FOLDER/$TIMESTAMP"
  echo "  - Kai Memory/Sessions/$DATE_FOLDER/$TIMESTAMP"
  echo "  - Repos/mind/Backups/$DATE_FOLDER/$TIMESTAMP"
  echo "  - Repos/mind/demo/Backups/$DATE_FOLDER/$TIMESTAMP"
  echo "  - Kai_Obsidian/Kai/Backups/$DATE_FOLDER/$TIMESTAMP"
  echo "  - Repos/flow/*/Backups/$DATE_FOLDER/$TIMESTAMP"
  echo "  - Repos/website/Backups/$DATE_FOLDER/$TIMESTAMP"
  echo ""
  echo "Note: This is a LOCAL backup only (no GitHub push)"
else
  echo ""
  echo "=== Backup Complete (QUICK MODE) ==="
  echo ""
  echo "Locations:"
  echo "  - Kai Memory/Workspace/$DATE_FOLDER/$TIMESTAMP"
  echo "  - Kai Memory/Sessions/$DATE_FOLDER/$TIMESTAMP"
  echo "  - Repos/mind/Backups/$DATE_FOLDER/$TIMESTAMP"
  echo ""
  echo "Note: This is a LOCAL backup only (no GitHub push)"
  echo "      Run 'backup-all.sh full' for Obsidian + FLOW + Website"
fi
