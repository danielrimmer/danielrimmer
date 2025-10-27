#!/bin/bash

echo "=== HTML Code Quality Check ==="
echo ""

echo "1. Checking for unclosed tags..."
for file in index.html he.html; do
  echo "File: $file"
  # Basic check for common issues
  grep -c "<video" "$file" && echo "  Video tags: $(grep -c '<video' $file)" && echo "  Video closes: $(grep -c '</video>' $file)"
  grep -c "<section" "$file" && echo "  Section opens: $(grep -c '<section' $file)" && echo "  Section closes: $(grep -c '</section>' $file)"
  grep -c "<article" "$file" && echo "  Article opens: $(grep -c '<article' $file)" && echo "  Article closes: $(grep -c '</article>' $file)"
  echo ""
done

echo "2. Checking for duplicate IDs..."
grep -o 'id="[^"]*"' index.html | sort | uniq -d && echo "Found duplicates" || echo "No duplicate IDs found"
echo ""

echo "3. Checking for unquoted attributes..."
grep -E ' (src|href|alt|class|id)=[^"]' index.html | head -5 && echo "WARNING: Found unquoted attributes" || echo "All attributes properly quoted"
echo ""

echo "4. Checking for missing alt text on images..."
grep '<img' index.html | grep -v 'alt=' && echo "WARNING: Found images without alt text" || echo "All images have alt text"
echo ""

echo "5. Checking for proper encoding..."
file index.html he.html
echo ""

echo "6. Checking for syntax errors in data attributes..."
grep -E 'data-[a-z]+=' index.html | head -3
