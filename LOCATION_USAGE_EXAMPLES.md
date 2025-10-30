# Location Tracking - Usage Examples

Complete, copy-paste ready examples for integrating location features into your screens.

---

## 1. Simple Location Tracking Screen

```typescript
// src/screens/LocationTrackingDemo.tsx
import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { RealTimeTracking } from "../components/RealTimeTracking";

export const LocationTrackingDemo = () => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Delivery Tracking</Text>

      <RealTimeTracking
        orderId="order-123"
        onLocationUpdate={(location) => {
          console.log("Updated location:", location);
        }}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
});
```

---

## 2. Nearby Cargo Search

```typescript
// src/screens/CargoSearchScreen.tsx
import React, { useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { NearbySearch } from "../components/NearbySearch";
import { useLocation } from "../utils/useLocation";

export const CargoSearchScreen = () => {
  const { location, error: locationError } = useLocation(true); // Auto-start
  const [selectedCargo, setSelectedCargo] = useState(null);

  const handleSelectCargo = (cargo) => {
    setSelectedCargo(cargo);
    Alert.alert("Cargo Selected", `You selected: ${cargo.name}`);
    // Navigate to cargo details or accept cargo
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Search Nearby Cargo</Text>

      {locationError && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>Location Error: {locationError}</Text>
        </View>
      )}

      <NearbySearch userLocation={location} onSelectItem={handleSelectCargo} />

      {selectedCargo && (
        <View style={styles.selectedBox}>
          <Text style={styles.selectedTitle}>Selected Cargo:</Text>
          <Text>{selectedCargo.name}</Text>
          <Text>Price: ₦{selectedCargo.price}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  errorBox: {
    backgroundColor: "#ffe6e6",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: "#d32f2f",
  },
  selectedBox: {
    backgroundColor: "#e8f5e9",
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  selectedTitle: {
    fontWeight: "bold",
    marginBottom: 8,
  },
});
```

---

## 3. Delivery Tracking with ETA

```typescript
// src/screens/DeliveryTrackingScreen.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { RealTimeTracking } from "../components/RealTimeTracking";
import { DeliveryMap } from "../components/DeliveryMap";
import { useDistance } from "../utils/useDistance";

interface DeliveryTrackingScreenProps {
  orderId: string;
  destinationLat: number;
  destinationLon: number;
}

export const DeliveryTrackingScreen: React.FC<DeliveryTrackingScreenProps> = ({
  orderId,
  destinationLat,
  destinationLon,
}) => {
  const [location, setLocation] = useState(null);
  const { distance, loading: distanceLoading, calculate } = useDistance();

  useEffect(() => {
    if (location) {
      calculate(
        location.latitude,
        location.longitude,
        destinationLat,
        destinationLon
      );
    }
  }, [location, destinationLat, destinationLon]);

  const handleLocationUpdate = (newLocation) => {
    setLocation(newLocation);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Active Delivery</Text>

      {/* Tracking Component */}
      <RealTimeTracking
        orderId={orderId}
        onLocationUpdate={handleLocationUpdate}
      />

      {/* Map Component */}
      <DeliveryMap
        transporterLocation={location}
        deliveryLocation={{
          latitude: destinationLat,
          longitude: destinationLon,
        }}
      />

      {/* ETA Display */}
      {distanceLoading ? (
        <View style={styles.etaContainer}>
          <ActivityIndicator size="small" color="#007AFF" />
          <Text style={styles.etaLoadingText}>Calculating ETA...</Text>
        </View>
      ) : distance ? (
        <View style={styles.etaContainer}>
          <View style={styles.etaRow}>
            <Text style={styles.etaLabel}>Distance:</Text>
            <Text style={styles.etaValue}>
              {distance.distanceKm?.toFixed(1)} km
            </Text>
          </View>
          <View style={styles.etaRow}>
            <Text style={styles.etaLabel}>ETA:</Text>
            <Text style={styles.etaValue}>
              {distance.etaMinutes?.toFixed(0)} minutes
            </Text>
          </View>
          <View style={styles.etaRow}>
            <Text style={styles.etaLabel}>Duration:</Text>
            <Text style={styles.etaValue}>{distance.duration}</Text>
          </View>
        </View>
      ) : null}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  etaContainer: {
    backgroundColor: "#f0f7ff",
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#007AFF",
  },
  etaLoadingText: {
    marginLeft: 8,
    color: "#666",
  },
  etaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  etaLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "600",
  },
  etaValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "bold",
  },
});
```

---

## 4. Transporter Home with Multiple Features

```typescript
// src/screens/transporter/EnhancedTransporterHomeScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TabViewPagerPan,
} from "react-native";
import { NearbySearch } from "../../components/NearbySearch";
import { RealTimeTracking } from "../../components/RealTimeTracking";
import { useLocation } from "../../utils/useLocation";
import { useDistance } from "../../utils/useDistance";

export const EnhancedTransporterHomeScreen = ({ navigation }) => {
  const { location, error: locationError } = useLocation(true);
  const [activeTab, setActiveTab] = useState("search");
  const [selectedCargo, setSelectedCargo] = useState(null);

  const handleSelectCargo = (cargo) => {
    setSelectedCargo(cargo);
    navigation.navigate("CargoDetails", { cargo });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Transporter Dashboard</Text>
        {location && (
          <Text style={styles.headerSubtitle}>
            📍 {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
          </Text>
        )}
      </View>

      {locationError && (
        <View style={styles.warningBox}>
          <Text style={styles.warningText}>⚠️ {locationError}</Text>
        </View>
      )}

      {/* Tab Selector */}
      <View style={styles.tabSelector}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "search" && styles.activeTab]}
          onPress={() => setActiveTab("search")}
        >
          <Text style={styles.tabText}>Search Cargo</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "tracking" && styles.activeTab]}
          onPress={() => setActiveTab("tracking")}
        >
          <Text style={styles.tabText}>Track Delivery</Text>
        </TouchableOpacity>
      </View>

      {/* Search Tab */}
      {activeTab === "search" && (
        <View style={styles.tabContent}>
          <Text style={styles.sectionTitle}>Find Nearby Cargo</Text>
          <NearbySearch
            userLocation={location}
            onSelectItem={handleSelectCargo}
          />
        </View>
      )}

      {/* Tracking Tab */}
      {activeTab === "tracking" && (
        <View style={styles.tabContent}>
          <Text style={styles.sectionTitle}>Active Delivery Tracking</Text>
          <RealTimeTracking
            orderId="current-order"
            onLocationUpdate={(loc) => console.log(loc)}
          />
        </View>
      )}

      {/* Selected Cargo Info */}
      {selectedCargo && (
        <View style={styles.selectedCargoBox}>
          <Text style={styles.selectedTitle}>Selected Cargo</Text>
          <Text style={styles.cargoName}>{selectedCargo.name}</Text>
          <Text style={styles.cargoPrice}>₦{selectedCargo.price}</Text>
          <TouchableOpacity style={styles.acceptBtn}>
            <Text style={styles.acceptBtnText}>Accept Cargo</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    backgroundColor: "#007AFF",
    padding: 16,
    color: "#fff",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#e6f2ff",
  },
  warningBox: {
    backgroundColor: "#fff3cd",
    margin: 12,
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#ffc107",
  },
  warningText: {
    color: "#856404",
  },
  tabSelector: {
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: "#007AFF",
  },
  tabText: {
    textAlign: "center",
    fontWeight: "600",
    color: "#333",
  },
  tabContent: {
    padding: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#333",
  },
  selectedCargoBox: {
    backgroundColor: "#e8f5e9",
    margin: 12,
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#28a745",
  },
  selectedTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 8,
  },
  cargoName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  cargoPrice: {
    fontSize: 16,
    fontWeight: "600",
    color: "#28a745",
    marginBottom: 12,
  },
  acceptBtn: {
    backgroundColor: "#28a745",
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: "center",
  },
  acceptBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
});
```

---

## 5. Distance Calculator (Standalone Hook Usage)

```typescript
// src/screens/DistanceCalculatorScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import { useDistance } from "../utils/useDistance";

export const DistanceCalculatorScreen = () => {
  const [coordinates, setCoordinates] = useState({
    lat1: "1.9536",
    lon1: "29.8739",
    lat2: "1.9366",
    lon2: "29.8512",
  });

  const { distance, loading, error, calculate } = useDistance();

  const handleCalculate = () => {
    calculate(
      parseFloat(coordinates.lat1),
      parseFloat(coordinates.lon1),
      parseFloat(coordinates.lat2),
      parseFloat(coordinates.lon2)
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Distance Calculator</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>From Location</Text>
        <TextInput
          style={styles.input}
          placeholder="Latitude"
          value={coordinates.lat1}
          onChangeText={(text) =>
            setCoordinates({ ...coordinates, lat1: text })
          }
          keyboardType="decimal-pad"
        />
        <TextInput
          style={styles.input}
          placeholder="Longitude"
          value={coordinates.lon1}
          onChangeText={(text) =>
            setCoordinates({ ...coordinates, lon1: text })
          }
          keyboardType="decimal-pad"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>To Location</Text>
        <TextInput
          style={styles.input}
          placeholder="Latitude"
          value={coordinates.lat2}
          onChangeText={(text) =>
            setCoordinates({ ...coordinates, lat2: text })
          }
          keyboardType="decimal-pad"
        />
        <TextInput
          style={styles.input}
          placeholder="Longitude"
          value={coordinates.lon2}
          onChangeText={(text) =>
            setCoordinates({ ...coordinates, lon2: text })
          }
          keyboardType="decimal-pad"
        />
      </View>

      <TouchableOpacity
        style={styles.calculateBtn}
        onPress={handleCalculate}
        disabled={loading}
      >
        <Text style={styles.calculateBtnText}>
          {loading ? "Calculating..." : "Calculate Distance"}
        </Text>
      </TouchableOpacity>

      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {distance && (
        <View style={styles.resultsBox}>
          <Text style={styles.resultsTitle}>Results</Text>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Distance:</Text>
            <Text style={styles.resultValue}>
              {distance.distanceKm?.toFixed(2)} km
            </Text>
          </View>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>ETA:</Text>
            <Text style={styles.resultValue}>
              {distance.etaMinutes?.toFixed(0)} minutes
            </Text>
          </View>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Duration:</Text>
            <Text style={styles.resultValue}>{distance.duration}</Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
    fontSize: 14,
  },
  calculateBtn: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: "center",
    marginBottom: 16,
  },
  calculateBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  errorBox: {
    backgroundColor: "#ffebee",
    padding: 12,
    borderRadius: 6,
    marginBottom: 16,
  },
  errorText: {
    color: "#c62828",
  },
  resultsBox: {
    backgroundColor: "#f0f7ff",
    padding: 16,
    borderRadius: 6,
    borderLeftWidth: 4,
    borderLeftColor: "#007AFF",
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#333",
  },
  resultRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  resultLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "600",
  },
  resultValue: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "bold",
  },
});
```

---

## 6. Complete Integration Pattern

```typescript
// Pattern to follow for integrating location features

import React, { useState } from "react";
import { ScrollView, View, Text, StyleSheet } from "react-native";

// Import location components and hooks
import { RealTimeTracking } from "../components/RealTimeTracking";
import { NearbySearch } from "../components/NearbySearch";
import { DeliveryMap } from "../components/DeliveryMap";
import { useLocation } from "../utils/useLocation";
import { useDistance } from "../utils/useDistance";

export const YourIntegratedScreen = () => {
  // 1. Initialize location tracking
  const { location, error: locationError } = useLocation(true);

  // 2. Initialize distance calculation
  const { distance, calculate } = useDistance();

  // 3. Local state for selected items
  const [selectedItem, setSelectedItem] = useState(null);

  // 4. Handle location updates
  const handleLocationUpdate = (newLocation) => {
    console.log("Location updated:", newLocation);
    // Do something with updated location
  };

  // 5. Handle item selection
  const handleSelectItem = (item) => {
    setSelectedItem(item);
    // Navigate or perform action
  };

  return (
    <ScrollView style={styles.container}>
      {/* Title */}
      <Text style={styles.title}>Your Screen Title</Text>

      {/* Error Handling */}
      {locationError && (
        <View style={styles.error}>
          <Text>{locationError}</Text>
        </View>
      )}

      {/* Tracking Component */}
      <RealTimeTracking
        orderId="your-order-id"
        onLocationUpdate={handleLocationUpdate}
      />

      {/* Search Component */}
      <NearbySearch userLocation={location} onSelectItem={handleSelectItem} />

      {/* Map Component */}
      <DeliveryMap
        transporterLocation={location}
        deliveryLocation={selectedItem?.location}
      />

      {/* Distance Component */}
      {distance && (
        <View style={styles.info}>
          <Text>Distance: {distance.distanceKm} km</Text>
          <Text>ETA: {distance.etaMinutes} mins</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 16 },
  error: {
    backgroundColor: "#ffebee",
    padding: 12,
    borderRadius: 6,
    marginBottom: 16,
  },
  info: {
    backgroundColor: "#f0f7ff",
    padding: 12,
    borderRadius: 6,
    marginTop: 16,
  },
});
```

---

## 7. Testing Mock Components

```typescript
// For testing without real backend
import { useState } from "react";

export const useMockLocation = () => {
  const [location] = useState({
    latitude: 1.9536,
    longitude: 29.8739,
    accuracy: 10,
    speed: 45,
    heading: 270,
    timestamp: new Date(),
  });

  return {
    location,
    error: null,
    loading: false,
    startTracking: () => console.log("Mock: Starting tracking"),
    stopTracking: () => console.log("Mock: Stopping tracking"),
  };
};

export const useMockNearbySearch = () => {
  const [results] = useState([
    { id: "1", name: "Cargo 1", price: 50000, distance: 5 },
    { id: "2", name: "Cargo 2", price: 75000, distance: 8 },
  ]);

  return {
    results,
    loading: false,
    error: null,
    searchNearby: () => console.log("Mock: Searching"),
    clearResults: () => console.log("Mock: Clearing"),
  };
};
```

---

## 💡 Tips

1. **Always check location permissions** before using tracking
2. **Handle errors gracefully** - provide fallback UI
3. **Update frequency** - Balance accuracy with battery life
4. **Caching** - Cache location results when appropriate
5. **Debugging** - Use console logs to track data flow
6. **Testing** - Test with mock data before connecting to backend

---

## 🚀 Next Steps

1. Copy one of the examples above
2. Adjust to your needs
3. Test with your backend
4. Deploy to production

Happy coding! 🎉
