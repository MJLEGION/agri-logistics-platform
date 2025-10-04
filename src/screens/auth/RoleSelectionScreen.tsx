// src/screens/auth/RoleSelectionScreen.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { UserRole } from '../../types';

// Update this part in RoleSelectionScreen.tsx
export default function RoleSelectionScreen({ navigation }: any) {
  const handleRoleSelect = (role: UserRole) => {
    navigation.navigate('Login', { role });
  };
  
  // ... rest of the code stays the same
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Agri-Logistics</Text>
      <Text style={styles.subtitle}>Select your role to continue</Text>

      <TouchableOpacity
        style={[styles.roleButton, styles.farmerButton]}
        onPress={() => handleRoleSelect('farmer')}
      >
        <Text style={styles.roleIcon}>🌾</Text>
        <Text style={styles.roleText}>I am a Farmer</Text>
        <Text style={styles.roleDesc}>List and sell your crops</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.roleButton, styles.transporterButton]}
        onPress={() => handleRoleSelect('transporter')}
      >
        <Text style={styles.roleIcon}>🚚</Text>
        <Text style={styles.roleText}>I am a Transporter</Text>
        <Text style={styles.roleDesc}>Transport crops to buyers</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.roleButton, styles.buyerButton]}
        onPress={() => handleRoleSelect('buyer')}
      >
        <Text style={styles.roleIcon}>🏪</Text>
        <Text style={styles.roleText}>I am a Buyer</Text>
        <Text style={styles.roleDesc}>Purchase fresh crops</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E7D32',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  },
  roleButton: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    alignItems: 'center',
  },
  farmerButton: {
    backgroundColor: '#E8F5E9',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  transporterButton: {
    backgroundColor: '#E3F2FD',
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  buyerButton: {
    backgroundColor: '#FFF3E0',
    borderWidth: 2,
    borderColor: '#FF9800',
  },
  roleIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  roleText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  roleDesc: {
    fontSize: 14,
    color: '#666',
  },
});