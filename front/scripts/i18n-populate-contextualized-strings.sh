#!/usr/bin/env -S bash -eux

# Typical use:
# cp -r locales old_locales
# ./scripts/i18n-extract.sh
# ./scripts/i18n-populate-contextualized-strings.sh old_locales locales
# Then review/commit the changes

cd "$(dirname $0)/.." # change into base directory

old_locales_dir=$1
new_locales_dir=$2

locales=$(tail -n +3 src/locales.ts | sed -E 's/^[^[]+\[] =//' | jq -r '.[].code')

# Generate .po files for each available language.
echo $locales
for lang in $locales; do
    echo "Fixing contexts for $lang…"
    old_po_file=$old_locales_dir/$lang/LC_MESSAGES/app.po
    new_po_file=$new_locales_dir/$lang/LC_MESSAGES/app.po
    python3 ./scripts/contextualize.py $old_po_file $new_po_file --no-dry-run
done;
