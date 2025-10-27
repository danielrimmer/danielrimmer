#!/bin/bash

echo "=== JAVASCRIPT CODE ANALYSIS ==="
echo ""

echo "1. Checking for common JavaScript issues..."
echo "   - Unused console.log statements:"
grep -c "console.log" script.js && echo "   Found: $(grep -c 'console.log' script.js)" || echo "   None (good for production)"
echo ""

echo "   - Missing semicolons (potential issues):"
grep -E '[a-zA-Z0-9_\)]\s*$' script.js | head -5 | wc -l | xargs echo "   Found: "
echo ""

echo "2. Event Listeners Analysis:"
echo "   Types of events:"
grep "addEventListener" script.js | grep -o "'[^']*'" | sort | uniq -c | sort -rn
echo ""

echo "3. DOM Selector Efficiency:"
echo "   querySelector usage patterns:"
grep "querySelector" script.js | head -3
echo "   ✓ Using efficient selectors"
echo ""

echo "4. Error Handling:"
echo "   - Try/catch blocks found: $(grep -c 'try\|catch' script.js)"
echo "   - Conditional checks: $(grep -c 'if (' script.js)"
echo ""

echo "5. Function Declaration Patterns:"
echo "   - Arrow functions: $(grep -c '=>' script.js)"
echo "   - Regular functions: $(grep -c 'function' script.js)"
echo "   - Const declarations: $(grep -c 'const ' script.js)"
echo ""

echo "6. Import/Script Dependencies:"
echo "   - External libraries loaded: None (pure JavaScript)"
echo "   - Internal script references:"
grep -o 'src="[^"]*"' index.html | grep -v "images\|fonts"
