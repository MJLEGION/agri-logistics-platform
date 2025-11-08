// src/screens/common/ProfileSettingsScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../contexts/ThemeContext';
import { useAppSelector, useAppDispatch } from '../../store';
import { Card } from '../../components/common/Card';
import ProfileStrengthIndicator from '../../components/profile/ProfileStrengthIndicator';
import { profileService } from '../../services/profileService';
import { logger } from '../../utils/logger';
import { ErrorState } from '../../components/common/ErrorState';

interface ProfileData {
  name: string;
  phone: string;
  profilePicture?: string;
  age?: string;
  gender?: 'male' | 'female' | 'other' | '';
  location?: string;
  professionalTitle?: string;
  bio?: string;
}

interface NotificationPreferences {
  pushNotifications: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  orderUpdates: boolean;
  promotions: boolean;
  tripReminders: boolean;
}

interface PrivacySettings {
  profileVisibility: 'public' | 'private';
  showPhone: boolean;
  showLocation: boolean;
  allowMessages: boolean;
}

interface DriverLicense {
  number: string;
  expiryDate: string;
  category: string;
  issuingCountry: string;
}

interface Certification {
  id: string;
  name: string;
  issuedBy: string;
  issueDate: string;
  expiryDate?: string;
  certificateNumber?: string;
  verified?: boolean;
}

export default function ProfileSettingsScreen({ navigation }: any) {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'professional' | 'notifications' | 'privacy' | 'account'>('profile');

  // Profile Data
  const [profileData, setProfileData] = useState<ProfileData>({
    name: user?.name || '',
    phone: user?.phone || '',
    profilePicture: undefined,
    age: '',
    gender: '',
    location: user?.location?.address || '',
    professionalTitle: '',
    bio: '',
  });

  // Notification Preferences
  const [notifications, setNotifications] = useState<NotificationPreferences>({
    pushNotifications: true,
    emailNotifications: false,
    smsNotifications: true,
    orderUpdates: true,
    promotions: false,
    tripReminders: true,
  });

  // Privacy Settings
  const [privacy, setPrivacy] = useState<PrivacySettings>({
    profileVisibility: 'public',
    showPhone: false,
    showLocation: true,
    allowMessages: true,
  });

  // Driver License (for transporters)
  const [driverLicense, setDriverLicense] = useState<DriverLicense>({
    number: '',
    expiryDate: '',
    category: 'B',
    issuingCountry: 'Rwanda',
  });

  // Certifications
  const [certifications, setCertifications] = useState<Certification[]>([]);

  useEffect(() => {
    requestPermissions();
    loadProfileData();
  }, []);

  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'We need camera roll permissions to update your profile picture.');
      }
    }
  };

  const loadProfileData = async () => {
    if (!user?._id) {
      logger.warn('No user ID available for loading profile');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      logger.info('Loading profile data for user:', user._id);
      const data = await profileService.getProfile(user._id);

      // Update profile data
      setProfileData({
        name: data.name || '',
        phone: data.phone || '',
        profilePicture: data.profilePicture,
        age: data.age?.toString() || '',
        gender: data.gender || '',
        location: data.location?.address || '',
        professionalTitle: data.professionalTitle || '',
        bio: data.bio || '',
      });

      // Update notification preferences
      if (data.notificationPreferences) {
        setNotifications(data.notificationPreferences);
      }

      // Update privacy settings
      if (data.privacySettings) {
        setPrivacy(data.privacySettings);
      }

      // Update driver license (for transporters)
      if (data.driverLicense) {
        setDriverLicense({
          number: data.driverLicense.number || '',
          expiryDate: data.driverLicense.expiryDate || '',
          category: data.driverLicense.category || 'B',
          issuingCountry: data.driverLicense.issuingCountry || 'Rwanda',
        });
      }

      // Update certifications
      if (data.certifications) {
        setCertifications(data.certifications);
      }

      logger.info('Profile data loaded successfully');
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to load profile data';
      logger.error('Error loading profile:', error);
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0]) {
        setProfileData({ ...profileData, profilePicture: result.assets[0].uri });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'We need camera permissions to take a photo.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0]) {
        setProfileData({ ...profileData, profilePicture: result.assets[0].uri });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      'Update Profile Picture',
      'Choose an option',
      [
        { text: 'Take Photo', onPress: takePhoto },
        { text: 'Choose from Library', onPress: pickImage },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const saveProfile = async () => {
    if (!user?._id) {
      Alert.alert('Error', 'User ID not found');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      logger.info('Saving profile for user:', user._id);

      // Upload profile picture if changed
      let profilePictureUrl = profileData.profilePicture;
      if (profileData.profilePicture && profileData.profilePicture.startsWith('file://')) {
        logger.info('Uploading profile picture...');
        profilePictureUrl = await profileService.uploadProfilePicture(user._id, profileData.profilePicture);
        logger.info('Profile picture uploaded successfully');
      }

      // Prepare update data based on active tab
      if (activeTab === 'profile') {
        await profileService.updateProfile(user._id, {
          name: profileData.name,
          profilePicture: profilePictureUrl,
          age: profileData.age ? parseInt(profileData.age) : undefined,
          gender: profileData.gender || undefined,
          location: profileData.location,
          professionalTitle: profileData.professionalTitle,
          bio: profileData.bio,
        });
      } else if (activeTab === 'notifications') {
        await profileService.updateNotificationPreferences(user._id, notifications);
      } else if (activeTab === 'privacy') {
        await profileService.updatePrivacySettings(user._id, privacy);
      } else if (activeTab === 'professional') {
        // Save driver license and certifications
        await profileService.updateProfile(user._id, {
          // Would need to extend the service to handle these
        });
      }

      logger.info('Profile saved successfully');
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to update profile';
      logger.error('Error saving profile:', error);
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const renderProfileTab = () => (
    <View style={styles.tabContent}>
      {/* Profile Picture */}
      <View style={styles.profilePictureSection}>
        <TouchableOpacity onPress={showImageOptions} style={styles.profilePictureContainer}>
          {profileData.profilePicture ? (
            <Image source={{ uri: profileData.profilePicture }} style={styles.profilePicture} />
          ) : (
            <View style={[styles.profilePicturePlaceholder, { backgroundColor: theme.tertiary + '20' }]}>
              <Ionicons name="person" size={60} color={theme.tertiary} />
            </View>
          )}
          <View style={[styles.editIconContainer, { backgroundColor: theme.tertiary }]}>
            <Ionicons name="camera" size={20} color="#FFF" />
          </View>
        </TouchableOpacity>
        <Text style={[styles.uploadHint, { color: theme.textSecondary }]}>Tap to change photo</Text>
      </View>

      {/* Personal Details */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Personal Information</Text>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.text }]}>Full Name *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
            value={profileData.name}
            onChangeText={(text) => setProfileData({ ...profileData, name: text })}
            placeholder="Enter your full name"
            placeholderTextColor={theme.textSecondary}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.text }]}>Phone Number *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
            value={profileData.phone}
            onChangeText={(text) => setProfileData({ ...profileData, phone: text })}
            placeholder="Enter your phone number"
            placeholderTextColor={theme.textSecondary}
            keyboardType="phone-pad"
            editable={false}
          />
          <Text style={[styles.hint, { color: theme.textSecondary }]}>Phone number cannot be changed</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.text }]}>Age</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
            value={profileData.age}
            onChangeText={(text) => setProfileData({ ...profileData, age: text })}
            placeholder="Enter your age"
            placeholderTextColor={theme.textSecondary}
            keyboardType="number-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.text }]}>Gender</Text>
          <View style={styles.genderOptions}>
            {['male', 'female', 'other'].map((gender) => (
              <TouchableOpacity
                key={gender}
                style={[
                  styles.genderButton,
                  { borderColor: theme.border },
                  profileData.gender === gender && { backgroundColor: theme.tertiary, borderColor: theme.tertiary },
                ]}
                onPress={() => setProfileData({ ...profileData, gender: gender as any })}
              >
                <Text
                  style={[
                    styles.genderButtonText,
                    { color: profileData.gender === gender ? '#FFF' : theme.text },
                  ]}
                >
                  {gender.charAt(0).toUpperCase() + gender.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.text }]}>Location</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
            value={profileData.location}
            onChangeText={(text) => setProfileData({ ...profileData, location: text })}
            placeholder="Enter your location"
            placeholderTextColor={theme.textSecondary}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.text }]}>
            Professional Title {user?.role === 'transporter' ? '(e.g., Truck Driver, Logistics Manager)' : '(e.g., Farmer, Distributor)'}
          </Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
            value={profileData.professionalTitle}
            onChangeText={(text) => setProfileData({ ...profileData, professionalTitle: text })}
            placeholder="Enter your title"
            placeholderTextColor={theme.textSecondary}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.text }]}>Bio</Text>
          <TextInput
            style={[styles.input, styles.textArea, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
            value={profileData.bio}
            onChangeText={(text) => setProfileData({ ...profileData, bio: text })}
            placeholder="Tell us about yourself..."
            placeholderTextColor={theme.textSecondary}
            multiline
            numberOfLines={4}
          />
        </View>
      </View>
    </View>
  );

  const renderNotificationsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Notification Channels</Text>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Ionicons name="notifications" size={24} color={theme.tertiary} />
            <View style={styles.settingText}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>Push Notifications</Text>
              <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
                Receive notifications on your device
              </Text>
            </View>
          </View>
          <Switch
            value={notifications.pushNotifications}
            onValueChange={(value) => setNotifications({ ...notifications, pushNotifications: value })}
            trackColor={{ false: theme.border, true: theme.tertiary + '50' }}
            thumbColor={notifications.pushNotifications ? theme.tertiary : '#f4f3f4'}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Ionicons name="mail" size={24} color={theme.tertiary} />
            <View style={styles.settingText}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>Email Notifications</Text>
              <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
                Receive updates via email
              </Text>
            </View>
          </View>
          <Switch
            value={notifications.emailNotifications}
            onValueChange={(value) => setNotifications({ ...notifications, emailNotifications: value })}
            trackColor={{ false: theme.border, true: theme.tertiary + '50' }}
            thumbColor={notifications.emailNotifications ? theme.tertiary : '#f4f3f4'}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Ionicons name="chatbubbles" size={24} color={theme.tertiary} />
            <View style={styles.settingText}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>SMS Notifications</Text>
              <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
                Receive important updates via SMS
              </Text>
            </View>
          </View>
          <Switch
            value={notifications.smsNotifications}
            onValueChange={(value) => setNotifications({ ...notifications, smsNotifications: value })}
            trackColor={{ false: theme.border, true: theme.tertiary + '50' }}
            thumbColor={notifications.smsNotifications ? theme.tertiary : '#f4f3f4'}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Notification Types</Text>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Ionicons name="cube" size={24} color={theme.success} />
            <View style={styles.settingText}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>
                {user?.role === 'transporter' ? 'Load Updates' : 'Order Updates'}
              </Text>
              <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
                Status changes and important updates
              </Text>
            </View>
          </View>
          <Switch
            value={notifications.orderUpdates}
            onValueChange={(value) => setNotifications({ ...notifications, orderUpdates: value })}
            trackColor={{ false: theme.border, true: theme.tertiary + '50' }}
            thumbColor={notifications.orderUpdates ? theme.tertiary : '#f4f3f4'}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Ionicons name="time" size={24} color={theme.warning} />
            <View style={styles.settingText}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>Trip Reminders</Text>
              <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
                Reminders for upcoming trips
              </Text>
            </View>
          </View>
          <Switch
            value={notifications.tripReminders}
            onValueChange={(value) => setNotifications({ ...notifications, tripReminders: value })}
            trackColor={{ false: theme.border, true: theme.tertiary + '50' }}
            thumbColor={notifications.tripReminders ? theme.tertiary : '#f4f3f4'}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Ionicons name="megaphone" size={24} color={theme.error} />
            <View style={styles.settingText}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>Promotions</Text>
              <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
                Special offers and promotions
              </Text>
            </View>
          </View>
          <Switch
            value={notifications.promotions}
            onValueChange={(value) => setNotifications({ ...notifications, promotions: value })}
            trackColor={{ false: theme.border, true: theme.tertiary + '50' }}
            thumbColor={notifications.promotions ? theme.tertiary : '#f4f3f4'}
          />
        </View>
      </View>
    </View>
  );

  const renderPrivacyTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Profile Privacy</Text>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.text }]}>Profile Visibility</Text>
          <View style={styles.visibilityOptions}>
            <TouchableOpacity
              style={[
                styles.visibilityButton,
                { borderColor: theme.border },
                privacy.profileVisibility === 'public' && { backgroundColor: theme.tertiary, borderColor: theme.tertiary },
              ]}
              onPress={() => setPrivacy({ ...privacy, profileVisibility: 'public' })}
            >
              <Ionicons name="globe" size={20} color={privacy.profileVisibility === 'public' ? '#FFF' : theme.text} />
              <Text
                style={[
                  styles.visibilityButtonText,
                  { color: privacy.profileVisibility === 'public' ? '#FFF' : theme.text },
                ]}
              >
                Public
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.visibilityButton,
                { borderColor: theme.border },
                privacy.profileVisibility === 'private' && { backgroundColor: theme.tertiary, borderColor: theme.tertiary },
              ]}
              onPress={() => setPrivacy({ ...privacy, profileVisibility: 'private' })}
            >
              <Ionicons name="lock-closed" size={20} color={privacy.profileVisibility === 'private' ? '#FFF' : theme.text} />
              <Text
                style={[
                  styles.visibilityButtonText,
                  { color: privacy.profileVisibility === 'private' ? '#FFF' : theme.text },
                ]}
              >
                Private
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Ionicons name="call" size={24} color={theme.tertiary} />
            <View style={styles.settingText}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>Show Phone Number</Text>
              <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
                Display your phone number on your profile
              </Text>
            </View>
          </View>
          <Switch
            value={privacy.showPhone}
            onValueChange={(value) => setPrivacy({ ...privacy, showPhone: value })}
            trackColor={{ false: theme.border, true: theme.tertiary + '50' }}
            thumbColor={privacy.showPhone ? theme.tertiary : '#f4f3f4'}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Ionicons name="location" size={24} color={theme.tertiary} />
            <View style={styles.settingText}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>Show Location</Text>
              <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
                Display your location on your profile
              </Text>
            </View>
          </View>
          <Switch
            value={privacy.showLocation}
            onValueChange={(value) => setPrivacy({ ...privacy, showLocation: value })}
            trackColor={{ false: theme.border, true: theme.tertiary + '50' }}
            thumbColor={privacy.showLocation ? theme.tertiary : '#f4f3f4'}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Ionicons name="chatbox" size={24} color={theme.tertiary} />
            <View style={styles.settingText}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>Allow Messages</Text>
              <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
                Allow other users to send you messages
              </Text>
            </View>
          </View>
          <Switch
            value={privacy.allowMessages}
            onValueChange={(value) => setPrivacy({ ...privacy, allowMessages: value })}
            trackColor={{ false: theme.border, true: theme.tertiary + '50' }}
            thumbColor={privacy.allowMessages ? theme.tertiary : '#f4f3f4'}
          />
        </View>
      </View>
    </View>
  );

  const addCertification = () => {
    Alert.prompt(
      'Add Certification',
      'Enter certification name',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add',
          onPress: (certName) => {
            if (certName?.trim()) {
              const newCert: Certification = {
                id: Date.now().toString(),
                name: certName.trim(),
                issuedBy: '',
                issueDate: new Date().toISOString().split('T')[0],
                verified: false,
              };
              setCertifications([...certifications, newCert]);
            }
          },
        },
      ],
      'plain-text'
    );
  };

  const removeCertification = (id: string) => {
    Alert.alert(
      'Remove Certification',
      'Are you sure you want to remove this certification?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => setCertifications(certifications.filter((cert) => cert.id !== id)),
        },
      ]
    );
  };

  const renderProfessionalTab = () => (
    <View style={styles.tabContent}>
      {/* Ratings Display */}
      {user?.rating && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Your Rating</Text>
          <View style={[styles.ratingCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.ratingHeader}>
              <View style={styles.ratingScoreContainer}>
                <Text style={[styles.ratingScore, { color: theme.tertiary }]}>
                  {user.rating.average.toFixed(1)}
                </Text>
                <View style={styles.starsContainer}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons
                      key={star}
                      name={star <= Math.round(user.rating!.average) ? 'star' : 'star-outline'}
                      size={16}
                      color="#FFA500"
                    />
                  ))}
                </View>
                <Text style={[styles.ratingCount, { color: theme.textSecondary }]}>
                  {user.rating.count} {user.rating.count === 1 ? 'rating' : 'ratings'}
                </Text>
              </View>

              {/* Rating Breakdown */}
              {user.rating.breakdown && (
                <View style={styles.ratingBreakdown}>
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = user.rating?.breakdown?.[star as keyof typeof user.rating.breakdown] || 0;
                    const percentage = user.rating ? (count / user.rating.count) * 100 : 0;
                    return (
                      <View key={star} style={styles.breakdownRow}>
                        <Text style={[styles.breakdownStar, { color: theme.text }]}>{star}</Text>
                        <Ionicons name="star" size={12} color="#FFA500" />
                        <View style={[styles.breakdownBar, { backgroundColor: theme.border }]}>
                          <View
                            style={[
                              styles.breakdownFill,
                              { width: `${percentage}%`, backgroundColor: '#FFA500' },
                            ]}
                          />
                        </View>
                        <Text style={[styles.breakdownCount, { color: theme.textSecondary }]}>{count}</Text>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          </View>
        </View>
      )}

      {/* Driver's License (Transporter only) */}
      {user?.role === 'transporter' && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Driver's License</Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.text }]}>License Number</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
              value={driverLicense.number}
              onChangeText={(text) => setDriverLicense({ ...driverLicense, number: text })}
              placeholder="Enter license number"
              placeholderTextColor={theme.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.text }]}>Category</Text>
            <View style={styles.categoryOptions}>
              {['A', 'B', 'C', 'D', 'E'].map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryButton,
                    { borderColor: theme.border },
                    driverLicense.category === cat && { backgroundColor: theme.tertiary, borderColor: theme.tertiary },
                  ]}
                  onPress={() => setDriverLicense({ ...driverLicense, category: cat })}
                >
                  <Text
                    style={[
                      styles.categoryButtonText,
                      { color: driverLicense.category === cat ? '#FFF' : theme.text },
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.text }]}>Expiry Date</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
              value={driverLicense.expiryDate}
              onChangeText={(text) => setDriverLicense({ ...driverLicense, expiryDate: text })}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={theme.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.text }]}>Issuing Country</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
              value={driverLicense.issuingCountry}
              onChangeText={(text) => setDriverLicense({ ...driverLicense, issuingCountry: text })}
              placeholder="Enter country"
              placeholderTextColor={theme.textSecondary}
            />
          </View>
        </View>
      )}

      {/* Certifications */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Certifications</Text>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: theme.tertiary }]}
            onPress={addCertification}
          >
            <Ionicons name="add" size={20} color="#FFF" />
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>

        {certifications.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Ionicons name="ribbon-outline" size={48} color={theme.textSecondary} />
            <Text style={[styles.emptyStateText, { color: theme.textSecondary }]}>
              No certifications added yet
            </Text>
            <Text style={[styles.emptyStateHint, { color: theme.textSecondary }]}>
              Add your professional certifications to build trust
            </Text>
          </View>
        ) : (
          <View>
            {certifications.map((cert) => (
              <View key={cert.id} style={[styles.certCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <View style={styles.certHeader}>
                  <Ionicons
                    name={cert.verified ? 'checkmark-circle' : 'ribbon'}
                    size={24}
                    color={cert.verified ? '#10B981' : theme.tertiary}
                  />
                  <View style={styles.certInfo}>
                    <Text style={[styles.certName, { color: theme.text }]}>{cert.name}</Text>
                    {cert.issuedBy && (
                      <Text style={[styles.certIssuer, { color: theme.textSecondary }]}>
                        Issued by: {cert.issuedBy}
                      </Text>
                    )}
                    {cert.issueDate && (
                      <Text style={[styles.certDate, { color: theme.textSecondary }]}>
                        {cert.issueDate}
                        {cert.expiryDate && ` - ${cert.expiryDate}`}
                      </Text>
                    )}
                    {cert.verified && (
                      <Text style={[styles.verifiedBadge, { color: '#10B981' }]}>✓ Verified</Text>
                    )}
                  </View>
                  <TouchableOpacity
                    style={styles.certRemove}
                    onPress={() => removeCertification(cert.id)}
                  >
                    <Ionicons name="close-circle" size={24} color={theme.error} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );

  const renderAccountTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Appearance</Text>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Ionicons name={isDarkMode ? "moon" : "sunny"} size={24} color={theme.tertiary} />
            <View style={styles.settingText}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>Dark Mode</Text>
              <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
                Use dark theme for the app
              </Text>
            </View>
          </View>
          <Switch
            value={isDarkMode}
            onValueChange={toggleTheme}
            trackColor={{ false: theme.border, true: theme.tertiary + '50' }}
            thumbColor={isDarkMode ? theme.tertiary : '#f4f3f4'}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Account Actions</Text>

        <TouchableOpacity style={styles.actionButton} onPress={() => Alert.alert('Coming Soon', 'This feature will be available soon')}>
          <Ionicons name="help-circle" size={24} color={theme.tertiary} />
          <Text style={[styles.actionButtonText, { color: theme.text }]}>Help & Support</Text>
          <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={() => Alert.alert('Coming Soon', 'This feature will be available soon')}>
          <Ionicons name="document-text" size={24} color={theme.tertiary} />
          <Text style={[styles.actionButtonText, { color: theme.text }]}>Terms & Privacy</Text>
          <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.dangerButton]}
          onPress={() => Alert.alert(
            'Delete Account',
            'Are you sure you want to delete your account? This action cannot be undone.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Delete', style: 'destructive', onPress: () => console.log('Delete account') },
            ]
          )}
        >
          <Ionicons name="trash" size={24} color={theme.error} />
          <Text style={[styles.actionButtonText, { color: theme.error }]}>Delete Account</Text>
          <Ionicons name="chevron-forward" size={20} color={theme.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.tertiary} />
        <Text style={[styles.loadingText, { color: theme.text }]}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <LinearGradient
        colors={[theme.tertiary, theme.tertiary + 'CC']}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile & Settings</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      {/* Tabs */}
      <View style={[styles.tabsContainer, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'profile' && styles.activeTab]}
          onPress={() => setActiveTab('profile')}
        >
          <Ionicons name="person" size={20} color={activeTab === 'profile' ? theme.tertiary : theme.textSecondary} />
          <Text style={[styles.tabText, { color: activeTab === 'profile' ? theme.tertiary : theme.textSecondary }]}>
            Profile
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'professional' && styles.activeTab]}
          onPress={() => setActiveTab('professional')}
        >
          <Ionicons name="briefcase" size={20} color={activeTab === 'professional' ? theme.tertiary : theme.textSecondary} />
          <Text style={[styles.tabText, { color: activeTab === 'professional' ? theme.tertiary : theme.textSecondary }]}>
            Pro
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'notifications' && styles.activeTab]}
          onPress={() => setActiveTab('notifications')}
        >
          <Ionicons name="notifications" size={20} color={activeTab === 'notifications' ? theme.tertiary : theme.textSecondary} />
          <Text style={[styles.tabText, { color: activeTab === 'notifications' ? theme.tertiary : theme.textSecondary }]}>
            Alerts
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'privacy' && styles.activeTab]}
          onPress={() => setActiveTab('privacy')}
        >
          <Ionicons name="shield" size={20} color={activeTab === 'privacy' ? theme.tertiary : theme.textSecondary} />
          <Text style={[styles.tabText, { color: activeTab === 'privacy' ? theme.tertiary : theme.textSecondary }]}>
            Privacy
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'account' && styles.activeTab]}
          onPress={() => setActiveTab('account')}
        >
          <Ionicons name="settings" size={20} color={activeTab === 'account' ? theme.tertiary : theme.textSecondary} />
          <Text style={[styles.tabText, { color: activeTab === 'account' ? theme.tertiary : theme.textSecondary }]}>
            Account
          </Text>
        </TouchableOpacity>
      </View>

      {/* Error State */}
      {error && (
        <View style={{ padding: 16 }}>
          <ErrorState
            message={error}
            onRetry={loadProfileData}
            compact
          />
        </View>
      )}

      {/* Content */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Strength Indicator */}
        {user && !error && (
          <View style={{ padding: 16, paddingBottom: 0 }}>
            <ProfileStrengthIndicator
              user={user}
              onPress={() => setActiveTab('profile')}
              showDetails={false}
            />
          </View>
        )}

        {!error && activeTab === 'profile' && renderProfileTab()}
        {!error && activeTab === 'professional' && renderProfessionalTab()}
        {!error && activeTab === 'notifications' && renderNotificationsTab()}
        {!error && activeTab === 'privacy' && renderPrivacyTab()}
        {!error && activeTab === 'account' && renderAccountTab()}
      </ScrollView>

      {/* Save Button (only show for profile, notifications, and privacy tabs) */}
      {activeTab !== 'account' && (
        <View style={[styles.footer, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: theme.tertiary }]}
            onPress={saveProfile}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color="#FFF" />
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingHorizontal: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#3B82F6',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  tabContent: {
    padding: 16,
  },
  profilePictureSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profilePictureContainer: {
    position: 'relative',
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  profilePicturePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFF',
  },
  uploadHint: {
    marginTop: 8,
    fontSize: 12,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  hint: {
    fontSize: 11,
    marginTop: 4,
  },
  genderOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  genderButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  genderButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  visibilityOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  visibilityButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  visibilityButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  settingText: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  actionButtonText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  dangerButton: {
    borderBottomWidth: 0,
    marginTop: 8,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    gap: 8,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
  // Professional tab styles
  ratingCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  ratingHeader: {
    gap: 16,
  },
  ratingScoreContainer: {
    alignItems: 'center',
  },
  ratingScore: {
    fontSize: 48,
    fontWeight: '700',
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 8,
  },
  ratingCount: {
    fontSize: 13,
  },
  ratingBreakdown: {
    gap: 8,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  breakdownStar: {
    fontSize: 12,
    fontWeight: '600',
    width: 12,
  },
  breakdownBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  breakdownFill: {
    height: '100%',
    borderRadius: 3,
  },
  breakdownCount: {
    fontSize: 11,
    minWidth: 20,
    textAlign: 'right',
  },
  categoryOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  emptyStateText: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 4,
  },
  emptyStateHint: {
    fontSize: 12,
    textAlign: 'center',
  },
  certCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 12,
  },
  certHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  certInfo: {
    flex: 1,
  },
  certName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  certIssuer: {
    fontSize: 12,
    marginBottom: 2,
  },
  certDate: {
    fontSize: 11,
    marginBottom: 4,
  },
  verifiedBadge: {
    fontSize: 11,
    fontWeight: '600',
  },
  certRemove: {
    padding: 4,
  },
});
