// src/screens/auth/LoginScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../store/slices/authSlice';

export default function LoginScreen({ route, navigation }: any) {
  const { role } = route.params;
  const dispatch = useDispatch();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (!phone || !password) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    // Mock login - replace with actual API call later
    const mockUser = {
      id: '1',
      name: 'Test User',
      phone,
      role,
    };

    dispatch(setCredentials({ user: mockUser, token: 'mock-token' }));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{role.charAt(0).toUpperCase() + role.slice(1)} Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Phone Number (+250)"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Register', { role })}>
        <Text style={styles.linkText}>Don't have an account? Register</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← Back to role selection</Text>
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#2E7D32',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkText: {
    color: '#2E7D32',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 14,
  },
  backText: {
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 14,
  },
});