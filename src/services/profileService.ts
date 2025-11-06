// src/services/profileService.ts
import api from './api';
import { User } from '../types';

export interface UpdateProfileData {
  name?: string;
  profilePicture?: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  location?: string;
  professionalTitle?: string;
  bio?: string;
  notificationPreferences?: {
    pushNotifications: boolean;
    emailNotifications: boolean;
    smsNotifications: boolean;
    orderUpdates: boolean;
    promotions: boolean;
    tripReminders: boolean;
  };
  privacySettings?: {
    profileVisibility: 'public' | 'private';
    showPhone: boolean;
    showLocation: boolean;
    allowMessages: boolean;
  };
}

export const profileService = {
  /**
   * Get user profile
   */
  getProfile: async (userId: string): Promise<User> => {
    const response = await api.get(`/users/${userId}/profile`);
    return response.data;
  },

  /**
   * Update user profile
   */
  updateProfile: async (userId: string, data: UpdateProfileData): Promise<User> => {
    const response = await api.put(`/users/${userId}/profile`, data);
    return response.data;
  },

  /**
   * Upload profile picture
   */
  uploadProfilePicture: async (userId: string, imageUri: string): Promise<string> => {
    const formData = new FormData();

    // Extract filename from URI
    const filename = imageUri.split('/').pop() || 'profile.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    formData.append('profilePicture', {
      uri: imageUri,
      name: filename,
      type,
    } as any);

    const response = await api.post(`/users/${userId}/profile-picture`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.profilePictureUrl;
  },

  /**
   * Update notification preferences
   */
  updateNotificationPreferences: async (
    userId: string,
    preferences: UpdateProfileData['notificationPreferences']
  ): Promise<User> => {
    const response = await api.put(`/users/${userId}/notifications`, {
      notificationPreferences: preferences,
    });
    return response.data;
  },

  /**
   * Update privacy settings
   */
  updatePrivacySettings: async (
    userId: string,
    settings: UpdateProfileData['privacySettings']
  ): Promise<User> => {
    const response = await api.put(`/users/${userId}/privacy`, {
      privacySettings: settings,
    });
    return response.data;
  },

  /**
   * Delete user account
   */
  deleteAccount: async (userId: string): Promise<void> => {
    await api.delete(`/users/${userId}`);
  },
};

export default profileService;
