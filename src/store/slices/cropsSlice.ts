// src/store/slices/cropsSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Crop } from '../../types';

interface CropsState {
  crops: Crop[];
  loading: boolean;
  error: string | null;
}

const initialState: CropsState = {
  crops: [],
  loading: false,
  error: null,
};

const cropsSlice = createSlice({
  name: 'crops',
  initialState,
  reducers: {
    addCrop: (state, action: PayloadAction<Crop>) => {
      state.crops.push(action.payload);
    },
    setCrops: (state, action: PayloadAction<Crop[]>) => {
      state.crops = action.payload;
    },
    updateCrop: (state, action: PayloadAction<Crop>) => {
      const index = state.crops.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.crops[index] = action.payload;
      }
    },
    deleteCrop: (state, action: PayloadAction<string>) => {
      state.crops = state.crops.filter(c => c.id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { addCrop, setCrops, updateCrop, deleteCrop, setLoading, setError } = cropsSlice.actions;
export default cropsSlice.reducer;