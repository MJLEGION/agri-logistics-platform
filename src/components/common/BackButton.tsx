import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const BackButton = ({ style }) => {
  const navigation = useNavigation();
  return (
    <TouchableOpacity
      style={[styles.backButton, style]}
      onPress={() => navigation.goBack()}
    >
      <Text style={styles.backButtonText}>{'← Back'}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 30,
    left: 20,
    zIndex: 10,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 8,
    elevation: 2,
  },
  backButtonText: {
    fontSize: 18,
    color: '#38a169',
    fontWeight: 'bold',
  },
});

export default BackButton;