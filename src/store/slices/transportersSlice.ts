// src/store/slices/transportersSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as transporterService from '../../services/transporterService';
import { Transporter } from '../../services/transporterService';

interface TransportersState {
  transporters: Transporter[];
  availableTransporters: Transporter[];
  selectedTransporter: Transporter | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Async thunks
 */
export const fetchTransporters = createAsyncThunk<Transporter[], void, { rejectValue: string }>(
  'transporters/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await transporterService.getAllTransporters();
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch transporters'
      );
    }
  }
);

export const fetchAvailableTransporters = createAsyncThunk<
  Transporter[],
  void,
  { rejectValue: string }
>(
  'transporters/fetchAvailable',
  async (_, { rejectWithValue }) => {
    try {
      return await transporterService.getAvailableTransporters();
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch available transporters'
      );
    }
  }
);

export const getTransporterById = createAsyncThunk<
  Transporter,
  string,
  { rejectValue: string }
>(
  'transporters/getById',
  async (id, { rejectWithValue }) => {
    try {
      return await transporterService.getTransporterById(id);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch transporter'
      );
    }
  }
);

export const updateTransporterProfile = createAsyncThunk<
  Transporter,
  { id: string; data: Partial<Transporter> },
  { rejectValue: string }
>(
  'transporters/updateProfile',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await transporterService.updateTransporterProfile(id, data);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update profile'
      );
    }
  }
);

/**
 * Initial state
 */
const initialState: TransportersState = {
  transporters: [],
  availableTransporters: [],
  selectedTransporter: null,
  isLoading: false,
  error: null,
};

/**
 * Transporters slice
 */
const transportersSlice = createSlice({
  name: 'transporters',
  initialState,
  reducers: {
    selectTransporter: (state, action) => {
      state.selectedTransporter = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearTransporters: (state) => {
      state.transporters = [];
      state.availableTransporters = [];
      state.selectedTransporter = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all transporters
      .addCase(fetchTransporters.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTransporters.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transporters = action.payload;
      })
      .addCase(fetchTransporters.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch transporters';
      })
      // Fetch available transporters
      .addCase(fetchAvailableTransporters.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAvailableTransporters.fulfilled, (state, action) => {
        state.isLoading = false;
        state.availableTransporters = action.payload;
      })
      .addCase(fetchAvailableTransporters.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch available transporters';
      })
      // Get transporter by ID
      .addCase(getTransporterById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getTransporterById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedTransporter = action.payload;
      })
      .addCase(getTransporterById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch transporter';
      })
      // Update profile
      .addCase(updateTransporterProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateTransporterProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedTransporter = action.payload;
        // Update in transporters list if exists
        const index = state.transporters.findIndex(
          (t) => t._id === action.payload._id
        );
        if (index !== -1) {
          state.transporters[index] = action.payload;
        }
      })
      .addCase(updateTransporterProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to update profile';
      });
  },
});

export const { selectTransporter, clearError, clearTransporters } =
  transportersSlice.actions;
export default transportersSlice.reducer;