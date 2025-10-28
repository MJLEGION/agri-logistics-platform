// src/logistics/store/matchingSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { matchingService, MatchingRequest, MatchingResult, MatchedTransporter } from '../../services/matchingService';
import { getAvailableTransporters } from '../../services/transporterService';

export interface MatchingState {
  currentRequest: MatchingRequest | null;
  matchingResult: MatchingResult | null;
  selectedMatch: MatchedTransporter | null;
  loading: boolean;
  error: string | null;
  autoAssignedTransporter: MatchedTransporter | null;
}

const initialState: MatchingState = {
  currentRequest: null,
  matchingResult: null,
  selectedMatch: null,
  loading: false,
  error: null,
  autoAssignedTransporter: null,
};

/**
 * Async thunk to find matching transporters
 */
export const findMatchingTransporters = createAsyncThunk(
  'matching/findTransporters',
  async (request: MatchingRequest, { rejectWithValue }) => {
    try {
      // Fetch available transporters
      const transporters = await getAvailableTransporters();

      // Find matches
      const result = await matchingService.findMatchingTransporters(request, transporters);

      return {
        request,
        result,
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to find matching transporters');
    }
  }
);

/**
 * Async thunk to auto-assign the best transporter
 */
export const autoAssignTransporter = createAsyncThunk(
  'matching/autoAssign',
  async (matchingResult: MatchingResult, { rejectWithValue }) => {
    try {
      const bestMatch = matchingService.autoAssignBestMatch(matchingResult);
      if (!bestMatch) {
        throw new Error('No suitable transporters found for auto-assignment');
      }
      return bestMatch;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to auto-assign transporter');
    }
  }
);

const matchingSlice = createSlice({
  name: 'matching',
  initialState,
  reducers: {
    // Clear all matching state
    clearMatching: (state) => {
      state.currentRequest = null;
      state.matchingResult = null;
      state.selectedMatch = null;
      state.autoAssignedTransporter = null;
      state.error = null;
    },

    // Select a specific match
    selectMatch: (state, action: PayloadAction<MatchedTransporter>) => {
      state.selectedMatch = action.payload;
      state.error = null;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Set current request
    setCurrentRequest: (state, action: PayloadAction<MatchingRequest>) => {
      state.currentRequest = action.payload;
    },
  },

  extraReducers: (builder) => {
    // Find matching transporters
    builder
      .addCase(findMatchingTransporters.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(findMatchingTransporters.fulfilled, (state, action) => {
        state.loading = false;
        state.currentRequest = action.payload.request;
        state.matchingResult = action.payload.result;
        // Pre-select the best match
        if (action.payload.result.bestMatch) {
          state.selectedMatch = action.payload.result.bestMatch;
          state.autoAssignedTransporter = action.payload.result.bestMatch;
        }
      })
      .addCase(findMatchingTransporters.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Auto-assign transporter
    builder
      .addCase(autoAssignTransporter.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(autoAssignTransporter.fulfilled, (state, action) => {
        state.loading = false;
        state.autoAssignedTransporter = action.payload;
        state.selectedMatch = action.payload;
      })
      .addCase(autoAssignTransporter.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearMatching, selectMatch, clearError, setCurrentRequest } =
  matchingSlice.actions;

export default matchingSlice.reducer;