// Test script for Rust WASM encryption module
// Run with: node test-wasm.js

const fs = require('fs');
const path = require('path');

async function testWasmModule() {
  console.log('🧪 Testing Rust WASM encryption module...\n');

  try {
    // Check if WASM files exist
    const wasmDir = path.join(__dirname, '../../../../public/wasm');
    const wasmFiles = ['financeai_encryption_bg.wasm', 'financeai_encryption.js'];
    
    console.log('📁 Checking WASM files...');
    for (const file of wasmFiles) {
      const filePath = path.join(wasmDir, file);
      if (fs.existsSync(filePath)) {
        console.log(`✅ ${file} exists`);
      } else {
        console.log(`❌ ${file} missing`);
        return false;
      }
    }

    console.log('\n✅ WASM files are ready for browser use');
    console.log('📝 To test in browser, check the browser console for:');
    console.log('   - "✅ Rust WASM encryption module loaded successfully"');
    console.log('   - Or "⚠️ Failed to load WASM module, falling back to Web Crypto API"');
    
    return true;
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
}

// Run the test
testWasmModule().then(success => {
  if (success) {
    console.log('\n🎉 WASM module is ready!');
  } else {
    console.log('\n💥 WASM module needs to be built first.');
    console.log('Run: cd apps/web/src/lib/wasm && ./build.sh');
  }
});