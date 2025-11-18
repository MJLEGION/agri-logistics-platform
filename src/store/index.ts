// src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers } from 'redux';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import authReducer from './slices/authSlice';
import cargoReducer from './slices/cargoSlice';
import ordersReducer from './slices/ordersSlice';
import transportersReducer from './slices/transportersSlice';
import tripsReducer from '../logistics/store/tripsSlice';
import matchingReducer from '../logistics/store/matchingSlice';
import addressReducer from './slices/addressSlice';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth'], // Only persist auth - user data should be fetched fresh on login
  blacklist: ['cargo', 'orders', 'transporters', 'trips', 'matching'], // Never persist user-specific data
};

const rootReducer = combineReducers({
  auth: authReducer,
  cargo: cargoReducer,
  orders: ordersReducer,
  transporters: transportersReducer,
  trips: tripsReducer,
  matching: matchingReducer,
  address: addressReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Export typed hooks for use throughout the app
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;