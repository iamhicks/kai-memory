#!/bin/bash

# Fix MIND app for Tauri - ONLY modify Ollama connection code

HTML_FILE="$1"

if [ -z "$HTML_FILE" ]; then
    echo "Usage: $0 <index.html>"
    exit 1
fi

# Create backup
cp "$HTML_FILE" "$HTML_FILE.bak"

# Add Tauri script after Phosphor icons
sed -i '' 's|<script src="https://unpkg.com/@phosphor-icons/web"></script>|<script src="https://unpkg.com/@phosphor-icons/web"></script>\n    <script src="https://unpkg.com/@tauri-apps/api@1.5.0/dist/index.umd.js"></script>|' "$HTML_FILE"

echo "Added Tauri API script"

# Replace testOllamaConnection function
sed -i '' 's|async testOllamaConnection() {|async testOllamaConnection() {\n                if (!window.__TAURI__) { return { success: false, error: "Not in Tauri" }; }|' "$HTML_FILE"

echo "Modified testOllamaConnection"

# The actual testOllamaConnection replacement needs more sophisticated handling
# For now, manual replacement of the fetch calls is needed

echo "Done! Some manual edits may still be needed."
