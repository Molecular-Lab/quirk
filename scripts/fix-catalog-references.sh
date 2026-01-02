#!/bin/bash

# Script to replace PNPM catalog: references with actual versions for Vercel compatibility

echo "Replacing catalog: references with actual versions..."

# Define catalog mappings
declare -A catalog
catalog["@tanstack/react-query"]="5.90.5"
catalog["@ts-rest/core"]="^3.51.0"
catalog["@ts-rest/express"]="^3.51.0"
catalog["@types/eslint"]="^9.6.1"
catalog["@types/react"]="^19.0.7"
catalog["axios"]="1.13.1"
catalog["dayjs"]="^1.11.19"
catalog["eslint"]="^9.23.0"
catalog["postgres"]="^3.4.7"
catalog["prettier"]="^3.5.3"
catalog["react"]="^19.0.0"
catalog["tsx"]="^4.19.2"
catalog["typescript"]="5.8.3"
catalog["typescript-eslint"]="^8.32.0"
catalog["zod"]="3.25.76"

# Find all package.json files (excluding node_modules)
find . -name "package.json" -not -path "*/node_modules/*" | while read file; do
    echo "Processing $file"

    # Create a temp file
    temp_file=$(mktemp)

    # Replace catalog: references
    cp "$file" "$temp_file"

    for package in "${!catalog[@]}"; do
        version="${catalog[$package]}"
        # Escape special characters for sed
        escaped_package=$(echo "$package" | sed 's/[\/&]/\\&/g')
        escaped_version=$(echo "$version" | sed 's/[\/&]/\\&/g')

        # Replace "package": "catalog:" with "package": "version"
        sed -i.bak "s/\"$escaped_package\": \"catalog:\"/\"$escaped_package\": \"$escaped_version\"/g" "$temp_file"
    done

    # Only update if changes were made
    if ! cmp -s "$file" "$temp_file"; then
        mv "$temp_file" "$file"
        echo "  ✓ Updated $file"
    else
        rm "$temp_file"
        echo "  - No changes needed"
    fi

    # Remove backup file
    rm -f "${file}.bak"
done

echo "Done! All catalog: references have been replaced."
