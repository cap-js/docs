#!bin/bash

NOTEBOOKS=()
CHANGED_COOKBOOKS=("${{ needs.build.outputs.changed_cookbooks }}")
while read mdfile nbfile; do
    if [[ " ${CHANGED_COOKBOOKS[*]} " =~ " $mdfile " ]]; then
    NOTEBOOKS+=("./notebooks/$nbfile")
    fi
done < "./notebooks/generated_notebooks"
NOTEBOOKS_STRING="${NOTEBOOKS[*]}"
echo "notebooks=$NOTEBOOKS_STRING" >> "$GITHUB_OUTPUT"