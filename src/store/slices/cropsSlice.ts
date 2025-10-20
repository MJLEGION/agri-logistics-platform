import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as cropService from '../../services/cropService';
import { Crop, UpdateCropParams } from '../../types';

interface CropsState {
  crops: Crop[];
  isLoading: boolean;
  error: string | null;
}

// Async thunks
export const fetchCrops = createAsyncThunk<Crop[], void, { rejectValue: string }>(
  'crops/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await cropService.getAllCrops();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch crops');
    }
  }
);

export const createCrop = createAsyncThunk<Crop, any, { rejectValue: string }>(
  'crops/create',
  async (cropData, { rejectWithValue }) => {
    try {
      return await cropService.createCrop(cropData);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create crop');
    }
  }
);

export const updateCrop = createAsyncThunk<Crop, UpdateCropParams, { rejectValue: string }>(
  'crops/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await cropService.updateCrop(id, data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update crop');
    }
  }
);

export const deleteCrop = createAsyncThunk<string, string, { rejectValue: string }>(
  'crops/delete',
  async (id, { rejectWithValue }) => {
    try {
      await cropService.deleteCrop(id);
      return id;
    } catch (error: any) {
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
  } as CropsState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCrops: (state) => {
      state.crops = [];
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
        state.error = action.payload || 'Failed to fetch crops';
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
        state.error = action.payload || 'Failed to create crop';
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
        state.error = action.payload || 'Failed to update crop';
      })
      // Delete crop
      .addCase(deleteCrop.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteCrop.fulfilled, (state, action) => {
        state.isLoading = false;
        state.crops = state.crops.filter(c => c._id !== action.payload && c.id !== action.payload);
      })
      .addCase(deleteCrop.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to delete crop';
      });
  },
});

export const { clearError, clearCrops } = cropsSlice.actions;
export default cropsSlice.reducer;