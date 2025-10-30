# 📋 Rating Integration - Copy & Paste Code Snippets

Just copy these snippets into your screens to add rating functionality!

---

## 🎯 Option 1: Add Rating Button to Trip Card

### For TripHistoryScreen or Similar

```typescript
import { Ionicons } from "@expo/vector-icons";

// In your trip card rendering:
<View style={styles.tripCardActions}>
  {trip.status === "completed" && (
    <TouchableOpacity
      style={[styles.actionButton, styles.rateButton]}
      onPress={() => {
        navigation.navigate("Rating", {
          transactionId: trip._id || trip.id,
          transporterId: trip.transporterId,
          transporterName: trip.transporterName,
          farmerId: user._id || user.id,
          farmerName: user.name || user.full_name,
        });
      }}
    >
      <Ionicons name="star" size={16} color="#FFD700" />
      <Text style={styles.actionButtonText}>Rate</Text>
    </TouchableOpacity>
  )}
</View>;

// Add these styles:
const styles = StyleSheet.create({
  tripCardActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 6,
    gap: 6,
  },
  rateButton: {
    backgroundColor: "#FFD700",
  },
  actionButtonText: {
    fontWeight: "600",
    color: "#000",
  },
});
```

---

## 🎯 Option 2: Add Rating Button After Trip Completion

### In Your Trip Completion Handler

```typescript
// After completing a trip successfully:
const handleCompleteTrip = async (trip: Trip) => {
  try {
    // ... complete trip logic ...

    // Show success message with rating prompt
    Alert.alert("Trip Completed! 🎉", "Would you like to rate this delivery?", [
      {
        text: "Rate Now",
        onPress: () => {
          navigation.navigate("Rating", {
            transactionId: trip.id,
            transporterId: trip.transporterId,
            transporterName: trip.transporterName,
            farmerId: user.id,
            farmerName: user.name,
          });
        },
      },
      {
        text: "Skip",
        onPress: () => navigation.goBack(),
        style: "cancel",
      },
    ]);
  } catch (error) {
    Alert.alert("Error", "Could not complete trip");
  }
};
```

---

## 🎯 Option 3: Add "View Profile" with Rating

### In Transporter Search Results

```typescript
// In your transporter listing/search results:
<TouchableOpacity
  style={styles.transporterCard}
  onPress={() => {
    navigation.navigate("TransporterProfile", {
      transporterId: transporter.id,
    });
  }}
>
  <View style={styles.transporterHeader}>
    <Text style={styles.transporterName}>{transporter.name}</Text>
    <View style={styles.ratingBadge}>
      <Ionicons name="star" size={14} color="#FFD700" />
      <Text style={styles.ratingText}>
        {transporter.averageRating?.toFixed(1) || "No"} ⭐
      </Text>
      <Text style={styles.reviewCount}>({transporter.totalRatings || 0})</Text>
    </View>
  </View>

  <Text style={styles.transporterLocation}>{transporter.location}</Text>

  {/* Add a quick rate button */}
  <TouchableOpacity
    style={styles.quickRateButton}
    onPress={(e) => {
      e.stopPropagation();
      navigation.navigate("Rating", {
        transactionId: `quick-rate-${Date.now()}`,
        transporterId: transporter.id,
        transporterName: transporter.name,
        farmerId: user.id,
        farmerName: user.name,
      });
    }}
  >
    <Ionicons name="star-outline" size={14} color="#2196F3" />
    <Text style={styles.quickRateText}>Rate</Text>
  </TouchableOpacity>
</TouchableOpacity>;

// Styles:
const styles = StyleSheet.create({
  transporterCard: {
    backgroundColor: "#FFF",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  transporterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  transporterName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FFF3E0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    fontWeight: "600",
    color: "#F57C00",
    fontSize: 12,
  },
  reviewCount: {
    fontSize: 11,
    color: "#999",
  },
  transporterLocation: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
  },
  quickRateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#2196F3",
  },
  quickRateText: {
    color: "#2196F3",
    fontWeight: "600",
    fontSize: 12,
  },
});
```

---

## 🎯 Option 4: Floating Rating Button

### Add to Bottom of Any Screen

```typescript
// Add this to any screen for quick access:
<View style={styles.floatingButtonContainer}>
  <TouchableOpacity
    style={styles.floatingButton}
    onPress={() => {
      // Replace with your actual data
      navigation.navigate("Rating", {
        transactionId: `rating-${Date.now()}`,
        transporterId: "trans-123",
        transporterName: "Select Transporter",
        farmerId: user.id,
        farmerName: user.name,
      });
    }}
  >
    <Ionicons name="star" size={24} color="#FFF" />
  </TouchableOpacity>
</View>;

// Styles:
const styles = StyleSheet.create({
  floatingButtonContainer: {
    position: "absolute",
    bottom: 30,
    right: 20,
  },
  floatingButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FFD700",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
```

---

## 🎯 Option 5: Modal Rating Form

### Bring Up Rating in a Modal

```typescript
import { Modal } from 'react-native';

const [showRatingModal, setShowRatingModal] = useState(false);

// Add this button:
<TouchableOpacity
  onPress={() => setShowRatingModal(true)}
  style={styles.rateButton}
>
  <Text>Rate This Delivery ⭐</Text>
</TouchableOpacity>

// Add this Modal:
<Modal
  visible={showRatingModal}
  animationType="slide"
  presentationStyle="pageSheet"
  onRequestClose={() => setShowRatingModal(false)}
>
  <RatingScreen
    transactionId={`txn-${Date.now()}`}
    transporterId="trans-id"
    transporterName="Transporter Name"
    farmerId={user.id}
    farmerName={user.name}
  />

  {/* Close button */}
  <TouchableOpacity
    style={styles.closeButton}
    onPress={() => setShowRatingModal(false)}
  >
    <Text>Close</Text>
  </TouchableOpacity>
</Modal>
```

---

## 🔥 Quick Copy-Paste Test Button

### Add This Anywhere to Test Immediately

```typescript
import { TouchableOpacity, Text } from "react-native";

// Add this component anywhere:
const TestRatingButton = ({ navigation, user }: any) => (
  <TouchableOpacity
    style={{
      padding: 12,
      backgroundColor: "#FFD700",
      borderRadius: 8,
      margin: 10,
    }}
    onPress={() => {
      navigation.navigate("Rating", {
        transactionId: `test-${Date.now()}`,
        transporterId: "trans-test-001",
        transporterName: "Test Transporter",
        farmerId: user?.id || "farmer-001",
        farmerName: user?.name || "Test User",
      });
    }}
  >
    <Text style={{ fontWeight: "600", textAlign: "center" }}>
      ⭐ Test Rating Screen
    </Text>
  </TouchableOpacity>
);

export default TestRatingButton;
```

---

## 🎯 Complete Integration Example

### Full Working Example

```typescript
import React from "react";
import { View, TouchableOpacity, Text, Alert, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppSelector } from "../store";

export const RatingIntegration = ({ navigation, trip }: any) => {
  const { user } = useAppSelector((state) => state.auth);

  const handleRateTrip = () => {
    if (!trip.transporterId) {
      Alert.alert("Error", "No transporter information available");
      return;
    }

    // Navigate to rating screen with all required params
    navigation.navigate("Rating", {
      transactionId: trip._id || trip.id,
      transporterId: trip.transporterId,
      transporterName: trip.transporterName || "Unknown Transporter",
      farmerId: user?._id || user?.id,
      farmerName: user?.name || user?.full_name || "Anonymous",
    });
  };

  const handleViewProfile = () => {
    if (!trip.transporterId) {
      Alert.alert("Error", "No transporter information available");
      return;
    }

    navigation.navigate("TransporterProfile", {
      transporterId: trip.transporterId,
    });
  };

  return (
    <View style={styles.container}>
      {trip.status === "completed" && (
        <>
          <TouchableOpacity
            style={[styles.button, styles.rateButton]}
            onPress={handleRateTrip}
          >
            <Ionicons name="star" size={18} color="#000" />
            <Text style={styles.buttonText}>Rate Trip</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.profileButton]}
            onPress={handleViewProfile}
          >
            <Ionicons name="person" size={18} color="#2196F3" />
            <Text style={[styles.buttonText, { color: "#2196F3" }]}>
              View Profile
            </Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  rateButton: {
    backgroundColor: "#FFD700",
  },
  profileButton: {
    backgroundColor: "#E3F2FD",
  },
  buttonText: {
    fontWeight: "600",
    fontSize: 14,
  },
});

export default RatingIntegration;
```

---

## 📝 Usage in Your Screens

```typescript
// In your trip detail screen:
import RatingIntegration from "../components/RatingIntegration";

export default function TripDetailScreen({ navigation, route }: any) {
  const trip = route.params;

  return (
    <View style={styles.container}>
      {/* Trip details */}
      <TripDetails trip={trip} />

      {/* Rating integration */}
      <RatingIntegration navigation={navigation} trip={trip} />
    </View>
  );
}
```

---

## ✅ All Parameters Reference

```typescript
// Navigation params for RatingScreen:
navigation.navigate("Rating", {
  transactionId: string, // ✅ Required - unique ID for the transaction/trip
  transporterId: string, // ✅ Required - ID of person being rated
  transporterName: string, // ✅ Required - display name of person being rated
  farmerId: string, // ✅ Required - ID of person doing the rating
  farmerName: string, // ✅ Required - display name of person rating
});

// Navigation params for TransporterProfileScreen:
navigation.navigate("TransporterProfile", {
  transporterId: string, // ✅ Required - ID of transporter to view
});
```

---

## 🚀 You're Ready!

Just pick one of the above options and copy-paste it into your screen. The rating feature will work immediately! 🌟

**Recommended:**

1. Start with the **Test Button** (Option 5) to verify it works
2. Then add **Rating Button to Trip Card** (Option 1) for production use
3. Finally add **Rating on Completion** (Option 2) for best UX

---

## 💡 Pro Tips

- Always pass **real data** from your state/context
- Use **user.id** or **user.\_id** consistently
- Handle **null/undefined** values gracefully
- Test with **different transporters** to verify multiple ratings work
- Check **browser console** for errors during testing
