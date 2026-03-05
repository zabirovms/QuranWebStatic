#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const src = path.join(process.cwd(), 'app', 'globals.css');
const dest = path.join(process.cwd(), 'public', 'globals.css');
fs.copyFileSync(src, dest);
console.log('Copied app/globals.css to public/globals.css for async load');
