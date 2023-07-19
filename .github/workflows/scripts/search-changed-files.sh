#!bin/bash

CHANGED_COOKBOOKS=()
HAS_NOTEBOOKS=false
for file in ${{ steps.changed-files.outputs.all_changed_files }}; do
if (grep -P "notebook:\s*true" $file); then
    HAS_NOTEBOOKS=true
    CHANGED_COOKBOOKS+=("$file")
fi
done
COOKBOOKS_STRING=$(echo ${CHANGED_COOKBOOKS[*]})
echo "has_notebooks=$HAS_NOTEBOOKS" >> "$GITHUB_OUTPUT"
echo "changed_cookbooks=$COOKBOOKS_STRING" >> "$GITHUB_OUTPUT"