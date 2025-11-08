// Test Screen - Run logistics tests from the app
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { runAllLogisticsTests } from '../tests/logisticsTests';

export default function TestScreen({ navigation }: any) {
  const { theme } = useTheme();
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const runTests = async () => {
    setIsRunning(true);
    setLogs([]);
    setResults(null);

    // Capture console.log
    const originalLog = console.log;
    const capturedLogs: string[] = [];

    console.log = (...args: any[]) => {
      const message = args.map(arg =>
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' ');
      capturedLogs.push(message);
      originalLog(...args);
    };

    try {
      // Run tests
      const testResults = runAllLogisticsTests();
      setResults(testResults);
      setLogs(capturedLogs);
    } catch (error) {
      capturedLogs.push(`ERROR: ${error}`);
      setLogs(capturedLogs);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusColor = () => {
    if (!results) return theme.textSecondary;
    return results.failed === 0 ? '#10B981' : '#EF4444';
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.primary }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Logistics Tests</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Instructions */}
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>
            Test Suite
          </Text>
          <Text style={[styles.cardText, { color: theme.textSecondary }]}>
            This will run comprehensive tests on all logistics features including:
          </Text>
          <View style={styles.featureList}>
            <Text style={[styles.featureItem, { color: theme.textSecondary }]}>
              • Distance calculations (Haversine formula)
            </Text>
            <Text style={[styles.featureItem, { color: theme.textSecondary }]}>
              • Earnings and fuel cost calculations
            </Text>
            <Text style={[styles.featureItem, { color: theme.textSecondary }]}>
              • Load matching algorithms
            </Text>
            <Text style={[styles.featureItem, { color: theme.textSecondary }]}>
              • Daily earning potential
            </Text>
            <Text style={[styles.featureItem, { color: theme.textSecondary }]}>
              • Route optimization
            </Text>
          </View>
        </View>

        {/* Run Button */}
        <TouchableOpacity
          style={[
            styles.runButton,
            { backgroundColor: theme.primary },
            isRunning && styles.runButtonDisabled,
          ]}
          onPress={runTests}
          disabled={isRunning}
        >
          {isRunning ? (
            <>
              <ActivityIndicator color="#FFF" style={{ marginRight: 8 }} />
              <Text style={styles.runButtonText}>Running Tests...</Text>
            </>
          ) : (
            <>
              <Ionicons name="play-circle" size={20} color="#FFF" />
              <Text style={styles.runButtonText}>Run All Tests</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Results */}
        {results && (
          <View style={[styles.resultsCard, { backgroundColor: theme.card }]}>
            <View style={styles.resultsHeader}>
              <Ionicons
                name={results.failed === 0 ? 'checkmark-circle' : 'alert-circle'}
                size={32}
                color={getStatusColor()}
              />
              <Text style={[styles.resultsTitle, { color: theme.text }]}>
                Test Results
              </Text>
            </View>

            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Text style={[styles.statNumber, { color: '#10B981' }]}>
                  {results.passed}
                </Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                  Passed
                </Text>
              </View>

              <View style={styles.statBox}>
                <Text style={[styles.statNumber, { color: '#EF4444' }]}>
                  {results.failed}
                </Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                  Failed
                </Text>
              </View>

              <View style={styles.statBox}>
                <Text style={[styles.statNumber, { color: theme.text }]}>
                  {results.total}
                </Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                  Total
                </Text>
              </View>

              <View style={styles.statBox}>
                <Text style={[styles.statNumber, { color: getStatusColor() }]}>
                  {results.successRate}%
                </Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                  Success
                </Text>
              </View>
            </View>

            {results.failed === 0 ? (
              <View style={[styles.successBanner, { backgroundColor: '#10B981' + '20' }]}>
                <Text style={[styles.successText, { color: '#10B981' }]}>
                  🎉 All tests passed! System is working perfectly.
                </Text>
              </View>
            ) : (
              <View style={[styles.failureBanner, { backgroundColor: '#EF4444' + '20' }]}>
                <Text style={[styles.failureText, { color: '#EF4444' }]}>
                  ⚠️ {results.failed} test(s) failed. Check logs below.
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Logs */}
        {logs.length > 0 && (
          <View style={[styles.logsCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.logsTitle, { color: theme.text }]}>
              Test Logs
            </Text>
            <View style={[styles.logsContainer, { backgroundColor: '#000' }]}>
              <ScrollView style={styles.logsScroll}>
                {logs.map((log, index) => {
                  // Remove ANSI color codes for display
                  const cleanLog = log.replace(/\x1b\[[0-9;]*m/g, '');

                  // Determine color based on content
                  let color = '#FFF';
                  if (cleanLog.includes('✓ PASS')) color = '#10B981';
                  if (cleanLog.includes('✗ FAIL')) color = '#EF4444';
                  if (cleanLog.includes('TEST') || cleanLog.includes('===')) color = '#3B82F6';
                  if (cleanLog.includes('Success Rate') || cleanLog.includes('Sample')) color = '#F59E0B';

                  return (
                    <Text key={index} style={[styles.logLine, { color }]}>
                      {cleanLog}
                    </Text>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        )}

        {/* Quick Actions */}
        <View style={[styles.actionsCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.actionsTitle, { color: theme.text }]}>
            Quick Actions
          </Text>

          <TouchableOpacity
            style={[styles.actionButton, { borderColor: theme.border }]}
            onPress={() => navigation.navigate('EnhancedTransporterDashboard')}
          >
            <Ionicons name="speedometer" size={20} color={theme.primary} />
            <Text style={[styles.actionButtonText, { color: theme.text }]}>
              View Enhanced Dashboard
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { borderColor: theme.border }]}
            onPress={() => navigation.navigate('AvailableLoads')}
          >
            <Ionicons name="map" size={20} color={theme.primary} />
            <Text style={[styles.actionButtonText, { color: theme.text }]}>
              Test Load Matching
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { borderColor: theme.border }]}
            onPress={() => navigation.navigate('EarningsDashboard')}
          >
            <Ionicons name="wallet" size={20} color={theme.primary} />
            <Text style={[styles.actionButtonText, { color: theme.text }]}>
              View Earnings Dashboard
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  cardText: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  featureList: {
    marginTop: 8,
  },
  featureItem: {
    fontSize: 13,
    marginBottom: 6,
    lineHeight: 18,
  },
  runButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  runButtonDisabled: {
    opacity: 0.6,
  },
  runButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  resultsCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statBox: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  successBanner: {
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  successText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  failureBanner: {
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  failureText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  logsCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  logsTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  logsContainer: {
    borderRadius: 8,
    padding: 12,
    maxHeight: 400,
  },
  logsScroll: {
    flex: 1,
  },
  logLine: {
    fontFamily: 'monospace',
    fontSize: 11,
    marginBottom: 2,
  },
  actionsCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 32,
  },
  actionsTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
    gap: 12,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
