#!/bin/bash
find src -type f -name "*.tsx" | while read -r file; do
  sed -E -i '' "s/(^|['\" ])(-?)ml-/\1\2ms-/g" "$file"
  sed -E -i '' "s/(^|['\" ])(-?)mr-/\1\2me-/g" "$file"
  sed -E -i '' "s/(^|['\" ])pl-/\1ps-/g" "$file"
  sed -E -i '' "s/(^|['\" ])pr-/\1pe-/g" "$file"
  sed -E -i '' "s/(^|['\" ])border-l\b/\1border-s/g" "$file"
  sed -E -i '' "s/(^|['\" ])border-r\b/\1border-e/g" "$file"
  sed -E -i '' "s/(^|['\" ])border-l-/\1border-s-/g" "$file"
  sed -E -i '' "s/(^|['\" ])border-r-/\1border-e-/g" "$file"
  sed -E -i '' "s/(^|['\" ])text-left\b/\1text-start/g" "$file"
  sed -E -i '' "s/(^|['\" ])text-right\b/\1text-end/g" "$file"
  sed -E -i '' "s/(^|['\" ])left-/\1start-/g" "$file"
  sed -E -i '' "s/(^|['\" ])right-/\1end-/g" "$file"
  sed -E -i '' "s/(^|['\" ])rounded-l\b/\1rounded-s/g" "$file"
  sed -E -i '' "s/(^|['\" ])rounded-r\b/\1rounded-e/g" "$file"
  sed -E -i '' "s/(^|['\" ])rounded-l-/\1rounded-s-/g" "$file"
  sed -E -i '' "s/(^|['\" ])rounded-r-/\1rounded-e-/g" "$file"
done
