import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../../store/slices/authSlice';
import { useTheme } from '../../contexts/ThemeContext';
import { RootState } from '../../store';

export default function LoginScreen({ navigation }: any) {
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);
  
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!phone || !password) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    try {
      const result = await dispatch(login({ phone, password })).unwrap();
      console.log('Login successful:', result);
      // Navigation happens automatically based on user's actual role from database
    } catch (err: any) {
      console.log('Login error:', err);
      Alert.alert('Login Failed', err || 'Invalid credentials');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Login</Text>

      {error && (
        <Text style={[styles.error, { color: theme.error }]}>{error}</Text>
      )}

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
        onPress={handleLogin}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Login</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('RoleSelection')}>
        <Text style={[styles.linkText, { color: theme.primary }]}>
          Don't have an account? Register
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
  error: {
    marginBottom: 10,
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