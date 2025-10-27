#!/bin/bash

echo "=== DETAILED CODE QUALITY REPORT ==="
echo ""

echo "1. Checking for accessibility issues..."
echo "   - Checking for <img> tags without alt text:"
grep '<img' index.html | grep -v 'alt="' && echo "     ❌ FOUND" || echo "     ✓ All images have alt text"
echo ""

echo "2. Checking for proper semantic HTML..."
echo "   - Main element: $(grep -c '<main' index.html) found"
echo "   - Header element: $(grep -c '<header' index.html) found"
echo "   - Footer element: $(grep -c '<footer' index.html) found"
echo "   - Nav elements: $(grep -c '<nav' index.html) found"
echo "   - Section elements: $(grep -c '<section' index.html) found"
echo ""

echo "3. Checking for unused attributes or attributes..."
echo "   - Checking for inconsistent spacing/indentation:"
grep -E '^\s{1,3}<' index.html | wc -l | xargs echo "   Lines with 1-3 spaces indent:"
grep -E '^\s{4,7}<' index.html | wc -l | xargs echo "   Lines with 4-7 spaces indent:"
echo ""

echo "4. Checking for data attribute consistency..."
echo "   - Checking data-* attributes:"
grep -o 'data-[a-z-]*=' index.html | sort | uniq -c | sort -rn | head -10
echo ""

echo "5. Checking for version parameters..."
echo "   - CSS version: $(grep -o 'style.css?v=[^"]*' index.html)"
echo "   - JS version: $(grep -o 'script.js?v=[^"]*' index.html)"
echo "   - Logo version: $(grep -o 'logo-initials.svg?v=[^"]*' index.html | head -1)"
