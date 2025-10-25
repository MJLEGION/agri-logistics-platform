// Navigation type definitions for type safety
import { NavigationProp } from '@react-navigation/native';
import { Order } from './index';

export type RootStackParamList = {
  // Auth Stack
  Auth: undefined;
  Landing: undefined;
  RoleSelection: undefined;
  Login: undefined;
  Register: undefined;
  
  // Shipper Screens
  Home: undefined;
  ListCargo: undefined;
  MyCargo: undefined;
  CargoDetails: { cargoId: string };
  EditCargo: { cargoId: string };
  ShipperActiveOrders: undefined;
  
  // Transporter Screens
  AvailableLoads: undefined;
  ActiveTrips: undefined;
  TripTracking: { orderId: string };
  
  OrderTracking: { order: Order };
};

// Navigation prop types for screens
export type NavigationProps<T extends keyof RootStackParamList> = {
  navigation: NavigationProp<RootStackParamList, T>;
  route: {
    params: RootStackParamList[T];
  };
};

// Screen-specific navigation types
export type ShipperHomeScreenProps = NavigationProps<'Home'>;
export type TransporterHomeScreenProps = NavigationProps<'Home'>;
export type LoginScreenProps = NavigationProps<'Login'>;
export type RegisterScreenProps = NavigationProps<'Register'>;
export type RoleSelectionScreenProps = NavigationProps<'RoleSelection'>;
export type LandingScreenProps = NavigationProps<'Landing'>;

// Cargo-related screens
export type ListCargoScreenProps = NavigationProps<'ListCargo'>;
export type MyCargoScreenProps = NavigationProps<'MyCargo'>;
export type CargoDetailsScreenProps = NavigationProps<'CargoDetails'>;
export type EditCargoScreenProps = NavigationProps<'EditCargo'>;

// Order-related screens
export type ShipperActiveOrdersScreenProps = NavigationProps<'ShipperActiveOrders'>;
export type OrderTrackingScreenProps = NavigationProps<'OrderTracking'>;

// Transporter screens
export type AvailableLoadsScreenProps = NavigationProps<'AvailableLoads'>;
export type ActiveTripsScreenProps = NavigationProps<'ActiveTrips'>;
export type TripTrackingScreenProps = NavigationProps<'TripTracking'>;

// Generic screen props for components that don't need specific params
export type GenericScreenProps = {
  navigation: NavigationProp<RootStackParamList>;
};
