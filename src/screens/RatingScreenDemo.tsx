/**
 * 🌟 Rating Screen Demo/Test Component
 * 
 * Use this to quickly test the rating functionality without completing a full trip.
 * 
 * Add to your navigation:
 * <Stack.Screen name="RatingDemo" component={RatingScreenDemo} />
 * 
 * Then navigate to it with:
 * navigation.navigate('RatingDemo')
 */

import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { showToast } from '../services/toastService';

interface TestScenario {
  name: string;
  params: {
    transactionId: string;
    transporterId: string;
    transporterName: string;
    farmerId: string;
    farmerName: string;
  };
}

const testScenarios: TestScenario[] = [
  {
    name: 'John\'s Transport - Banana Delivery',
    params: {
      transactionId: 'txn-' + Date.now().toString(),
      transporterId: 'trans-001',
      transporterName: 'John\'s Transport',
      farmerId: 'farmer-001',
      farmerName: 'Demo Farmer',
    },
  },
  {
    name: 'Express Logistics - Coffee Shipment',
    params: {
      transactionId: 'txn-' + (Date.now() + 1).toString(),
      transporterId: 'trans-002',
      transporterName: 'Express Logistics',
      farmerId: 'farmer-002',
      farmerName: 'Test User',
    },
  },
  {
    name: 'Mountain Routes - Vegetable Transport',
    params: {
      transactionId: 'txn-' + (Date.now() + 2).toString(),
      transporterId: 'trans-003',
      transporterName: 'Mountain Routes',
      farmerId: 'farmer-003',
      farmerName: 'Agriculture Demo',
    },
  },
];

export default function RatingScreenDemo() {
  const navigation = useNavigation();
  const [customParams, setCustomParams] = useState({
    transporterName: '',
    transporterId: '',
  });

  const handleLaunchRating = (params: TestScenario['params']) => {
    navigation.navigate('Rating' as never, params as never);
  };

  const handleCustomRating = () => {
    if (!customParams.transporterName.trim() || !customParams.transporterId.trim()) {
      showToast.error('Please fill in all fields');
      return;
    }

    const params = {
      transactionId: 'txn-custom-' + Date.now().toString(),
      transporterId: customParams.transporterId,
      transporterName: customParams.transporterName,
      farmerId: 'demo-farmer-' + Date.now().toString(),
      farmerName: 'Demo Farmer',
    };

    handleLaunchRating(params);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>⭐ Rating System Test</Text>
        <Text style={styles.subtitle}>Quick access to test the rating feature</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Pre-defined Test Scenarios */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Quick Test Scenarios</Text>
          <Text style={styles.sectionSubtitle}>
            Click any scenario to test the rating screen
          </Text>

          {testScenarios.map((scenario, index) => (
            <TouchableOpacity
              key={index}
              style={styles.scenarioCard}
              onPress={() => handleLaunchRating(scenario.params)}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`Test scenario: ${scenario.name}`}
              accessibilityHint={`Launch rating screen for ${scenario.params.transporterName}`}
            >
              <View style={styles.scenarioContent}>
                <Ionicons name="star" size={20} color="#FFD700" />
                <View style={styles.scenarioText}>
                  <Text style={styles.scenarioTitle}>{scenario.name}</Text>
                  <Text style={styles.scenarioDetails}>
                    ID: {scenario.params.transporterId}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Custom Rating Test */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔧 Custom Test</Text>
          <Text style={styles.sectionSubtitle}>
            Create your own test scenario
          </Text>

          <View style={styles.customForm}>
            <Text style={styles.label}>Transporter Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter transporter name"
              value={customParams.transporterName}
              onChangeText={(text) =>
                setCustomParams({ ...customParams, transporterName: text })
              }
              placeholderTextColor="#999"
            />

            <Text style={styles.label}>Transporter ID</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter transporter ID"
              value={customParams.transporterId}
              onChangeText={(text) =>
                setCustomParams({ ...customParams, transporterId: text })
              }
              placeholderTextColor="#999"
            />

            <TouchableOpacity
              style={styles.customButton}
              onPress={handleCustomRating}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Test custom rating"
              accessibilityHint="Launch rating screen with custom transporter details"
            >
              <Text style={styles.customButtonText}>Test Custom Rating</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ℹ️ About This Test</Text>
          
          <View style={styles.infoBox}>
            <View style={styles.infoBullet}>
              <Text style={styles.bulletNumber}>1</Text>
              <Text style={styles.bulletText}>
                Click a scenario above to launch the rating screen
              </Text>
            </View>
            
            <View style={styles.infoBullet}>
              <Text style={styles.bulletNumber}>2</Text>
              <Text style={styles.bulletText}>
                Select 1-5 stars for your rating
              </Text>
            </View>
            
            <View style={styles.infoBullet}>
              <Text style={styles.bulletNumber}>3</Text>
              <Text style={styles.bulletText}>
                Optionally add a comment (0-1000 characters)
              </Text>
            </View>
            
            <View style={styles.infoBullet}>
              <Text style={styles.bulletNumber}>4</Text>
              <Text style={styles.bulletText}>
                Click "Submit" to save your rating
              </Text>
            </View>
          </View>
        </View>

        {/* What Gets Tested */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✅ What This Tests</Text>
          
          <View style={styles.featureList}>
            <View style={styles.feature}>
              <Ionicons name="checkmark-circle" size={20} color="#10797D" />
              <Text style={styles.featureText}>Rating submission</Text>
            </View>
            
            <View style={styles.feature}>
              <Ionicons name="checkmark-circle" size={20} color="#10797D" />
              <Text style={styles.featureText}>Star selection UI</Text>
            </View>
            
            <View style={styles.feature}>
              <Ionicons name="checkmark-circle" size={20} color="#10797D" />
              <Text style={styles.featureText}>Comment input & validation</Text>
            </View>
            
            <View style={styles.feature}>
              <Ionicons name="checkmark-circle" size={20} color="#10797D" />
              <Text style={styles.featureText}>Service integration</Text>
            </View>
            
            <View style={styles.feature}>
              <Ionicons name="checkmark-circle" size={20} color="#10797D" />
              <Text style={styles.featureText}>Navigation flow</Text>
            </View>
          </View>
        </View>

        {/* Debug Info */}
        <View style={styles.debugSection}>
          <Text style={styles.debugTitle}>🔍 Debug Info</Text>
          <View style={styles.debugBox}>
            <Text style={styles.debugLabel}>Screen Name:</Text>
            <Text style={styles.debugValue}>Rating</Text>
            
            <Text style={styles.debugLabel}>Location:</Text>
            <Text style={styles.debugValue}>src/screens/transporter/RatingScreen.tsx</Text>
            
            <Text style={styles.debugLabel}>Service:</Text>
            <Text style={styles.debugValue}>ratingService.createRating()</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#2196F3',
    padding: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#E3F2FD',
  },
  content: {
    flex: 1,
    padding: 15,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
  },
  scenarioCard: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  scenarioContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  scenarioText: {
    flex: 1,
  },
  scenarioTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  scenarioDetails: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  customForm: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 15,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: '#000',
  },
  customButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 15,
  },
  customButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
  infoBox: {
    backgroundColor: '#E3F2FD',
    borderRadius: 10,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  infoBullet: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 12,
  },
  bulletNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#2196F3',
    color: '#FFF',
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 12,
    marginTop: 1,
  },
  bulletText: {
    flex: 1,
    fontSize: 13,
    color: '#1565C0',
  },
  featureList: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 12,
    gap: 10,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureText: {
    fontSize: 14,
    color: '#000',
  },
  debugSection: {
    marginBottom: 30,
  },
  debugTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 10,
  },
  debugBox: {
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  debugLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
    marginTop: 6,
  },
  debugValue: {
    fontSize: 12,
    color: '#000',
    fontFamily: 'monospace',
    marginBottom: 6,
  },
});