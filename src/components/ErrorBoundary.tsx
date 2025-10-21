// src/components/ErrorBoundary.tsx
import React, { ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('❌ Error Boundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} onReset={this.handleReset} />;
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error: Error | null;
  onReset: () => void;
}

function ErrorFallback({ error, onReset }: ErrorFallbackProps) {
  // We can't use useTheme inside a regular component rendered from error boundary
  // So we'll use basic styling
  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.iconContainer}>
          <Text style={styles.emoji}>⚠️</Text>
        </View>
        <Text style={styles.title}>Something went wrong</Text>
        <Text style={styles.message}>
          We're sorry, but something unexpected happened. Please try again.
        </Text>
        
        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorTitle}>Error Details:</Text>
            <Text style={styles.errorMessage}>{error.toString()}</Text>
          </View>
        )}
      </ScrollView>
      
      <TouchableOpacity style={styles.button} onPress={onReset}>
        <Text style={styles.buttonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  iconContainer: {
    marginBottom: 20,
  },
  emoji: {
    fontSize: 64,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  errorBox: {
    backgroundColor: '#FEE',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#D32F2F',
    maxWidth: '100%',
  },
  errorTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D32F2F',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
  },
  button: {
    backgroundColor: '#2E7D32',
    marginHorizontal: 20,
    marginVertical: 20,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});