#!/usr/bin/env node

/**
 * Premium UI Migration Script
 * Automates the process of updating screens to use the new premium design system
 */

const fs = require('fs');
const path = require('path');

const SCREENS_DIR = './src/screens';
const COLORS_TO_REPLACE = {
  '#FFFFFF': 'PREMIUM_THEME.colors.text',
  '#fff': 'PREMIUM_THEME.colors.text',
  '#000': 'PREMIUM_THEME.colors.background',
  '#FF6B35': 'PREMIUM_THEME.colors.primary',
  '#004E89': 'PREMIUM_THEME.colors.secondary',
  '#27AE60': 'PREMIUM_THEME.colors.accent',
};

const SPACING_TO_REPLACE = {
  'marginBottom: 10': 'marginBottom: PREMIUM_THEME.spacing.xs',
  'marginBottom: 16': 'marginBottom: PREMIUM_THEME.spacing.md',
  'marginBottom: 20': 'marginBottom: PREMIUM_THEME.spacing.lg',
  'marginBottom: 32': 'marginBottom: PREMIUM_THEME.spacing.xl',
  'marginTop: 10': 'marginTop: PREMIUM_THEME.spacing.xs',
  'marginTop: 16': 'marginTop: PREMIUM_THEME.spacing.md',
  'marginTop: 20': 'marginTop: PREMIUM_THEME.spacing.lg',
  'paddingHorizontal: 16': 'paddingHorizontal: PREMIUM_THEME.spacing.md',
  'paddingVertical: 16': 'paddingVertical: PREMIUM_THEME.spacing.md',
};

const REQUIRED_IMPORTS = {
  'PremiumScreenWrapper': "import PremiumScreenWrapper from '../components/PremiumScreenWrapper';",
  'PremiumCard': "import PremiumCard from '../components/PremiumCard';",
  'PremiumButton': "import PremiumButton from '../components/PremiumButton';",
  'PREMIUM_THEME': "import { PREMIUM_THEME } from '../config/premiumTheme';",
};

let stats = {
  filesProcessed: 0,
  filesUpdated: 0,
  importsAdded: 0,
  colorsReplaced: 0,
  spacingReplaced: 0,
};

function addMissingImports(content) {
  let updated = false;
  
  Object.entries(REQUIRED_IMPORTS).forEach(([component, importLine]) => {
    // Check if component is used but not imported
    if (content.includes(component) && !content.includes(importLine)) {
      // Add import at the top after React/React Native imports
      const importRegex = /(import.*from ['"]react['"]\n)/;
      if (importRegex.test(content)) {
        content = content.replace(importRegex, `$1${importLine}\n`);
        stats.importsAdded++;
        updated = true;
      }
    }
  });
  
  return { content, updated };
}

function replaceColors(content) {
  let updated = false;
  let replacements = 0;
  
  Object.entries(COLORS_TO_REPLACE).forEach(([oldColor, newColor]) => {
    const regex = new RegExp(`color: ['"]${oldColor}['"]`, 'g');
    if (regex.test(content)) {
      content = content.replace(regex, `color: ${newColor}`);
      replacements++;
      updated = true;
    }
  });
  
  stats.colorsReplaced += replacements;
  return { content, updated };
}

function replaceSpacing(content) {
  let updated = false;
  let replacements = 0;
  
  Object.entries(SPACING_TO_REPLACE).forEach(([oldSpacing, newSpacing]) => {
    const regex = new RegExp(oldSpacing, 'g');
    if (regex.test(content)) {
      content = content.replace(regex, newSpacing);
      replacements++;
      updated = true;
    }
  });
  
  stats.spacingReplaced += replacements;
  return { content, updated };
}

function processScreen(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let anyUpdates = false;

    // Add missing imports
    let result = addMissingImports(content);
    content = result.content;
    if (result.updated) anyUpdates = true;

    // Replace hardcoded colors
    result = replaceColors(content);
    content = result.content;
    if (result.updated) anyUpdates = true;

    // Replace hardcoded spacing
    result = replaceSpacing(content);
    content = result.content;
    if (result.updated) anyUpdates = true;

    if (anyUpdates) {
      fs.writeFileSync(filePath, content);
      stats.filesUpdated++;
      console.log(`✅ Updated: ${path.relative('.', filePath)}`);
    } else {
      console.log(`⏭️  Skipped: ${path.relative('.', filePath)} (already compliant)`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

function walkDirectory(dir) {
  try {
    const files = fs.readdirSync(dir);
    
    files.forEach((file) => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !file.startsWith('.')) {
        walkDirectory(filePath);
      } else if (file.endsWith('.tsx') && !file.startsWith('.')) {
        stats.filesProcessed++;
        processScreen(filePath);
      }
    });
  } catch (error) {
    console.error(`Error walking directory ${dir}:`, error.message);
  }
}

function printSummary() {
  console.log('\n📊 Migration Summary:');
  console.log('═'.repeat(50));
  console.log(`📄 Files Processed:     ${stats.filesProcessed}`);
  console.log(`✏️  Files Updated:       ${stats.filesUpdated}`);
  console.log(`📦 Imports Added:       ${stats.importsAdded}`);
  console.log(`🎨 Colors Replaced:     ${stats.colorsReplaced}`);
  console.log(`📏 Spacing Replaced:    ${stats.spacingReplaced}`);
  console.log('═'.repeat(50));
  console.log('\n✅ Migration Complete! Review changes and commit.\n');
}

// Main execution
console.log('🚀 Starting Premium UI Migration...\n');

if (!fs.existsSync(SCREENS_DIR)) {
  console.error(`❌ Error: ${SCREENS_DIR} directory not found`);
  process.exit(1);
}

walkDirectory(SCREENS_DIR);
printSummary();