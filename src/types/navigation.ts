// Navigation type definitions for type safety
import { NavigationProp } from '@react-navigation/native';

export type RootStackParamList = {
  // Auth Stack
  Auth: undefined;
  Landing: undefined;
  RoleSelection: undefined;
  Login: undefined;
  Register: undefined;
  
  // Farmer Screens
  Home: undefined;
  ListCrop: undefined;
  MyListings: undefined;
  CropDetails: { cropId: string };
  EditCrop: { cropId: string };
  ActiveOrders: undefined;
  
  // Transporter Screens
  AvailableLoads: undefined;
  ActiveTrips: undefined;
  TripTracking: { orderId: string };
  
  // Buyer Screens
  BrowseCrops: undefined;
  PlaceOrder: { cropId: string };
  MyOrders: undefined;
  OrderTracking: { orderId: string };
};

// Navigation prop types for screens
export type NavigationProps<T extends keyof RootStackParamList> = {
  navigation: NavigationProp<RootStackParamList, T>;
  route: {
    params: RootStackParamList[T];
  };
};

// Screen-specific navigation types
export type FarmerHomeScreenProps = NavigationProps<'Home'>;
export type BuyerHomeScreenProps = NavigationProps<'Home'>;
export type TransporterHomeScreenProps = NavigationProps<'Home'>;
export type LoginScreenProps = NavigationProps<'Login'>;
export type RegisterScreenProps = NavigationProps<'Register'>;
export type RoleSelectionScreenProps = NavigationProps<'RoleSelection'>;
export type LandingScreenProps = NavigationProps<'Landing'>;

// Crop-related screens
export type ListCropScreenProps = NavigationProps<'ListCrop'>;
export type MyListingsScreenProps = NavigationProps<'MyListings'>;
export type CropDetailsScreenProps = NavigationProps<'CropDetails'>;
export type EditCropScreenProps = NavigationProps<'EditCrop'>;
export type BrowseCropsScreenProps = NavigationProps<'BrowseCrops'>;
export type PlaceOrderScreenProps = NavigationProps<'PlaceOrder'>;

// Order-related screens
export type ActiveOrdersScreenProps = NavigationProps<'ActiveOrders'>;
export type MyOrdersScreenProps = NavigationProps<'MyOrders'>;
export type OrderTrackingScreenProps = NavigationProps<'OrderTracking'>;

// Transporter screens
export type AvailableLoadsScreenProps = NavigationProps<'AvailableLoads'>;
export type ActiveTripsScreenProps = NavigationProps<'ActiveTrips'>;
export type TripTrackingScreenProps = NavigationProps<'TripTracking'>;

// Generic screen props for components that don't need specific params
export type GenericScreenProps = {
  navigation: NavigationProp<RootStackParamList>;
};
