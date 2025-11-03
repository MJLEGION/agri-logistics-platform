// Premium UI Bulk Upgrade Script
// This script upgrades all remaining screens to use Modern components

const fs = require('fs');
const path = require('path');

const SCREENS_TO_UPGRADE = [
  { file: 'src/screens/shipper/ListCargoScreen.tsx', theme: 'green' },
  { file: 'src/screens/shipper/MyCargoScreen.tsx', theme: 'green' },
  { file: 'src/screens/shipper/CargoDetailsScreen.tsx', theme: 'green' },
  { file: 'src/screens/shipper/EditCargoScreen.tsx', theme: 'green' },
  { file: 'src/screens/shipper/ShipperActiveOrdersScreen.tsx', theme: 'green' },
  { file: 'src/screens/transporter/AvailableLoadsScreen.tsx', theme: 'orange' },
  { file: 'src/screens/transporter/ActiveTripsScreen.tsx', theme: 'orange' },
  { file: 'src/screens/transporter/TripTrackingScreen.tsx', theme: 'orange' },
  { file: 'src/screens/transporter/RoutePlannerScreen.tsx', theme: 'orange' },
  { file: 'src/screens/transporter/TransporterProfileScreen.tsx', theme: 'orange' },
  { file: 'src/screens/transporter/VehicleProfileScreen.tsx', theme: 'orange' },
  { file: 'src/screens/transporter/EarningsDashboardScreen.tsx', theme: 'orange' },
  { file: 'src/screens/transporter/TripHistoryScreen.tsx', theme: 'orange' },
  { file: 'src/screens/OrderTrackingScreen.tsx', theme: 'blue' },
];

const THEME_COLORS = {
  green: { orb1: '#27AE60', orb2: '#2ECC71' },
  orange: { orb1: '#F77F00', orb2: '#FCBF49' },
  blue: { orb1: '#0EA5E9', orb2: '#38BDF8' },
};

function addModernImports(content) {
  // Check if imports already exist
  if (content.includes('ModernCard') || content.includes('ModernButton')) {
    console.log('  ℹ️  Modern imports already present');
    return content;
  }

  // Find the last import statement
  const importLines = content.split('\n');
  let lastImportIndex = -1;

  for (let i = 0; i < importLines.length; i++) {
    if (importLines[i].trim().startsWith('import ')) {
      lastImportIndex = i;
    }
  }

  if (lastImportIndex === -1) {
    console.log('  ⚠️  No imports found');
    return content;
  }

  // Add Modern imports after last import
  const modernImports = [
    `import ModernCard from '../../components/ModernCard';`,
    `import ModernButton from '../../components/ModernButton';`,
    `import ModernStatCard from '../../components/ModernStatCard';`,
    `import { ModernColors, ModernGradients } from '../../config/ModernDesignSystem';`,
  ];

  importLines.splice(lastImportIndex + 1, 0, ...modernImports);
  return importLines.join('\n');
}

function wrapWithGradient(content, theme) {
  const colors = THEME_COLORS[theme];

  // Check if already wrapped
  if (content.includes('ModernGradients.background') || content.includes('backgroundPattern')) {
    console.log('  ℹ️  Already has gradient background');
    return content;
  }

  // Find the main return statement
  const returnMatch = content.match(/(return\s*\(\s*<View\s+style=\{[^}]+\}>)/);
  if (!returnMatch) {
    console.log('  ⚠️  Could not find return statement');
    return content;
  }

  const gradientWrapper = `return (
    <View style={styles.container}>
      <LinearGradient
        colors={ModernGradients.background}
        style={styles.gradient}
      >
        {/* Animated Background Orbs */}
        <View style={styles.backgroundPattern}>
          <View style={[styles.orb, styles.orb1]} />
          <View style={[styles.orb, styles.orb2]} />
        </View>

        <ScrollView`;

  // Replace the return opening
  content = content.replace(
    /return\s*\(\s*<View\s+style=\{[^}]+\}>\s*<ScrollView/,
    gradientWrapper
  );

  // Close the gradient and view wrappers at the end
  content = content.replace(
    /(<\/ScrollView>\s*<\/View>\s*\);)/,
    `</ScrollView>
      </LinearGradient>
    </View>
  );`
  );

  return content;
}

function updateStyles(content, theme) {
  const colors = THEME_COLORS[theme];

  // Check if styles already have Modern colors
  if (content.includes('ModernColors.background')) {
    console.log('  ℹ️  Styles already use ModernColors');
    return content;
  }

  // Find the styles const
  const stylesMatch = content.match(/(const styles = StyleSheet\.create\(\{[\s\S]*?\}\);)/);
  if (!stylesMatch) {
    console.log('  ⚠️  Could not find styles');
    return content;
  }

  let styles = stylesMatch[0];

  // Update container style
  styles = styles.replace(
    /container:\s*\{([^}]*)\}/,
    `container: {
    flex: 1,
    backgroundColor: ModernColors.background,
  }`
  );

  // Add new styles if not present
  if (!styles.includes('gradient:')) {
    const newStyles = `
  gradient: {
    flex: 1,
  },
  backgroundPattern: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 0,
  },
  orb: {
    position: 'absolute',
    borderRadius: 9999,
    opacity: 0.15,
  },
  orb1: {
    width: 300,
    height: 300,
    top: -150,
    left: -100,
    backgroundColor: '${colors.orb1}',
  },
  orb2: {
    width: 250,
    height: 250,
    bottom: -100,
    right: -80,
    backgroundColor: '${colors.orb2}',
  },`;

    styles = styles.replace('container: {', `container: {${newStyles}\n  `);
  }

  // Replace theme.text with ModernColors.textPrimary
  styles = styles.replace(/color:\s*theme\.text([^P])/g, 'color: ModernColors.textPrimary$1');
  styles = styles.replace(/color:\s*theme\.textSecondary/g, 'color: ModernColors.textSecondary');

  return content.replace(stylesMatch[0], styles);
}

function upgradeScreen(screenConfig) {
  const { file, theme } = screenConfig;
  const filePath = path.join(__dirname, file);

  console.log(`\n📝 Upgrading: ${file}`);

  if (!fs.existsSync(filePath)) {
    console.log(`  ❌ File not found: ${filePath}`);
    return false;
  }

  try {
    let content = fs.readFileSync(filePath, 'utf8');

    // Step 1: Add Modern imports
    console.log('  1️⃣  Adding Modern imports...');
    content = addModernImports(content);

    // Step 2: Wrap with gradient background
    console.log('  2️⃣  Wrapping with gradient background...');
    content = wrapWithGradient(content, theme);

    // Step 3: Update styles
    console.log('  3️⃣  Updating styles...');
    content = updateStyles(content, theme);

    // Write back
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`  ✅ Upgraded successfully!`);
    return true;

  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
    return false;
  }
}

// Main execution
console.log('🚀 Starting Premium UI Bulk Upgrade...\n');
console.log(`📊 Total screens to upgrade: ${SCREENS_TO_UPGRADE.length}\n`);

let upgraded = 0;
let failed = 0;
let skipped = 0;

for (const screen of SCREENS_TO_UPGRADE) {
  const result = upgradeScreen(screen);
  if (result === true) upgraded++;
  else if (result === false) failed++;
  else skipped++;
}

console.log('\n' + '='.repeat(60));
console.log('📈 UPGRADE SUMMARY');
console.log('='.repeat(60));
console.log(`✅ Upgraded: ${upgraded}`);
console.log(`❌ Failed: ${failed}`);
console.log(`ℹ️  Skipped: ${skipped}`);
console.log(`📊 Total: ${SCREENS_TO_UPGRADE.length}`);
console.log('='.repeat(60));

console.log('\n✨ Done! Please review the changes and manually upgrade:');
console.log('   - Replace Card components with ModernCard');
console.log('   - Replace buttons with ModernButton');
console.log('   - Replace stat cards with ModernStatCard');
console.log('   - Test each screen for functionality\n');
