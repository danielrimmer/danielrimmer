#!/bin/bash

echo "=== CODE STRUCTURE ANALYSIS ==="
echo ""

echo "1. HTML File Analysis:"
echo "   index.html:"
grep -c "class=" index.html | xargs echo "   - Total elements with class: "
grep -c "id=" index.html | xargs echo "   - Total elements with id: "
grep -c "data-" index.html | xargs echo "   - Total data attributes: "
echo ""

echo "2. CSS File Analysis:"
echo "   - Total lines: $(wc -l < style.css)"
echo "   - Total CSS rules (. selectors): $(grep -c '^\.' style.css)"
echo "   - Total media queries: $(grep -c '@media' style.css)"
echo "   - RTL specific rules: $(grep -c '\[dir=\"rtl\"\]' style.css)"
echo "   - Animation keyframes: $(grep -c '@keyframes' style.css)"
echo ""

echo "3. JavaScript File Analysis:"
echo "   - Total lines: $(wc -l < script.js)"
echo "   - Total functions: $(grep -c 'function\|const.*=.*()' script.js)"
echo "   - Event listeners: $(grep -c 'addEventListener' script.js)"
echo "   - DOM queries: $(grep -c 'querySelector' script.js)"
echo ""

echo "4. Potential Issues Found:"
echo "   - Lines exceeding 120 chars in HTML:"
grep -n '.\{120,\}' index.html | wc -l | xargs echo "   Total: "
echo ""

echo "5. Asset References Check:"
echo "   - Image references in CSS:"
grep -o "url('[^']*')" style.css | wc -l | xargs echo "   Total: "
echo "   - Video references in HTML:"
grep -c '<source src="images/' index.html | xargs echo "   Total: "
echo "   - Image references in HTML:"
grep -c '<img src="images/' index.html | xargs echo "   Total: "
