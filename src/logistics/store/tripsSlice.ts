// src/logistics/store/tripsSlice.ts

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Trip, CreateTripInput, UpdateTripInput } from '../types/trip';
import * as tripService from '../services/tripService';

interface TripsState {
  trips: Trip[];
  selectedTrip: Trip | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: TripsState = {
  trips: [],
  selectedTrip: null,
  isLoading: false,
  error: null,
};

// Async Thunks

export const fetchAllTrips = createAsyncThunk<Trip[], void, { rejectValue: string }>(
  'trips/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      console.log('📡 Fetching all trips...');
      const trips = await tripService.getAllTrips();
      console.log('✅ Trips fetched successfully:', trips.length);
      return trips;
    } catch (error: any) {
      console.error('❌ Failed to fetch trips:', error);
      return rejectWithValue(error?.message || 'Failed to fetch trips');
    }
  }
);

export const fetchPendingTrips = createAsyncThunk<Trip[], void, { rejectValue: string }>(
  'trips/fetchPending',
  async (_, { rejectWithValue }) => {
    try {
      console.log('📡 Fetching pending trips...');
      const trips = await tripService.getPendingTrips();
      console.log('✅ Pending trips fetched:', trips.length);
      return trips;
    } catch (error: any) {
      console.error('❌ Failed to fetch pending trips:', error);
      return rejectWithValue(error?.message || 'Failed to fetch pending trips');
    }
  }
);

export const fetchTransporterTrips = createAsyncThunk<
  Trip[],
  string,
  { rejectValue: string }
>(
  'trips/fetchTransporter',
  async (transporterId, { rejectWithValue }) => {
    try {
      console.log('📡 Fetching trips for transporter:', transporterId);
      const trips = await tripService.getTransporterTrips(transporterId);
      console.log('✅ Transporter trips fetched:', trips.length);
      return trips;
    } catch (error: any) {
      console.error('❌ Failed to fetch transporter trips:', error);
      return rejectWithValue(error?.message || 'Failed to fetch transporter trips');
    }
  }
);

export const acceptTrip = createAsyncThunk<
  Trip,
  string,
  { rejectValue: string; state: any }
>(
  'trips/accept',
  async (tripId, { rejectWithValue, getState }) => {
    try {
      console.log('🎯 Accept Trip thunk started for ID:', tripId);

      // Get current user's ID from Redux state
      const state = getState();
      const currentUser = state.auth?.user;
      const transporterId = currentUser?._id || currentUser?.id;

      if (!transporterId) {
        throw new Error('User ID not found in auth state');
      }

      console.log('👤 Current user (transporter) ID:', transporterId);

      const result = await tripService.acceptTrip(tripId, transporterId);
      console.log('✅ Accept Trip thunk success:', result);
      return result;
    } catch (error: any) {
      console.error('❌ Accept Trip thunk error:', error);
      const errorMsg = error?.message || 'Failed to accept trip';
      console.log('📤 Returning rejection value:', errorMsg);
      return rejectWithValue(errorMsg);
    }
  }
);

export const startTrip = createAsyncThunk<Trip, string, { rejectValue: string }>(
  'trips/start',
  async (tripId, { rejectWithValue }) => {
    try {
      console.log('🎯 Start Trip thunk started for ID:', tripId);
      const result = await tripService.startTrip(tripId);
      console.log('✅ Start Trip thunk success:', result);
      return result;
    } catch (error: any) {
      console.error('❌ Start Trip thunk error:', error);
      const errorMsg = error?.message || 'Failed to start trip';
      return rejectWithValue(errorMsg);
    }
  }
);

export const completeTrip = createAsyncThunk<Trip, string, { rejectValue: string }>(
  'trips/complete',
  async (tripId, { rejectWithValue }) => {
    try {
      console.log('🎯 Complete Trip thunk started for ID:', tripId);
      const result = await tripService.completeTrip(tripId);
      console.log('✅ Complete Trip thunk success:', result);
      return result;
    } catch (error: any) {
      console.error('❌ Complete Trip thunk error:', error);
      const errorMsg = error?.message || 'Failed to complete trip';
      return rejectWithValue(errorMsg);
    }
  }
);

export const createTrip = createAsyncThunk<
  Trip,
  CreateTripInput,
  { rejectValue: string }
>(
  'trips/create',
  async (tripInput, { rejectWithValue }) => {
    try {
      console.log('🎯 Create Trip thunk started');
      const result = await tripService.createTrip(tripInput);
      console.log('✅ Create Trip thunk success:', result);
      return result;
    } catch (error: any) {
      console.error('❌ Create Trip thunk error:', error);
      return rejectWithValue(error?.message || 'Failed to create trip');
    }
  }
);

export const updateTrip = createAsyncThunk<
  Trip,
  { tripId: string; updates: UpdateTripInput },
  { rejectValue: string }
>(
  'trips/update',
  async ({ tripId, updates }, { rejectWithValue }) => {
    try {
      console.log('🎯 Update Trip thunk started for ID:', tripId);
      const result = await tripService.updateTrip(tripId, updates);
      console.log('✅ Update Trip thunk success:', result);
      return result;
    } catch (error: any) {
      console.error('❌ Update Trip thunk error:', error);
      return rejectWithValue(error?.message || 'Failed to update trip');
    }
  }
);

export const cancelTrip = createAsyncThunk<Trip, string, { rejectValue: string }>(
  'trips/cancel',
  async (tripId, { rejectWithValue }) => {
    try {
      console.log('🎯 Cancel Trip thunk started for ID:', tripId);
      const result = await tripService.cancelTrip(tripId);
      console.log('✅ Cancel Trip thunk success:', result);
      return result;
    } catch (error: any) {
      console.error('❌ Cancel Trip thunk error:', error);
      return rejectWithValue(error?.message || 'Failed to cancel trip');
    }
  }
);

// Slice
const tripsSlice = createSlice({
  name: 'trips',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearTrips: (state) => {
      state.trips = [];
      state.selectedTrip = null;
      state.error = null;
    },
    selectTrip: (state, action) => {
      const trip = state.trips.find(t => t._id === action.payload);
      state.selectedTrip = trip || null;
    },
    clearSelectedTrip: (state) => {
      state.selectedTrip = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch All Trips
    builder
      .addCase(fetchAllTrips.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllTrips.fulfilled, (state, action) => {
        state.isLoading = false;
        state.trips = action.payload;
      })
      .addCase(fetchAllTrips.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch trips';
      });

    // Fetch Pending Trips
    builder
      .addCase(fetchPendingTrips.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPendingTrips.fulfilled, (state, action) => {
        state.isLoading = false;
        state.trips = action.payload;
      })
      .addCase(fetchPendingTrips.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch pending trips';
      });

    // Fetch Transporter Trips
    builder
      .addCase(fetchTransporterTrips.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTransporterTrips.fulfilled, (state, action) => {
        state.isLoading = false;
        state.trips = action.payload;
      })
      .addCase(fetchTransporterTrips.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch transporter trips';
      });

    // Accept Trip
    builder
      .addCase(acceptTrip.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(acceptTrip.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.trips.findIndex(t => t._id === action.payload._id);
        if (index !== -1) {
          state.trips[index] = action.payload;
        } else {
          state.trips.push(action.payload);
        }
        console.log('✅ Redux: Trip accepted and state updated');
      })
      .addCase(acceptTrip.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to accept trip';
      });

    // Start Trip
    builder
      .addCase(startTrip.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(startTrip.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.trips.findIndex(t => t._id === action.payload._id);
        if (index !== -1) {
          state.trips[index] = action.payload;
        }
      })
      .addCase(startTrip.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to start trip';
      });

    // Complete Trip
    builder
      .addCase(completeTrip.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(completeTrip.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.trips.findIndex(t => t._id === action.payload._id);
        if (index !== -1) {
          state.trips[index] = action.payload;
        }
        console.log('✅ Redux: Trip completed and state updated');
      })
      .addCase(completeTrip.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to complete trip';
      });

    // Create Trip
    builder
      .addCase(createTrip.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createTrip.fulfilled, (state, action) => {
        state.isLoading = false;
        state.trips.push(action.payload);
      })
      .addCase(createTrip.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to create trip';
      });

    // Update Trip
    builder
      .addCase(updateTrip.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateTrip.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.trips.findIndex(t => t._id === action.payload._id);
        if (index !== -1) {
          state.trips[index] = action.payload;
        }
      })
      .addCase(updateTrip.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to update trip';
      });

    // Cancel Trip
    builder
      .addCase(cancelTrip.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(cancelTrip.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.trips.findIndex(t => t._id === action.payload._id);
        if (index !== -1) {
          state.trips[index] = action.payload;
        }
      })
      .addCase(cancelTrip.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to cancel trip';
      });
  },
});

export const { clearError, clearTrips, selectTrip, clearSelectedTrip } =
  tripsSlice.actions;

// Export fetchTrips as an alias for fetchPendingTrips for backward compatibility
export const fetchTrips = fetchPendingTrips;

export default tripsSlice.reducer;