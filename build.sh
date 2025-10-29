#!/bin/bash
# Simple build script to minify CSS and JS for production
# This script creates minified versions without modifying originals

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "🔨 Building production assets..."
echo ""

# Minify CSS
echo "📦 Minifying CSS..."
python3 << 'PYTHON_SCRIPT'
import re

def minify_css(css):
    # Remove comments
    css = re.sub(r'/\*[^*]*\*+(?:[^/*][^*]*\*+)*/', '', css)
    # Remove whitespace around operators
    css = re.sub(r'\s*([{}:;,>+~])\s*', r'\1', css)
    # Remove whitespace before !important
    css = re.sub(r'\s+!important', '!important', css)
    # Remove last semicolon before closing brace
    css = re.sub(r';\s*}', '}', css)
    # Collapse multiple spaces
    css = re.sub(r'\s+', ' ', css)
    return css.strip()

with open('style.css', 'r') as f:
    original = f.read()

minified = minify_css(original)

with open('style.min.css', 'w') as f:
    f.write(minified)

original_size = len(original)
minified_size = len(minified)
savings = original_size - minified_size
percent = (savings / original_size) * 100

print(f"✓ style.css ({original_size:,} bytes) → style.min.css ({minified_size:,} bytes)")
print(f"  Savings: {savings:,} bytes ({percent:.1f}% reduction)")
PYTHON_SCRIPT

echo ""

# Minify JavaScript
echo "📦 Minifying JavaScript..."
python3 << 'PYTHON_SCRIPT'
import re

def minify_js(js):
    # Remove single-line comments
    js = re.sub(r'//.*?$', '', js, flags=re.MULTILINE)
    # Remove multi-line comments
    js = re.sub(r'/\*[\s\S]*?\*/', '', js)
    # Remove unnecessary whitespace around operators
    js = re.sub(r'\s*([{}()[\];:,=+\-*/%<>!&|?])\s*', r'\1', js)
    # Collapse multiple spaces
    js = re.sub(r'  +', '', js)
    # Remove newlines (but keep structure)
    js = re.sub(r'\n+', '\n', js)
    return js.strip()

with open('script.js', 'r') as f:
    original = f.read()

minified = minify_js(original)

with open('script.min.js', 'w') as f:
    f.write(minified)

original_size = len(original)
minified_size = len(minified)
savings = original_size - minified_size
percent = (savings / original_size) * 100

print(f"✓ script.js ({original_size:,} bytes) → script.min.js ({minified_size:,} bytes)")
print(f"  Savings: {savings:,} bytes ({percent:.1f}% reduction)")
PYTHON_SCRIPT

echo ""
echo "✅ Build complete!"
echo ""
echo "To use minified assets in production:"
echo "  1. Update index.html: change 'style.css' → 'style.min.css'"
echo "  2. Update index.html: change 'script.js' → 'script.min.js'"
echo "  3. Update he.html: same changes"
echo ""
echo "⚠️  Keep original files for development"
