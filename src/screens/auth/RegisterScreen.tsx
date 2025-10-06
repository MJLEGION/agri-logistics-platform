// src/screens/auth/RegisterScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../store/slices/authSlice';
import { useTheme } from '../../contexts/ThemeContext';

export default function RegisterScreen({ route, navigation }: any) {
  const { role } = route.params;
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = () => {
    if (!name || !phone || !password) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    const newUser = {
      id: Date.now().toString(),
      name,
      phone,
      role,
    };

    dispatch(setCredentials({ user: newUser, token: 'mock-token' }));
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>
        Register as {role.charAt(0).toUpperCase() + role.slice(1)}
      </Text>

      <TextInput
        style={[styles.input, { 
          backgroundColor: theme.card,
          borderColor: theme.border,
          color: theme.text,
        }]}
        placeholder="Full Name"
        placeholderTextColor={theme.textSecondary}
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={[styles.input, { 
          backgroundColor: theme.card,
          borderColor: theme.border,
          color: theme.text,
        }]}
        placeholder="Phone Number (+250)"
        placeholderTextColor={theme.textSecondary}
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />

      <TextInput
        style={[styles.input, { 
          backgroundColor: theme.card,
          borderColor: theme.border,
          color: theme.text,
        }]}
        placeholder="Password"
        placeholderTextColor={theme.textSecondary}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity 
        style={[styles.button, { backgroundColor: theme.primary }]} 
        onPress={handleRegister}
      >
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login', { role })}>
        <Text style={[styles.linkText, { color: theme.primary }]}>
          Already have an account? Login
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={[styles.backText, { color: theme.textSecondary }]}>
          ← Back to role selection
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
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
    textAlign: 'center',
    marginTop: 20,
    fontSize: 14,
  },
  backText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 14,
  },
});