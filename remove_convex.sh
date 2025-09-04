#!/bin/bash

echo "Removing Convex from the codebase..."

# Remove Convex directories and files
echo "Removing Convex files and directories..."
rm -rf convex/
rm -f convex_rules.md

# Remove Convex dependency from package.json
echo "Updating package.json..."
node -e "
const fs = require('fs');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

// Remove Convex dependency
delete packageJson.dependencies['convex'];

fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
"

# Remove package-lock.json to force regeneration
echo "Removing package-lock.json..."
rm -f package-lock.json

echo "Convex removed successfully!"
echo "Run 'npm install' to update dependencies"
