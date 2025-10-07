// src/screens/OrderTrackingScreen.tsx

import React from 'react';
import { View, StyleSheet } from 'react-native';
import MapView from 'react-native-maps'; // Make sure to import MapView

const OrderTrackingScreen = () => {
  return (
    <View style={styles.container}>
      {/* This is the MapView component you need to add */}
      <MapView
        provider="google" // Use the Google Maps provider for web
        googleMapsApiKey={process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY}
        style={styles.map}
        initialRegion={{
          latitude: -1.9403, // Example: Kigali, Rwanda
          longitude: 30.0589,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      />
    </View>
  );
};

// Styles to make the map fill the entire screen
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
});

export default OrderTrackingScreen;