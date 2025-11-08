#!/usr/bin/env node

/**
 * Clean Console Logs Script
 * Removes or replaces console.log statements with professional logging
 *
 * Usage: node scripts/cleanConsoleLogs.js
 */

const fs = require('fs');
const path = require('path');

// Directories to scan
const SCAN_DIRS = [
  'src/screens',
  'src/services',
  'src/components'
];

// Patterns to remove (debugging statements)
const REMOVE_PATTERNS = [
  /console\.log\(['"]🔍.*?\);?\s*\n/g,
  /console\.log\(['"]📦.*?\);?\s*\n/g,
  /console\.log\(['"]🚚.*?\);?\s*\n/g,
  /console\.log\(['"]✅.*?\);?\s*\n/g,
  /console\.log\(['"]⚠️.*?\);?\s*\n/g,
  /console\.log\(['"]TEMP.*?\);?\s*\n/g,
  /console\.log\(['"]DEBUG.*?\);?\s*\n/gi,
  /console\.log\(['"]Testing.*?\);?\s*\n/gi,
  /\/\/ TODO: Remove this console\.log.*?\n/g,
];

// Patterns to keep (important errors/warnings)
const KEEP_PATTERNS = [
  'console.error',
  'console.warn'
];

let totalFiles = 0;
let totalLinesRemoved = 0;
let filesModified = 0;

/**
 * Check if line should be kept
 */
function shouldKeepLine(line) {
  // Keep error and warning logs
  if (KEEP_PATTERNS.some(pattern => line.includes(pattern))) {
    return true;
  }

  // Remove debugging console.logs
  if (line.trim().startsWith('console.log')) {
    return false;
  }

  return true;
}

/**
 * Clean a single file
 */
function cleanFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    const originalLines = content.split('\n').length;

    // Remove debug console.log patterns
    REMOVE_PATTERNS.forEach(pattern => {
      content = content.replace(pattern, '');
    });

    // Remove standalone console.log lines
    const lines = content.split('\n');
    const cleanedLines = lines.filter(shouldKeepLine);
    content = cleanedLines.join('\n');

    const newLines = content.split('\n').length;
    const linesRemoved = originalLines - newLines;

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Cleaned: ${path.relative(process.cwd(), filePath)} (-${linesRemoved} lines)`);
      filesModified++;
      totalLinesRemoved += linesRemoved;
      return true;
    }

    return false;
  } catch (error) {
    console.error(`❌ Error cleaning ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Recursively scan directory
 */
function scanDirectory(dir) {
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        // Skip node_modules and hidden directories
        if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
          scanDirectory(fullPath);
        }
      } else if (entry.isFile()) {
        // Only process TypeScript and JavaScript files
        if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx') ||
            entry.name.endsWith('.js') || entry.name.endsWith('.jsx')) {
          totalFiles++;
          cleanFile(fullPath);
        }
      }
    }
  } catch (error) {
    console.error(`❌ Error scanning ${dir}:`, error.message);
  }
}

/**
 * Main execution
 */
function main() {
  console.log('🧹 Starting console.log cleanup...\n');

  const startTime = Date.now();

  SCAN_DIRS.forEach(dir => {
    const fullPath = path.join(process.cwd(), dir);
    if (fs.existsSync(fullPath)) {
      console.log(`📂 Scanning: ${dir}`);
      scanDirectory(fullPath);
    } else {
      console.warn(`⚠️  Directory not found: ${dir}`);
    }
  });

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log('\n' + '='.repeat(50));
  console.log('📊 Cleanup Summary:');
  console.log(`   Files scanned: ${totalFiles}`);
  console.log(`   Files modified: ${filesModified}`);
  console.log(`   Lines removed: ${totalLinesRemoved}`);
  console.log(`   Time elapsed: ${elapsed}s`);
  console.log('='.repeat(50));

  if (filesModified > 0) {
    console.log('\n✅ Console log cleanup completed successfully!');
    console.log('💡 Note: console.error and console.warn statements were preserved.');
  } else {
    console.log('\n✨ No console.log statements found to clean!');
  }
}

main();
