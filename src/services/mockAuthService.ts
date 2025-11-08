// Mock Authentication Service for Testing
// This provides local authentication when backend is unavailable

import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock user database
// Two-role system: shipper (requests transport) and transporter (delivers)
interface MockUser {
  _id: string;
  name: string;
  phone: string;
  password: string;
  role: 'shipper' | 'transporter' | 'farmer'; // Support legacy farmer role
  token: string;
  email?: string;
}

// Store users in memory and AsyncStorage
// Two test users: one shipper, one transporter
let mockUsers: MockUser[] = [
  {
    _id: '1',
    name: 'John Farmer (Shipper)',
    phone: '0788000001',
    password: 'password123',
    role: 'farmer', // Legacy role, will be normalized to 'shipper'
    token: 'shipper_token_123',
  },
  {
    _id: '3',
    name: 'Mike Transporter',
    phone: '0789000003',
    password: 'password123',
    role: 'transporter',
    token: 'transporter_token_123',
  },
];

// Generate unique ID
const generateId = () => '_' + Math.random().toString(36).substr(2, 9);

// Generate token
const generateToken = () => 'token_' + Math.random().toString(36).substr(2, 20);

// Normalize phone numbers to handle both formats (0788123456 and +250788123456)
const normalizePhone = (phone: string): string => {
  if (!phone) return '';
  
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '');
  
  // If starts with 250 (Rwanda country code), keep as is for now
  if (cleaned.startsWith('250')) {
    cleaned = cleaned.substring(3); // Remove 250
  }
  
  // Remove leading zero if present (we'll add it back)
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1);
  }
  
  // Get last 9 digits (in case extra leading digits)
  cleaned = cleaned.slice(-9);
  
  // Return with leading 0
  return '0' + cleaned;
};

export const mockAuthService = {
  /**
   * Register a new user
   * Two-role system: shipper or transporter
   */
  register: async (userData: {
    name: string;
    phone: string;
    password: string;
    role: 'shipper' | 'transporter' | 'farmer'; // Support legacy farmer
  }) => {
    // Validate input
    if (!userData.name || !userData.phone || !userData.password || !userData.role) {
      throw new Error('All fields are required');
    }

    if (userData.name.length < 3) {
      throw new Error('Name must be at least 3 characters');
    }

    if (userData.phone.length < 10) {
      throw new Error('Invalid phone number');
    }

    if (userData.password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    // Normalize phone number
    const normalizedPhone = normalizePhone(userData.phone);

    // Check if user already exists (compare normalized phones)
    const existingUser = mockUsers.find((u) => normalizePhone(u.phone) === normalizedPhone);
    if (existingUser) {
      throw new Error('Phone number already registered');
    }

    // Create new user with normalized phone
    const newUser: MockUser = {
      _id: generateId(),
      name: userData.name,
      phone: normalizedPhone,
      password: userData.password,
      role: userData.role,
      token: generateToken(),
    };

    mockUsers.push(newUser);

    // Save to AsyncStorage
    await AsyncStorage.setItem('mockUsers', JSON.stringify(mockUsers));
    await AsyncStorage.setItem('token', newUser.token);

    // Return user without password
    return {
      _id: newUser._id,
      name: newUser.name,
      phone: newUser.phone,
      role: newUser.role === 'farmer' ? 'shipper' : newUser.role, // Normalize 'farmer' to 'shipper'
      token: newUser.token,
    };
  },

  /**
   * Login user with phone and password
   */
  login: async (credentials: { phone: string; password: string }) => {
    // Validate input
    if (!credentials.phone || !credentials.password) {
      throw new Error('Phone number and password are required');
    }

    if (credentials.phone.length < 10) {
      throw new Error('Invalid phone number format');
    }

    if (credentials.password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    // Normalize phone number and find user
    const normalizedPhone = normalizePhone(credentials.phone);
    mockUsers.forEach((u, i) => {
      const normalized = normalizePhone(u.phone);
    });
    
    const user = mockUsers.find((u) => normalizePhone(u.phone) === normalizedPhone);

    if (!user) {
      console.error('❌ User not found for normalized phone:', normalizedPhone);
      console.error('   Expected one of:', mockUsers.map(u => normalizePhone(u.phone)));
      throw new Error('User not found');
    }

    // Verify password (IMPORTANT: Compare exactly)
    if (user.password !== credentials.password) {
      console.error('❌ Invalid password for user:', normalizedPhone);
      throw new Error('Invalid password');
    }

    // Save token
    await AsyncStorage.setItem('token', user.token);
    
        // Return user without password
    return {
      _id: user._id,
      name: user.name,
      phone: user.phone,
      role: user.role === 'farmer' ? 'shipper' : user.role, // Normalize 'farmer' to 'shipper'
      token: user.token,
    };
  },

  /**
   * Get current user from token
   */
  getCurrentUser: async () => {
    const token = await AsyncStorage.getItem('token');

    if (!token) {
      throw new Error('No token found');
    }

    // Find user by token
    const user = mockUsers.find((u) => u.token === token);

    if (!user) {
      throw new Error('User not found');
    }

    // Return user without password
    return {
      _id: user._id,
      name: user.name,
      phone: user.phone,
      role: user.role,
    };
  },

  /**
   * Logout user
   */
  logout: async () => {
    await AsyncStorage.removeItem('token');
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: async () => {
    const token = await AsyncStorage.getItem('token');
    return !!token && mockUsers.some((u) => u.token === token);
  },

  /**
   * Initialize mock users (call on app start)
   */
  initializeMockUsers: async () => {
    // Always reset to default demo users
    const defaultUsers: MockUser[] = [
      {
        _id: '1',
        name: 'John Farmer (Shipper)',
        phone: '0788000001',
        password: 'password123',
        role: 'farmer',
        token: 'shipper_token_123',
      },
      {
        _id: '3',
        name: 'Mike Transporter',
        phone: '0789000003',
        password: 'password123',
        role: 'transporter',
        token: 'transporter_token_123',
      },
    ];

    try {
      mockUsers = defaultUsers;
      // Clear old stored users and save defaults
      await AsyncStorage.removeItem('mockUsers');
      await AsyncStorage.setItem('mockUsers', JSON.stringify(mockUsers));
          } catch (error) {
      mockUsers = defaultUsers;
    }
  },
};

export default mockAuthService;