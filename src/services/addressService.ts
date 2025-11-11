import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SavedAddress {
  _id?: string;
  id?: string;
  userId: string;
  label: string;
  address: string;
  latitude: number;
  longitude: number;
  type: 'home' | 'office' | 'warehouse' | 'farm' | 'other';
  isDefault?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const STORAGE_KEY = 'agri_saved_addresses';

export const addressService = {
  getAllAddresses: async (userId: string): Promise<SavedAddress[]> => {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const allAddresses = JSON.parse(stored);
    return allAddresses.filter((addr: SavedAddress) => addr.userId === userId);
  },

  createAddress: async (userId: string, addressData: Omit<SavedAddress, 'userId' | '_id' | 'id' | 'createdAt' | 'updatedAt'>): Promise<SavedAddress> => {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    const allAddresses = stored ? JSON.parse(stored) : [];
    
    const newAddress: SavedAddress = {
      _id: `addr_${Date.now()}`,
      id: `addr_${Date.now()}`,
      userId,
      ...addressData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    allAddresses.push(newAddress);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(allAddresses));
    return newAddress;
  },

  updateAddress: async (userId: string, addressId: string, addressData: Partial<SavedAddress>): Promise<SavedAddress> => {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    const allAddresses = stored ? JSON.parse(stored) : [];
    
    const index = allAddresses.findIndex((addr: SavedAddress) => 
      (addr._id === addressId || addr.id === addressId) && addr.userId === userId
    );
    
    if (index === -1) throw new Error('Address not found');
    
    const updated = {
      ...allAddresses[index],
      ...addressData,
      updatedAt: new Date().toISOString(),
    };
    
    allAddresses[index] = updated;
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(allAddresses));
    return updated;
  },

  deleteAddress: async (userId: string, addressId: string): Promise<void> => {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    const allAddresses = stored ? JSON.parse(stored) : [];
    
    const filtered = allAddresses.filter((addr: SavedAddress) => 
      !((addr._id === addressId || addr.id === addressId) && addr.userId === userId)
    );
    
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  },

  setDefaultAddress: async (userId: string, addressId: string): Promise<SavedAddress> => {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    const allAddresses = stored ? JSON.parse(stored) : [];
    
    allAddresses.forEach((addr: SavedAddress) => {
      if (addr.userId === userId) {
        addr.isDefault = addr._id === addressId || addr.id === addressId;
      }
    });
    
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(allAddresses));
    
    const updated = allAddresses.find((addr: SavedAddress) => 
      (addr._id === addressId || addr.id === addressId) && addr.userId === userId
    );
    
    return updated;
  },
};
