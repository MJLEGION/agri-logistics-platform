// Complete Premium UI Upgrade - Final transformation script
const fs = require('fs');
const path = require('path');

const SCREENS_TO_COMPLETE = [
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

function addLinearGradientImport(content) {
  if (content.includes('LinearGradient')) {
    return content;
  }

  // Find React Native imports
  const rnImportMatch = content.match(/import\s+\{[^}]+\}\s+from\s+['"]react-native['"]/);
  if (rnImportMatch) {
    const insertPos = content.indexOf(rnImportMatch[0]) + rnImportMatch[0].length;
    return content.slice(0, insertPos) +
      "\nimport { LinearGradient } from 'expo-linear-gradient';" +
      content.slice(insertPos);
  }

  return content;
}

function wrapWithGradient(content) {
  // Check if already wrapped
  if (content.includes('ModernGradients.background') && content.includes('backgroundPattern')) {
    console.log('  ℹ️  Already has gradient wrapper');
    return content;
  }

  // Find return statement with View container
  const returnPatterns = [
    /return\s*\(\s*<View\s+style=\{\[styles\.container,\s*\{\s*backgroundColor:\s*theme\.background\s*\}\]\}>/,
    /return\s*\(\s*<View\s+style=\{styles\.container\}>/,
    /return\s*\(\s*<ScrollView/,
  ];

  let matched = false;
  for (const pattern of returnPatterns) {
    if (pattern.test(content)) {
      matched = true;

      // Replace with gradient wrapper
      content = content.replace(
        pattern,
        `return (
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

        <ScrollView showsVerticalScrollIndicator={false}>`
      );

      // Find and close the wrapper - look for final closing tags before );
      const closingMatch = content.match(/([ ]*)<\/(ScrollView|View)>\s*<\/View>\s*\);/);
      if (closingMatch) {
        content = content.replace(
          /([ ]*)<\/(ScrollView|View)>\s*<\/View>\s*\);/,
          `$1</ScrollView>
      </LinearGradient>
    </View>
  );`
        );
      }
      break;
    }
  }

  if (!matched) {
    console.log('  ⚠️  Could not find return pattern to wrap');
  }

  return content;
}

function replaceCardComponents(content) {
  // Replace <Card> with <ModernCard variant="elevated">
  content = content.replace(/<Card>/g, '<ModernCard variant="elevated">');
  content = content.replace(/<\/Card>/g, '</ModernCard>');

  // Replace Card components that are imported
  content = content.replace(/import\s+\{\s*Card\s*\}\s+from\s+['"][^'"]+['"]/g,
    '// Card import removed - using ModernCard');

  return content;
}

function replaceSimpleButtons(content) {
  // Pattern: Simple button with backgroundColor: theme.primary
  const buttonPattern = /<TouchableOpacity\s+style=\{\[styles\.([\w]+),\s*\{\s*backgroundColor:\s*theme\.(primary|error|success|secondary)\s*\}\]\}\s+onPress=\{([^}]+)\}>\s*<Text[^>]*>([^<]+)<\/Text>\s*<\/TouchableOpacity>/g;

  content = content.replace(buttonPattern, (match, styleName, variant, onPress, text) => {
    const variantMap = {
      primary: 'primary',
      error: 'danger',
      success: 'primary',
      secondary: 'secondary'
    };

    return `<ModernButton
            title="${text.trim()}"
            variant="${variantMap[variant] || 'primary'}"
            onPress={${onPress}}
            style={styles.${styleName}}
          />`;
  });

  return content;
}

function replaceThemeColors(content) {
  // Replace theme.text with ModernColors.textPrimary
  content = content.replace(/color:\s*theme\.text([^P\w])/g, 'color: ModernColors.textPrimary$1');
  content = content.replace(/color:\s*theme\.textSecondary/g, 'color: ModernColors.textSecondary');

  return content;
}

function completeScreen(screenConfig) {
  const { file, theme } = screenConfig;
  const filePath = path.join(__dirname, file);

  console.log(`\n📝 Completing: ${file}`);

  if (!fs.existsSync(filePath)) {
    console.log(`  ❌ File not found`);
    return false;
  }

  try {
    let content = fs.readFileSync(filePath, 'utf8');

    console.log('  1️⃣  Adding LinearGradient import...');
    content = addLinearGradientImport(content);

    console.log('  2️⃣  Wrapping with gradient background...');
    content = wrapWithGradient(content);

    console.log('  3️⃣  Replacing Card components...');
    content = replaceCardComponents(content);

    console.log('  4️⃣  Replacing button components...');
    content = replaceSimpleButtons(content);

    console.log('  5️⃣  Replacing theme colors...');
    content = replaceThemeColors(content);

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`  ✅ Completed!`);
    return true;

  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
    return false;
  }
}

// Main execution
console.log('🚀 Completing Premium UI Upgrade...\n');
console.log(`📊 Screens to complete: ${SCREENS_TO_COMPLETE.length}\n`);

let completed = 0;
let failed = 0;

for (const screen of SCREENS_TO_COMPLETE) {
  const result = completeScreen(screen);
  if (result) completed++;
  else failed++;
}

console.log('\n' + '='.repeat(60));
console.log('📈 COMPLETION SUMMARY');
console.log('='.repeat(60));
console.log(`✅ Completed: ${completed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`📊 Total: ${SCREENS_TO_COMPLETE.length}`);
console.log('='.repeat(60));

console.log('\n✨ Done! Please manually verify:');
console.log('   - Complex buttons may need manual replacement');
console.log('   - Check that all screens display correctly');
console.log('   - Test navigation and functionality\n');
