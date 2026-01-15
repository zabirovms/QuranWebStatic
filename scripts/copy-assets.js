const fs = require('fs');
const path = require('path');

// Source directories (Flutter assets)
const sourceBase = path.join(__dirname, '..', '..', 'assets');
const destBase = path.join(__dirname, '..', 'public');

// Directories to copy
const dirsToCopy = [
  { source: 'images', dest: 'images' },
  { source: 'icons', dest: 'icons' },
  { source: 'fonts', dest: 'fonts' },
  { source: 'surah-names-svg', dest: 'surah-names-svg' },
];

/**
 * Recursively copy directory
 */
function copyDirectory(source, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(source, { withFileTypes: true });

  for (const entry of entries) {
    const sourcePath = path.join(source, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(sourcePath, destPath);
    } else {
      fs.copyFileSync(sourcePath, destPath);
      console.log(`✓ Copied ${path.relative(sourceBase, sourcePath)}`);
    }
  }
}

console.log('Copying assets...\n');

// Copy each directory
dirsToCopy.forEach(({ source, dest }) => {
  const sourceDir = path.join(sourceBase, source);
  const destDir = path.join(destBase, dest);

  if (fs.existsSync(sourceDir)) {
    console.log(`Copying ${source}...`);
    copyDirectory(sourceDir, destDir);
    console.log(`✓ Completed ${source}\n`);
  } else {
    console.warn(`⚠ Directory not found: ${source}\n`);
  }
});

console.log('Assets copied successfully!');


