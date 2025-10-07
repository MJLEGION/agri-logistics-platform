import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { UserRole } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';
import { ThemeToggle } from '../../components/common/ThemeToggle';

export default function RoleSelectionScreen({ navigation }: any) {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <ThemeToggle />
      </View>
      
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>
          Welcome to Agri-Logistics
        </Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Select your role to get started
        </Text>

        <TouchableOpacity
          style={[styles.roleButton, { 
            backgroundColor: theme.card,
            borderColor: theme.primary,
          }]}
          onPress={() => navigation.navigate('Register', { role: 'farmer' })}
        >
          <Text style={styles.roleIcon}>🌾</Text>
          <Text style={[styles.roleText, { color: theme.text }]}>I am a Farmer</Text>
          <Text style={[styles.roleDesc, { color: theme.textSecondary }]}>
            List and sell your crops
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.roleButton, { 
            backgroundColor: theme.card,
            borderColor: theme.tertiary,
          }]}
          onPress={() => navigation.navigate('Register', { role: 'transporter' })}
        >
          <Text style={styles.roleIcon}>🚚</Text>
          <Text style={[styles.roleText, { color: theme.text }]}>I am a Transporter</Text>
          <Text style={[styles.roleDesc, { color: theme.textSecondary }]}>
            Transport crops to buyers
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.roleButton, { 
            backgroundColor: theme.card,
            borderColor: theme.secondary,
          }]}
          onPress={() => navigation.navigate('Register', { role: 'buyer' })}
        >
          <Text style={styles.roleIcon}>🏪</Text>
          <Text style={[styles.roleText, { color: theme.text }]}>I am a Buyer</Text>
          <Text style={[styles.roleDesc, { color: theme.textSecondary }]}>
            Purchase fresh crops
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.loginLink}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={[styles.loginLinkText, { color: theme.primary }]}>
            Already have an account? Login here
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'flex-end',
    paddingTop: 40,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
  },
  roleButton: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    alignItems: 'center',
    borderWidth: 2,
  },
  roleIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  roleText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  roleDesc: {
    fontSize: 14,
  },
  loginLink: {
    marginTop: 30,
    alignItems: 'center',
  },
  loginLinkText: {
    fontSize: 16,
    fontWeight: '600',
  },
});