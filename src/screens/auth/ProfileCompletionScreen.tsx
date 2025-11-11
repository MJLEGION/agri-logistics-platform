// src/screens/auth/ProfileCompletionScreen.tsx
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  ActionSheetIOS,
  Animated,
  Dimensions,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import ConfettiCannon from 'react-native-confetti-cannon';
import { useTheme } from '../../contexts/ThemeContext';
import { useAppSelector } from '../../store';
import { showToast } from '../../services/toastService';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';

const { width } = Dimensions.get('window');

const STEPS = {
  WELCOME: 0,
  PHOTO: 1,
  PERSONAL: 2,
  PROFESSIONAL: 3,
  ROLE_SPECIFIC: 4,
  EMERGENCY: 5,
  PREFERENCES: 6,
  COMPLETE: 7,
};

interface ProfileCompletionData {
  profilePicture?: string;
  age?: string;
  gender?: 'male' | 'female' | 'other' | '';
  location?: string;
  professionalTitle?: string;
  bio?: string;
  // Transporter specific
  vehicleType?: string;
  vehicleModel?: string;
  licensePlate?: string;
  // Shipper specific
  businessName?: string;
  businessType?: string;
  // Emergency contact
  emergencyName?: string;
  emergencyPhone?: string;
  emergencyRelation?: string;
  // Preferences
  language?: 'english' | 'kinyarwanda' | 'french';
  enableNotifications?: boolean;
}

export default function ProfileCompletionScreen({ navigation, route }: any) {
  const { theme } = useTheme();
  const user = useAppSelector((state) => state.auth.user);
  const confettiRef = useRef<any>(null);

  const [currentStep, setCurrentStep] = useState(STEPS.WELCOME);
  const [profileData, setProfileData] = useState<ProfileCompletionData>({
    gender: '',
    language: 'english',
    enableNotifications: true,
  });
  const [saving, setSaving] = useState(false);
  const [showSkipDialog, setShowSkipDialog] = useState(false);

  const progressAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const totalSteps = 7;
  const progress = (currentStep / totalSteps) * 100;

  React.useEffect(() => {
    Animated.spring(progressAnim, {
      toValue: progress,
      useNativeDriver: false,
    }).start();
  }, [currentStep]);

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
      showToast.error('Failed to pick image');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        showToast.warning('We need camera permissions to take a photo.');
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
      showToast.error('Failed to take photo');
    }
  };

  const handleNext = () => {
    if (currentStep < STEPS.COMPLETE) {
      Animated.timing(slideAnim, {
        toValue: -width,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setCurrentStep(currentStep + 1);
        slideAnim.setValue(width);
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
    }

    if (currentStep === STEPS.COMPLETE - 1) {
      confettiRef.current?.start();
    }
  };

  const handleBack = () => {
    if (currentStep > STEPS.WELCOME) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    setShowSkipDialog(true);
  };

  const handleConfirmSkip = () => {
    setShowSkipDialog(false);
    navigation.replace(user?.role === 'transporter' ? 'TransporterHome' : 'ShipperHome');
  };

  const handlePhotoSelection = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Take Photo', 'Choose from Library'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            takePhoto();
          } else if (buttonIndex === 2) {
            pickImage();
          }
        }
      );
    } else {
      // For Android/Web, show a simple choice via toast and buttons
      // Since we don't have a good cross-platform ActionSheet, we'll just directly call pickImage
      // User can add a third-party library like @expo/action-sheet if needed
      pickImage();
    }
  };

  const handleComplete = async () => {
    setSaving(true);
    try {
      // TODO: Save profile data to API
      // await profileService.updateProfile(user?._id, profileData);

      setTimeout(() => {
        setSaving(false);
        navigation.replace(user?.role === 'transporter' ? 'TransporterHome' : 'ShipperHome');
      }, 1500);
    } catch (error) {
      setSaving(false);
      showToast.error('Failed to save profile. Please try again.');
    }
  };

  const renderWelcomeStep = () => (
    <View style={styles.stepContainer}>
      <Animated.View style={[styles.iconContainer, { backgroundColor: theme.tertiary + '20' }]}>
        <Ionicons name="person-add" size={60} color={theme.tertiary} />
      </Animated.View>
      <Text style={[styles.stepTitle, { color: theme.text }]}>Welcome aboard! 🎉</Text>
      <Text style={[styles.stepDescription, { color: theme.textSecondary }]}>
        Let's set up your profile in just a few minutes. This helps us personalize your experience and connect you with the right {user?.role === 'transporter' ? 'loads' : 'transporters'}.
      </Text>
      <View style={styles.benefitsList}>
        <View style={styles.benefitItem}>
          <Ionicons name="checkmark-circle" size={24} color={theme.success} />
          <Text style={[styles.benefitText, { color: theme.text }]}>Build trust in the community</Text>
        </View>
        <View style={styles.benefitItem}>
          <Ionicons name="flash" size={24} color={theme.warning} />
          <Text style={[styles.benefitText, { color: theme.text }]}>Get faster responses</Text>
        </View>
        <View style={styles.benefitItem}>
          <Ionicons name="trophy" size={24} color={theme.tertiary} />
          <Text style={[styles.benefitText, { color: theme.text }]}>
            {user?.role === 'transporter' ? 'Stand out to shippers' : 'Find reliable transporters'}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderPhotoStep = () => (
    <View style={styles.stepContainer}>
      <Text style={[styles.stepTitle, { color: theme.text }]}>Add Your Photo</Text>
      <Text style={[styles.stepDescription, { color: theme.textSecondary }]}>
        A profile picture helps others recognize you and builds trust
      </Text>
      <TouchableOpacity
        onPress={handlePhotoSelection}
        style={styles.photoContainer}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Add profile photo"
        accessibilityHint="Choose or take a photo for your profile"
      >
        {profileData.profilePicture ? (
          <Image source={{ uri: profileData.profilePicture }} style={styles.profilePhoto} />
        ) : (
          <View style={[styles.photoPlaceholder, { backgroundColor: theme.tertiary + '20' }]}>
            <Ionicons name="camera" size={40} color={theme.tertiary} />
            <Text style={[styles.photoHint, { color: theme.tertiary }]}>Tap to add photo</Text>
          </View>
        )}
      </TouchableOpacity>
      <Text style={[styles.optionalHint, { color: theme.textSecondary }]}>
        Optional - You can add this later
      </Text>
    </View>
  );

  const renderPersonalStep = () => (
    <ScrollView style={styles.stepContainer} showsVerticalScrollIndicator={false}>
      <Text style={[styles.stepTitle, { color: theme.text }]}>Personal Details</Text>
      <Text style={[styles.stepDescription, { color: theme.textSecondary }]}>
        Help us know you better
      </Text>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: theme.text }]}>Age (Optional)</Text>
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
        <Text style={[styles.label, { color: theme.text }]}>Gender (Optional)</Text>
        <View style={styles.optionButtons}>
          {[
            { value: 'male', icon: 'male', label: 'Male' },
            { value: 'female', icon: 'female', label: 'Female' },
            { value: 'other', icon: 'transgender', label: 'Other' },
          ].map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.optionButton,
                { borderColor: theme.border },
                profileData.gender === option.value && {
                  backgroundColor: theme.tertiary,
                  borderColor: theme.tertiary,
                },
              ]}
              onPress={() => setProfileData({ ...profileData, gender: option.value as any })}
            >
              <Ionicons
                name={option.icon as any}
                size={20}
                color={profileData.gender === option.value ? '#FFF' : theme.text}
              />
              <Text
                style={[
                  styles.optionButtonText,
                  { color: profileData.gender === option.value ? '#FFF' : theme.text },
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: theme.text }]}>Location (Optional)</Text>
        <View style={[styles.inputWithIcon, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Ionicons name="location" size={20} color={theme.textSecondary} />
          <TextInput
            style={[styles.inputText, { color: theme.text }]}
            value={profileData.location}
            onChangeText={(text) => setProfileData({ ...profileData, location: text })}
            placeholder="e.g., Kigali, Musanze"
            placeholderTextColor={theme.textSecondary}
          />
        </View>
      </View>
    </ScrollView>
  );

  const renderProfessionalStep = () => (
    <ScrollView style={styles.stepContainer} showsVerticalScrollIndicator={false}>
      <Text style={[styles.stepTitle, { color: theme.text }]}>Professional Info</Text>
      <Text style={[styles.stepDescription, { color: theme.textSecondary }]}>
        Tell others about your experience
      </Text>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: theme.text }]}>
          {user?.role === 'transporter' ? 'Your Title (e.g., Professional Truck Driver)' : 'Your Title (e.g., Farmer, Distributor)'}
        </Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
          value={profileData.professionalTitle}
          onChangeText={(text) => setProfileData({ ...profileData, professionalTitle: text })}
          placeholder="Enter your professional title"
          placeholderTextColor={theme.textSecondary}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: theme.text }]}>Bio (Optional)</Text>
        <TextInput
          style={[styles.input, styles.textArea, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
          value={profileData.bio}
          onChangeText={(text) => setProfileData({ ...profileData, bio: text })}
          placeholder="Tell us about yourself and your experience..."
          placeholderTextColor={theme.textSecondary}
          multiline
          numberOfLines={4}
        />
      </View>
    </ScrollView>
  );

  const renderRoleSpecificStep = () => (
    <ScrollView style={styles.stepContainer} showsVerticalScrollIndicator={false}>
      <Text style={[styles.stepTitle, { color: theme.text }]}>
        {user?.role === 'transporter' ? 'Vehicle Information' : 'Business Information'}
      </Text>
      <Text style={[styles.stepDescription, { color: theme.textSecondary }]}>
        {user?.role === 'transporter'
          ? 'Help shippers know about your vehicle'
          : 'Tell transporters about your business'}
      </Text>

      {user?.role === 'transporter' ? (
        <>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.text }]}>Vehicle Type</Text>
            <View style={styles.optionButtons}>
              {[
                { value: 'motorcycle', icon: 'bicycle', label: 'Motorcycle' },
                { value: 'van', icon: 'car', label: 'Van' },
                { value: 'truck', icon: 'car-sport', label: 'Truck' },
              ].map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionButton,
                    { borderColor: theme.border },
                    profileData.vehicleType === option.value && {
                      backgroundColor: theme.tertiary,
                      borderColor: theme.tertiary,
                    },
                  ]}
                  onPress={() => setProfileData({ ...profileData, vehicleType: option.value })}
                >
                  <Ionicons
                    name={option.icon as any}
                    size={20}
                    color={profileData.vehicleType === option.value ? '#FFF' : theme.text}
                  />
                  <Text
                    style={[
                      styles.optionButtonText,
                      { color: profileData.vehicleType === option.value ? '#FFF' : theme.text },
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.text }]}>Vehicle Model (Optional)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
              value={profileData.vehicleModel}
              onChangeText={(text) => setProfileData({ ...profileData, vehicleModel: text })}
              placeholder="e.g., Toyota Hilux, Honda CG125"
              placeholderTextColor={theme.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.text }]}>License Plate (Optional)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
              value={profileData.licensePlate}
              onChangeText={(text) => setProfileData({ ...profileData, licensePlate: text })}
              placeholder="e.g., RAD 123 A"
              placeholderTextColor={theme.textSecondary}
              autoCapitalize="characters"
            />
          </View>
        </>
      ) : (
        <>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.text }]}>Business Name (Optional)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
              value={profileData.businessName}
              onChangeText={(text) => setProfileData({ ...profileData, businessName: text })}
              placeholder="e.g., Green Valley Farms"
              placeholderTextColor={theme.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.text }]}>Business Type (Optional)</Text>
            <View style={styles.optionButtons}>
              {[
                { value: 'farm', icon: 'leaf', label: 'Farm' },
                { value: 'distributor', icon: 'business', label: 'Distributor' },
                { value: 'cooperative', icon: 'people', label: 'Cooperative' },
              ].map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionButton,
                    { borderColor: theme.border },
                    profileData.businessType === option.value && {
                      backgroundColor: theme.tertiary,
                      borderColor: theme.tertiary,
                    },
                  ]}
                  onPress={() => setProfileData({ ...profileData, businessType: option.value })}
                >
                  <Ionicons
                    name={option.icon as any}
                    size={20}
                    color={profileData.businessType === option.value ? '#FFF' : theme.text}
                  />
                  <Text
                    style={[
                      styles.optionButtonText,
                      { color: profileData.businessType === option.value ? '#FFF' : theme.text },
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </>
      )}
    </ScrollView>
  );

  const renderEmergencyStep = () => (
    <ScrollView style={styles.stepContainer} showsVerticalScrollIndicator={false}>
      <Text style={[styles.stepTitle, { color: theme.text }]}>Emergency Contact</Text>
      <Text style={[styles.stepDescription, { color: theme.textSecondary }]}>
        Optional but recommended for your safety
      </Text>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: theme.text }]}>Contact Name</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
          value={profileData.emergencyName}
          onChangeText={(text) => setProfileData({ ...profileData, emergencyName: text })}
          placeholder="Full name"
          placeholderTextColor={theme.textSecondary}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: theme.text }]}>Contact Phone</Text>
        <View style={[styles.inputWithIcon, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Ionicons name="call" size={20} color={theme.textSecondary} />
          <TextInput
            style={[styles.inputText, { color: theme.text }]}
            value={profileData.emergencyPhone}
            onChangeText={(text) => setProfileData({ ...profileData, emergencyPhone: text })}
            placeholder="Phone number"
            placeholderTextColor={theme.textSecondary}
            keyboardType="phone-pad"
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: theme.text }]}>Relationship</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
          value={profileData.emergencyRelation}
          onChangeText={(text) => setProfileData({ ...profileData, emergencyRelation: text })}
          placeholder="e.g., Spouse, Parent, Sibling"
          placeholderTextColor={theme.textSecondary}
        />
      </View>
    </ScrollView>
  );

  const renderPreferencesStep = () => (
    <View style={styles.stepContainer}>
      <Text style={[styles.stepTitle, { color: theme.text }]}>Preferences</Text>
      <Text style={[styles.stepDescription, { color: theme.textSecondary }]}>
        Customize your experience
      </Text>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: theme.text }]}>Preferred Language</Text>
        <View style={styles.optionButtons}>
          {[
            { value: 'english', label: 'English' },
            { value: 'kinyarwanda', label: 'Kinyarwanda' },
            { value: 'french', label: 'French' },
          ].map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.optionButton,
                { borderColor: theme.border },
                profileData.language === option.value && {
                  backgroundColor: theme.tertiary,
                  borderColor: theme.tertiary,
                },
              ]}
              onPress={() => setProfileData({ ...profileData, language: option.value as any })}
            >
              <Text
                style={[
                  styles.optionButtonText,
                  { color: profileData.language === option.value ? '#FFF' : theme.text },
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity
        style={styles.settingRow}
        onPress={() => setProfileData({ ...profileData, enableNotifications: !profileData.enableNotifications })}
      >
        <View style={styles.settingInfo}>
          <Ionicons name="notifications" size={24} color={theme.tertiary} />
          <View style={styles.settingText}>
            <Text style={[styles.settingLabel, { color: theme.text }]}>Enable Notifications</Text>
            <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
              Get updates about your orders and trips
            </Text>
          </View>
        </View>
        <View
          style={[
            styles.checkbox,
            { borderColor: theme.border },
            profileData.enableNotifications && { backgroundColor: theme.tertiary, borderColor: theme.tertiary },
          ]}
        >
          {profileData.enableNotifications && <Ionicons name="checkmark" size={18} color="#FFF" />}
        </View>
      </TouchableOpacity>
    </View>
  );

  const renderCompleteStep = () => (
    <View style={styles.stepContainer}>
      <Animated.View style={[styles.successIconContainer, { backgroundColor: theme.success + '20' }]}>
        <Ionicons name="checkmark-circle" size={80} color={theme.success} />
      </Animated.View>
      <Text style={[styles.stepTitle, { color: theme.text }]}>You're All Set! 🎉</Text>
      <Text style={[styles.stepDescription, { color: theme.textSecondary }]}>
        Your profile is now complete. You're ready to {user?.role === 'transporter' ? 'start delivering' : 'find transporters'}!
      </Text>
      <View style={styles.completionStats}>
        <View style={styles.statItem}>
          <Ionicons name="speedometer" size={32} color={theme.tertiary} />
          <Text style={[styles.statLabel, { color: theme.text }]}>5x Faster</Text>
          <Text style={[styles.statValue, { color: theme.textSecondary }]}>Response rate</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="shield-checkmark" size={32} color={theme.success} />
          <Text style={[styles.statLabel, { color: theme.text }]}>Verified</Text>
          <Text style={[styles.statValue, { color: theme.textSecondary }]}>Profile status</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="star" size={32} color={theme.warning} />
          <Text style={[styles.statLabel, { color: theme.text }]}>Premium</Text>
          <Text style={[styles.statValue, { color: theme.textSecondary }]}>Experience</Text>
        </View>
      </View>
      <ConfettiCannon
        ref={confettiRef}
        count={200}
        origin={{ x: width / 2, y: -10 }}
        autoStart={false}
        fadeOut
      />
    </View>
  );

  const renderStep = () => {
    switch (currentStep) {
      case STEPS.WELCOME:
        return renderWelcomeStep();
      case STEPS.PHOTO:
        return renderPhotoStep();
      case STEPS.PERSONAL:
        return renderPersonalStep();
      case STEPS.PROFESSIONAL:
        return renderProfessionalStep();
      case STEPS.ROLE_SPECIFIC:
        return renderRoleSpecificStep();
      case STEPS.EMERGENCY:
        return renderEmergencyStep();
      case STEPS.PREFERENCES:
        return renderPreferencesStep();
      case STEPS.COMPLETE:
        return renderCompleteStep();
      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <LinearGradient colors={[theme.tertiary, theme.tertiary + 'CC']} style={styles.header}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.backButton}
          disabled={currentStep === STEPS.WELCOME}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          accessibilityHint="Return to previous step"
          accessibilityState={{ disabled: currentStep === STEPS.WELCOME }}
        >
          <Ionicons name="arrow-back" size={24} color={currentStep === STEPS.WELCOME ? 'transparent' : '#FFF'} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Complete Your Profile</Text>
          <Text style={styles.headerSubtitle}>
            Step {currentStep + 1} of {totalSteps + 1}
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleSkip}
          style={styles.skipButton}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Skip profile setup"
          accessibilityHint="Skip profile completion and go to home screen"
        >
          <Text style={styles.skipButtonText}>Skip</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* Progress Bar */}
      <View style={[styles.progressBarContainer, { backgroundColor: theme.card }]}>
        <Animated.View
          style={[
            styles.progressBar,
            {
              backgroundColor: theme.tertiary,
              width: progressAnim.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>

      {/* Content */}
      <View style={styles.content}>{renderStep()}</View>

      {/* Footer */}
      <View style={[styles.footer, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
        <TouchableOpacity
          style={[
            styles.nextButton,
            { backgroundColor: theme.tertiary },
            saving && { opacity: 0.6 },
          ]}
          onPress={currentStep === STEPS.COMPLETE ? handleComplete : handleNext}
          disabled={saving}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={currentStep === STEPS.COMPLETE ? 'Get started' : 'Continue to next step'}
          accessibilityHint={currentStep === STEPS.COMPLETE ? 'Save profile and go to home screen' : 'Proceed to next profile setup step'}
          accessibilityState={{ disabled: saving, busy: saving }}
        >
          <Text style={styles.nextButtonText}>
            {saving ? 'Saving...' : currentStep === STEPS.COMPLETE ? 'Get Started' : 'Continue'}
          </Text>
          {!saving && <Ionicons name="arrow-forward" size={20} color="#FFF" />}
        </TouchableOpacity>
      </View>

      {/* Skip Confirmation Dialog */}
      <ConfirmDialog
        visible={showSkipDialog}
        title="Skip Profile Completion?"
        message="You can always complete your profile later from Settings. However, a complete profile helps you:\n\n• Build trust with other users\n• Get better matches\n• Receive important updates\n\nAre you sure you want to skip?"
        cancelText="Continue Setup"
        confirmText="Skip for Now"
        onCancel={() => setShowSkipDialog(false)}
        onConfirm={handleConfirmSkip}
        isDestructive={true}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#FFF',
    opacity: 0.8,
    marginTop: 2,
  },
  skipButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  skipButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  progressBarContainer: {
    height: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
  },
  content: {
    flex: 1,
  },
  stepContainer: {
    flex: 1,
    padding: 24,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 24,
  },
  successIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 24,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  stepDescription: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  benefitsList: {
    gap: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  benefitText: {
    fontSize: 15,
    fontWeight: '500',
  },
  photoContainer: {
    alignSelf: 'center',
    marginBottom: 16,
  },
  profilePhoto: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  photoPlaceholder: {
    width: 150,
    height: 150,
    borderRadius: 75,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoHint: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
  },
  optionalHint: {
    textAlign: 'center',
    fontSize: 12,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    fontSize: 14,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    gap: 10,
  },
  inputText: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 14,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  optionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  optionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  optionButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginTop: 20,
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
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completionStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 32,
  },
  statItem: {
    alignItems: 'center',
    gap: 8,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  statValue: {
    fontSize: 11,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  nextButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
