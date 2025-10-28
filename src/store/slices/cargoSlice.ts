import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as cargoService from '../../services/cargoService';
import { Cargo, UpdateCargoParams } from '../../types';

interface CargoState {
  cargo: Cargo[];
  isLoading: boolean;
  error: string | null;
}

// Async thunks
export const fetchCargo = createAsyncThunk<Cargo[], void, { rejectValue: string }>(
  'cargo/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await cargoService.getAllCargo();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch cargo');
    }
  }
);

export const createCargo = createAsyncThunk<Cargo, any, { rejectValue: string }>(
  'cargo/create',
  async (cargoData, { rejectWithValue }) => {
    try {
      console.log('🎯 cargoSlice: Creating cargo...');
      const result = await cargoService.createCargo(cargoData);
      console.log('✅ cargoSlice: Cargo created successfully:', result);
      return result;
    } catch (error: any) {
      console.error('❌ cargoSlice: Error creating cargo:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create cargo';
      console.error('❌ cargoSlice: Error message:', errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateCargo = createAsyncThunk<Cargo, UpdateCargoParams, { rejectValue: string }>(
  'cargo/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await cargoService.updateCargo(id, data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update cargo');
    }
  }
);

export const deleteCargo = createAsyncThunk<string, string, { rejectValue: string }>(
  'cargo/delete',
  async (id, { rejectWithValue }) => {
    try {
      console.log('🎯 cargoSlice: Deleting cargo with ID:', id);
      await cargoService.deleteCargo(id);
      console.log('✅ cargoSlice: Cargo deleted successfully:', id);
      return id;
    }
    catch (error: any) {
      console.error('❌ cargoSlice: Error deleting cargo:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete cargo';
      return rejectWithValue(errorMessage);
    }
  }
);

const initialState: CargoState = {
  cargo: [],
  isLoading: false,
  error: null,
};

const cargoSlice = createSlice({
  name: 'cargo',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCargo: (state) => {
      state.cargo = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch cargo
      .addCase(fetchCargo.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCargo.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cargo = action.payload;
      })
      .addCase(fetchCargo.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch cargo';
      })
      // Create cargo
      .addCase(createCargo.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createCargo.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cargo.push(action.payload);
      })
      .addCase(createCargo.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to create cargo';
      })
      // Update cargo
      .addCase(updateCargo.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCargo.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.cargo.findIndex(c => c._id === action.payload._id);
        if (index !== -1) {
          state.cargo[index] = action.payload;
        }
      })
      .addCase(updateCargo.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to update cargo';
      })
      // Delete cargo
      .addCase(deleteCargo.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteCargo.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cargo = state.cargo.filter(c => c._id !== action.payload && c.id !== action.payload);
      })
      .addCase(deleteCargo.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to delete cargo';
      });
  },
});

export const { clearError, clearCargo } = cargoSlice.actions;
export default cargoSlice.reducer;