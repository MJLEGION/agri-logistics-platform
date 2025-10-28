// src/screens/TransportRequestScreen.tsx
/**
 * Real-Time Stakeholder Matching Screen
 * Allows users to request transport for their cargo/produce
 * Shows available matching transporters and auto-assigns the best one
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Dimensions,
  Modal,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../contexts/ThemeContext';
import { useAppDispatch, useAppSelector } from '../store';
import {
  findMatchingTransporters,
  autoAssignTransporter,
  clearMatching,
  selectMatch,
} from '../logistics/store/matchingSlice';
import { matchingService, MatchingRequest } from '../services/matchingService';
import { distanceService } from '../services/distanceService';

const { width } = Dimensions.get('window');

interface TransportRequestScreenProps {
  route: any;
  navigation: any;
}

export default function TransportRequestScreen({
  route,
  navigation,
}: TransportRequestScreenProps) {
  const { theme } = useTheme();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { matchingResult, selectedMatch, autoAssignedTransporter, loading } =
    useAppSelector((state) => state.matching);

  // Get cargo details from route params
  const { cargo } = route.params || {};

  const [showMatchDetails, setShowMatchDetails] = useState(false);
  const [selectedMatchForDetail, setSelectedMatchForDetail] = useState<any>(null);

  // Mock user location - in production, use real GPS
  const mockUserLocation = {
    latitude: -1.9469,
    longitude: 29.8739,
    address: 'Kigali, Rwanda',
  };

  // Mock delivery location - in production, would come from cargo
  const mockDeliveryLocation = {
    latitude: -2.0469,
    longitude: 29.9739,
    address: 'Bugesera, Rwanda',
  };

  /**
   * Handle request for transport - finds matching transporters
   */
  const handleRequestTransport = async () => {
    if (!cargo) {
      Alert.alert('Error', 'No cargo information available');
      return;
    }

    try {
      const matchingRequest: MatchingRequest = {
        userId: user?.id || user?._id || 'unknown',
        pickupLocation: mockUserLocation,
        deliveryLocation: mockDeliveryLocation,
        produceType: cargo.cropName || cargo.name || 'other',
        quantity: cargo.quantity || 0,
        unit: cargo.unit || 'kg',
        requiredCapacity: (cargo.quantity || 0) * 1.1, // Add 10% buffer
      };

      // Dispatch the async thunk to find matches
      await dispatch(findMatchingTransporters(matchingRequest) as any);
    } catch (error) {
      Alert.alert('Error', 'Failed to find matching transporters');
      console.error('Matching error:', error);
    }
  };

  /**
   * Handle auto-assignment of best transporter
   */
  const handleAutoAssign = async () => {
    if (!matchingResult) {
      Alert.alert('Error', 'No matching results available');
      return;
    }

    try {
      await dispatch(autoAssignTransporter(matchingResult) as any);

      // Show success message
      setTimeout(() => {
        Alert.alert(
          '✅ Auto-Assignment Successful!',
          `A transporter has been automatically assigned to your request.\n\n${
            autoAssignedTransporter?.transporter.name || 'Best match'
          } (${autoAssignedTransporter?.transporter.vehicle_type})\n\nETA: ${autoAssignedTransporter?.eta} minutes\nEstimated Cost: ${autoAssignedTransporter?.cost.toLocaleString()} RWF`,
          [
            {
              text: 'View Details',
              onPress: () => {
                if (autoAssignedTransporter) {
                  setSelectedMatchForDetail(autoAssignedTransporter);
                  setShowMatchDetails(true);
                }
              },
            },
            {
              text: 'Confirm & Create Trip',
              onPress: () => handleConfirmAndCreateTrip(),
              style: 'default',
            },
          ]
        );
      }, 500);
    } catch (error) {
      Alert.alert('Error', 'Failed to auto-assign transporter');
      console.error('Auto-assign error:', error);
    }
  };

  /**
   * Confirm and create trip with selected transporter
   */
  const handleConfirmAndCreateTrip = () => {
    if (!autoAssignedTransporter || !cargo) {
      Alert.alert('Error', 'Missing required information');
      return;
    }

    Alert.alert(
      '✅ Trip Created!',
      `Trip request sent to ${autoAssignedTransporter.transporter.name}\n\n📍 Pickup: ${mockUserLocation.address}\n📍 Delivery: ${mockDeliveryLocation.address}\n💰 Cost: ${autoAssignedTransporter.cost.toLocaleString()} RWF\n⏱️ ETA: ${autoAssignedTransporter.eta} minutes`,
      [
        {
          text: 'OK',
          onPress: () => {
            dispatch(clearMatching());
            navigation.goBack();
          },
        },
      ]
    );
  };

  /**
   * Show match details modal
   */
  const renderMatchDetailsModal = () => {
    if (!selectedMatchForDetail) return null;

    const match = selectedMatchForDetail;
    const transporter = match.transporter;

    return (
      <Modal visible={showMatchDetails} animationType="slide" transparent={true}>
        <View style={[styles.modalOverlay, { backgroundColor: theme.background + 'E6' }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowMatchDetails(false)}>
                <Ionicons name="close" size={28} color={theme.text} />
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                Transporter Details
              </Text>
              <View style={{ width: 28 }} />
            </View>

            <ScrollView style={styles.modalScroll}>
              {/* Transporter Info */}
              <LinearGradient
                colors={['#10B981', '#059669']}
                style={styles.transporterCard}
              >
                <View style={styles.transporterHeader}>
                  <View style={styles.avatarBox}>
                    <Ionicons name="person" size={40} color="#fff" />
                  </View>
                  <View style={styles.transporterInfo}>
                    <Text style={styles.transporterName}>{transporter.name}</Text>
                    <View style={styles.ratingBox}>
                      <Ionicons name="star" size={14} color="#FCD34D" />
                      <Text style={styles.ratingText}>
                        {transporter.rating?.toFixed(1) || '4.5'} • {transporter.phone}
                      </Text>
                    </View>
                  </View>
                  {match.isAutoMatch && (
                    <View style={styles.bestMatchBadge}>
                      <Text style={styles.badgeText}>⭐ Best Match</Text>
                    </View>
                  )}
                </View>
              </LinearGradient>

              {/* Vehicle Info */}
              <View style={[styles.infoSection, { backgroundColor: theme.card }]}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  🚛 Vehicle Information
                </Text>
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>
                    Vehicle Type
                  </Text>
                  <Text style={[styles.infoValue, { color: theme.text }]}>
                    {transporter.vehicle_type?.charAt(0).toUpperCase() +
                      transporter.vehicle_type?.slice(1)}
                  </Text>
                </View>
                <View style={[styles.infoRow, { borderTopWidth: 1, borderTopColor: theme.border }]}>
                  <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>
                    Capacity
                  </Text>
                  <Text style={[styles.infoValue, { color: theme.text }]}>
                    {transporter.capacity.toLocaleString()} kg
                  </Text>
                </View>
              </View>

              {/* Matching Reasons */}
              <View style={[styles.infoSection, { backgroundColor: theme.card }]}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  ✅ Why This Match?
                </Text>
                {match.reasonsForMatch.length > 0 ? (
                  match.reasonsForMatch.map((reason, idx) => (
                    <View key={idx} style={styles.reasonRow}>
                      <Text style={[styles.reasonText, { color: theme.text }]}>
                        {reason}
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text style={[styles.reasonText, { color: theme.textSecondary }]}>
                    Good match for your requirements
                  </Text>
                )}
              </View>

              {/* Trip Estimate */}
              <View style={[styles.infoSection, { backgroundColor: theme.card }]}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  📊 Trip Estimate
                </Text>
                <View style={styles.estimateRow}>
                  <View style={styles.estimateItem}>
                    <Ionicons name="location" size={20} color="#F59E0B" />
                    <Text style={[styles.estimateValue, { color: theme.text }]}>
                      {match.distance.toFixed(1)} km
                    </Text>
                    <Text style={[styles.estimateLabel, { color: theme.textSecondary }]}>
                      Distance
                    </Text>
                  </View>
                  <View style={styles.estimateItem}>
                    <Ionicons name="time" size={20} color="#3B82F6" />
                    <Text style={[styles.estimateValue, { color: theme.text }]}>
                      {match.eta} min
                    </Text>
                    <Text style={[styles.estimateLabel, { color: theme.textSecondary }]}>
                      ETA
                    </Text>
                  </View>
                  <View style={styles.estimateItem}>
                    <Ionicons name="wallet" size={20} color="#10B981" />
                    <Text style={[styles.estimateValue, { color: theme.text }]}>
                      {match.cost.toLocaleString()} RWF
                    </Text>
                    <Text style={[styles.estimateLabel, { color: theme.textSecondary }]}>
                      Cost
                    </Text>
                  </View>
                </View>
              </View>

              {/* Score Breakdown */}
              <View style={[styles.infoSection, { backgroundColor: theme.card }]}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  📈 Match Score: {match.score}/100
                </Text>
                <View style={styles.scoreBar}>
                  <View
                    style={[
                      styles.scoreProgress,
                      {
                        width: `${match.score}%`,
                        backgroundColor: match.score >= 70 ? '#10B981' : '#F59E0B',
                      },
                    ]}
                  />
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.confirmButton, { backgroundColor: '#10B981' }]}
                  onPress={() => {
                    setShowMatchDetails(false);
                    handleConfirmAndCreateTrip();
                  }}
                >
                  <Ionicons name="checkmark-circle" size={20} color="#fff" />
                  <Text style={styles.confirmButtonText}>Confirm & Create Trip</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.cancelButton, { backgroundColor: theme.border }]}
                  onPress={() => setShowMatchDetails(false)}
                >
                  <Text style={[styles.cancelButtonText, { color: theme.text }]}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  /**
   * Render single match card
   */
  const renderMatchCard = (match: any) => (
    <TouchableOpacity
      key={match.transporter._id}
      style={[styles.matchCard, { backgroundColor: theme.card }]}
      onPress={() => {
        setSelectedMatchForDetail(match);
        setShowMatchDetails(true);
      }}
    >
      {/* Is Auto-Match Badge */}
      {match.isAutoMatch && (
        <View style={styles.autoMatchBadge}>
          <Text style={styles.badgeText}>⭐ AUTO-MATCH</Text>
        </View>
      )}

      {/* Transporter Header */}
      <View style={styles.cardHeader}>
        <View style={styles.transporterInitial}>
          <Text style={styles.initialText}>{match.transporter.name.charAt(0)}</Text>
        </View>
        <View style={styles.cardHeaderText}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>
            {match.transporter.name}
          </Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={12} color="#FCD34D" />
            <Text style={[styles.ratingSmall, { color: theme.textSecondary }]}>
              {match.transporter.rating?.toFixed(1) || '4.5'} •{' '}
              {match.transporter.vehicle_type}
            </Text>
          </View>
        </View>
        <View style={styles.scoreBox}>
          <Text style={[styles.scoreText, { color: '#10B981' }]}>
            {match.score}
          </Text>
          <Text style={[styles.scoreLabel, { color: theme.textSecondary }]}>
            match
          </Text>
        </View>
      </View>

      {/* Details Row */}
      <View style={[styles.detailsRow, { borderTopColor: theme.border }]}>
        <View style={styles.detailItem}>
          <Ionicons name="location" size={16} color="#F59E0B" />
          <Text style={[styles.detailValue, { color: theme.text }]}>
            {match.distance.toFixed(1)} km
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="time" size={16} color="#3B82F6" />
          <Text style={[styles.detailValue, { color: theme.text }]}>
            {match.eta} min
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="wallet" size={16} color="#10B981" />
          <Text style={[styles.detailValue, { color: theme.text }]}>
            {match.cost.toLocaleString()} RWF
          </Text>
        </View>
      </View>

      {/* Reasons */}
      {match.reasonsForMatch.length > 0 && (
        <View style={styles.reasonsBox}>
          {match.reasonsForMatch.slice(0, 2).map((reason: string, idx: number) => (
            <Text key={idx} style={[styles.reasonSmall, { color: theme.textSecondary }]}>
              ✓ {reason.split(' ').slice(1).join(' ')}
            </Text>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView>
        {/* Header */}
        <LinearGradient
          colors={['#8B5CF6', '#6D28D9']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>🚚 Request Transport</Text>
          <Text style={styles.headerSubtitle}>Find the perfect transporter instantly</Text>
        </LinearGradient>

        {/* Cargo Info Card */}
        {cargo && (
          <View style={[styles.cargoCard, { backgroundColor: theme.card }]}>
            <View style={styles.cargoHeader}>
              <View style={styles.cargoIcon}>
                <Ionicons name="leaf" size={32} color="#10B981" />
              </View>
              <View style={styles.cargoInfo}>
                <Text style={[styles.cargoName, { color: theme.text }]}>
                  {cargo.cropName || cargo.name}
                </Text>
                <Text style={[styles.cargoDetails, { color: theme.textSecondary }]}>
                  {cargo.quantity} {cargo.unit || 'kg'}
                </Text>
              </View>
            </View>
            <View style={[styles.locationInfo, { borderTopColor: theme.border }]}>
              <View style={styles.locationRow}>
                <Ionicons name="pin" size={16} color="#10B981" />
                <Text style={[styles.locationText, { color: theme.text }]}>
                  {mockUserLocation.address}
                </Text>
              </View>
              <View style={styles.arrowContainer}>
                <Ionicons name="arrow-down" size={20} color="#8B5CF6" />
              </View>
              <View style={styles.locationRow}>
                <Ionicons name="pin" size={16} color="#3B82F6" />
                <Text style={[styles.locationText, { color: theme.text }]}>
                  {mockDeliveryLocation.address}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Request Button or Results */}
        {!matchingResult && (
          <TouchableOpacity
            style={[
              styles.primaryButton,
              { backgroundColor: '#8B5CF6' },
              loading && { opacity: 0.6 },
            ]}
            onPress={handleRequestTransport}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="search" size={20} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.primaryButtonText}>Find Matching Transporters</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {/* Matching Results */}
        {matchingResult && matchingResult.matches.length > 0 && (
          <View style={styles.resultsSection}>
            <View style={styles.resultsHeader}>
              <Text style={[styles.resultsTitle, { color: theme.text }]}>
                ✨ {matchingResult.matches.length} Transporters Found
              </Text>
              <TouchableOpacity onPress={handleRequestTransport}>
                <Ionicons name="refresh" size={20} color="#8B5CF6" />
              </TouchableOpacity>
            </View>

            {/* Show Auto-Match First */}
            {autoAssignedTransporter && (
              <View style={styles.autoMatchSection}>
                <View style={styles.autoMatchHeader}>
                  <Ionicons name="star" size={20} color="#FCD34D" />
                  <Text style={[styles.autoMatchTitle, { color: theme.text }]}>
                    Auto-Assigned Transporter
                  </Text>
                </View>
                {renderMatchCard(autoAssignedTransporter)}
                <TouchableOpacity
                  style={[styles.assignButton, { backgroundColor: '#10B981' }]}
                  onPress={handleConfirmAndCreateTrip}
                >
                  <Ionicons name="checkmark-circle" size={20} color="#fff" />
                  <Text style={styles.assignButtonText}>Confirm & Create Trip</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Other Matches */}
            {matchingResult.matches
              .filter((m) => m.transporter._id !== autoAssignedTransporter?.transporter._id)
              .slice(0, 3)
              .map((match) => renderMatchCard(match))}

            {/* Auto-Assign Button */}
            {!autoAssignedTransporter && (
              <TouchableOpacity
                style={[
                  styles.autoAssignButton,
                  { backgroundColor: '#8B5CF6' },
                  loading && { opacity: 0.6 },
                ]}
                onPress={handleAutoAssign}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons
                      name="flash"
                      size={20}
                      color="#fff"
                      style={{ marginRight: 8 }}
                    />
                    <Text style={styles.autoAssignButtonText}>
                      Auto-Assign Best Transporter
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* No Results */}
        {matchingResult && matchingResult.matches.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={64} color={theme.textSecondary} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>
              No Transporters Available
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
              Try again later or adjust your requirements
            </Text>
            <TouchableOpacity
              style={[styles.retryButton, { backgroundColor: '#8B5CF6' }]}
              onPress={handleRequestTransport}
            >
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Match Details Modal */}
      {renderMatchDetailsModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 50,
    paddingBottom: 30,
  },
  backButton: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 10,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  headerSubtitle: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.9,
  },
  cargoCard: {
    marginHorizontal: 15,
    marginVertical: 15,
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cargoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  cargoIcon: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#10B98120',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cargoInfo: {
    flex: 1,
  },
  cargoName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cargoDetails: {
    fontSize: 14,
  },
  locationInfo: {
    borderTopWidth: 1,
    paddingTop: 15,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  locationText: {
    marginLeft: 10,
    fontSize: 13,
    flex: 1,
  },
  arrowContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  primaryButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 15,
    marginVertical: 15,
    paddingVertical: 16,
    borderRadius: 10,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultsSection: {
    paddingHorizontal: 15,
    marginVertical: 10,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  autoMatchSection: {
    marginBottom: 20,
  },
  autoMatchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  autoMatchTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  matchCard: {
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    position: 'relative',
  },
  autoMatchBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#FCD34D',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#000',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  transporterInitial: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  initialText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  cardHeaderText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingSmall: {
    fontSize: 12,
    marginLeft: 4,
  },
  scoreBox: {
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  scoreLabel: {
    fontSize: 10,
  },
  detailsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingTop: 12,
    marginTop: 12,
  },
  detailItem: {
    flex: 1,
    alignItems: 'center',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  reasonsBox: {
    marginTop: 10,
  },
  reasonSmall: {
    fontSize: 12,
    marginVertical: 2,
  },
  autoAssignButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 10,
    marginTop: 20,
    marginBottom: 30,
  },
  autoAssignButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  assignButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 15,
  },
  assignButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    marginBottom: 30,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  retryButton: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalScroll: {
    paddingHorizontal: 15,
  },
  transporterCard: {
    borderRadius: 12,
    padding: 15,
    marginVertical: 15,
  },
  transporterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  transporterInfo: {
    flex: 1,
  },
  transporterName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    color: '#fff',
    marginLeft: 6,
    fontSize: 12,
  },
  bestMatchBadge: {
    backgroundColor: '#FCD34D',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  infoSection: {
    borderRadius: 12,
    padding: 15,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  infoLabel: {
    fontSize: 14,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  reasonRow: {
    marginVertical: 6,
  },
  reasonText: {
    fontSize: 13,
  },
  estimateRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  estimateItem: {
    alignItems: 'center',
  },
  estimateValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 6,
  },
  estimateLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  scoreBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 10,
  },
  scoreProgress: {
    height: '100%',
    borderRadius: 4,
  },
  modalActions: {
    paddingHorizontal: 15,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  confirmButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    marginBottom: 10,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  cancelButton: {
    paddingVertical: 14,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});