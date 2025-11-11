import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { addressService, SavedAddress } from '../../services/addressService';

interface AddressState {
  addresses: SavedAddress[];
  isLoading: boolean;
  error: string | null;
}

export const fetchAddresses = createAsyncThunk<SavedAddress[], string, { rejectValue: string }>(
  'address/fetchAll',
  async (userId, { rejectWithValue }) => {
    try {
      return await addressService.getAllAddresses(userId);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch addresses');
    }
  }
);

export const createAddress = createAsyncThunk<
  SavedAddress,
  { userId: string; addressData: Omit<SavedAddress, 'userId' | '_id' | 'id' | 'createdAt' | 'updatedAt'> },
  { rejectValue: string }
>(
  'address/create',
  async ({ userId, addressData }, { rejectWithValue }) => {
    try {
      return await addressService.createAddress(userId, addressData);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create address');
    }
  }
);

export const updateAddress = createAsyncThunk<
  SavedAddress,
  { userId: string; addressId: string; addressData: Partial<SavedAddress> },
  { rejectValue: string }
>(
  'address/update',
  async ({ userId, addressId, addressData }, { rejectWithValue }) => {
    try {
      return await addressService.updateAddress(userId, addressId, addressData);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update address');
    }
  }
);

export const deleteAddress = createAsyncThunk<
  string,
  { userId: string; addressId: string },
  { rejectValue: string }
>(
  'address/delete',
  async ({ userId, addressId }, { rejectWithValue }) => {
    try {
      await addressService.deleteAddress(userId, addressId);
      return addressId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete address');
    }
  }
);

const initialState: AddressState = {
  addresses: [],
  isLoading: false,
  error: null,
};

const addressSlice = createSlice({
  name: 'address',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAddresses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAddresses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.addresses = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchAddresses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch addresses';
      })
      .addCase(createAddress.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createAddress.fulfilled, (state, action) => {
        state.isLoading = false;
        state.addresses.push(action.payload);
      })
      .addCase(createAddress.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to create address';
      })
      .addCase(updateAddress.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateAddress.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.addresses.findIndex(a => a._id === action.payload._id || a.id === action.payload.id);
        if (index !== -1) {
          state.addresses[index] = action.payload;
        }
      })
      .addCase(updateAddress.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to update address';
      })
      .addCase(deleteAddress.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteAddress.fulfilled, (state, action) => {
        state.isLoading = false;
        state.addresses = state.addresses.filter(a => a._id !== action.payload && a.id !== action.payload);
      })
      .addCase(deleteAddress.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to delete address';
      });
  },
});

export const { clearError } = addressSlice.actions;
export default addressSlice.reducer;
