import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

const roles = [
  { key: 'farmer', label: 'Farmer' },
  { key: 'buyer', label: 'Buyer' },
  { key: 'transporter', label: 'Transporter' },
];

const RoleSwitcher = ({ currentRole, onSwitch }) => (
  <View style={styles.container}>
    {roles.map((role) => (
      <TouchableOpacity
        key={role.key}
        style={[
          styles.button,
          currentRole === role.key && styles.buttonActive,
        ]}
        onPress={() => onSwitch(role.key)}
      >
        <Text
          style={[
            styles.buttonText,
            currentRole === role.key && styles.buttonTextActive,
          ]}
        >
          {role.label}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 18,
    alignSelf: 'center',
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
    backgroundColor: '#e6f4ea',
    marginHorizontal: 4,
  },
  buttonActive: {
    backgroundColor: '#38a169',
  },
  buttonText: {
    color: '#38a169',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonTextActive: {
    color: '#fff',
  },
});

export default RoleSwitcher;

// Usage example (to be placed inside a component):
// <RoleSwitcher
//   currentRole="farmer"
//   onSwitch={role => navigation.navigate(role === 'farmer' ? 'FarmerHomeScreen' : role === 'buyer' ? 'BuyerHomeScreen' : 'TransporterHomeScreen')}
// />