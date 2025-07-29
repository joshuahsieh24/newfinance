#!/bin/bash

# Build script for Rust WASM encryption module

set -e

echo "🔧 Building Rust WASM encryption module..."

# Check if wasm-pack is installed
if ! command -v wasm-pack &> /dev/null; then
    echo "❌ wasm-pack not found. Installing..."
    cargo install wasm-pack
fi

# Build the WASM module
echo "📦 Building with wasm-pack..."
wasm-pack build --target web --out-dir ../../../../public/wasm

echo "✅ WASM module built successfully!"
echo "📁 Output files:"
ls -la ../../../../public/wasm/