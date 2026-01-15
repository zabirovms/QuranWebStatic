const fs = require('fs');
const path = require('path');

console.log('Starting asset and data copy...\n');

// Run both copy scripts
require('./copy-data.js');
console.log('\n');
require('./copy-assets.js');

console.log('\n✅ All files copied successfully!');


