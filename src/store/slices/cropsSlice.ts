import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as cropService from '../../services/cropService';

// Async thunks
export const fetchCrops = createAsyncThunk(
  'crops/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await cropService.getAllCrops();
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch crops');
    }
  }
);

export const createCrop = createAsyncThunk(
  'crops/create',
  async (cropData, { rejectWithValue }) => {
    try {
      return await cropService.createCrop(cropData);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create crop');
    }
  }
);

export const updateCrop = createAsyncThunk(
  'crops/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await cropService.updateCrop(id, data);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update crop');
    }
  }
);

export const deleteCrop = createAsyncThunk(
  'crops/delete',
  async (id, { rejectWithValue }) => {
    try {
      await cropService.deleteCrop(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete crop');
    }
  }
);

const cropsSlice = createSlice({
  name: 'crops',
  initialState: {
    crops: [],
    isLoading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch crops
      .addCase(fetchCrops.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCrops.fulfilled, (state, action) => {
        state.isLoading = false;
        state.crops = action.payload;
      })
      .addCase(fetchCrops.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Create crop
      .addCase(createCrop.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createCrop.fulfilled, (state, action) => {
        state.isLoading = false;
        state.crops.push(action.payload);
      })
      .addCase(createCrop.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update crop
      .addCase(updateCrop.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCrop.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.crops.findIndex(c => c._id === action.payload._id);
        if (index !== -1) {
          state.crops[index] = action.payload;
        }
      })
      .addCase(updateCrop.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Delete crop
      .addCase(deleteCrop.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteCrop.fulfilled, (state, action) => {
        state.isLoading = false;
        state.crops = state.crops.filter(c => c._id !== action.payload);
      })
      .addCase(deleteCrop.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = cropsSlice.actions;
export default cropsSlice.reducer;