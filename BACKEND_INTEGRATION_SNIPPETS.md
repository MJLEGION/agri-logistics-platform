# Backend Integration - Code Snippets Reference

Quick copy-paste code snippets for integrating backend calls into your screens.

---

## 🔐 Authentication Examples

### Login Component

```typescript
import { useDispatch, useSelector } from "react-redux";
import { login } from "../store/slices/authSlice";
import { RootState } from "../store";

export default function LoginScreen({ navigation }: any) {
  const dispatch = useDispatch();
  const { isLoading, error, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    const result = await dispatch(login({ phone, password }) as any);

    if (login.fulfilled.match(result)) {
      console.log("✅ Login successful!");
      // Navigation happens automatically via auth state
    }
  };

  return (
    <View>
      <Input placeholder="Phone" value={phone} onChangeText={setPhone} />
      <Input
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button
        onPress={handleLogin}
        disabled={isLoading}
        title={isLoading ? "Logging in..." : "Login"}
      />
      {error && <Text style={{ color: "red" }}>{error}</Text>}
    </View>
  );
}
```

### Register Component

```typescript
import { useDispatch, useSelector } from "react-redux";
import { register } from "../store/slices/authSlice";
import { RootState } from "../store";

export default function RegisterScreen({ navigation }: any) {
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    password: "",
    role: "farmer",
  });

  const handleRegister = async () => {
    const result = await dispatch(register(formData) as any);

    if (register.fulfilled.match(result)) {
      console.log("✅ Registration successful!");
      Alert.alert("Success", "Account created! Please log in.");
      navigation.goBack();
    }
  };

  return (
    <ScrollView>
      <Input
        placeholder="Full Name"
        value={formData.name}
        onChangeText={(value) => setFormData({ ...formData, name: value })}
      />
      <Input
        placeholder="Phone (e.g., +250700000001)"
        value={formData.phone}
        onChangeText={(value) => setFormData({ ...formData, phone: value })}
      />
      <Input
        placeholder="Password"
        value={formData.password}
        onChangeText={(value) => setFormData({ ...formData, password: value })}
        secureTextEntry
      />
      <Picker
        selectedValue={formData.role}
        onValueChange={(value) => setFormData({ ...formData, role: value })}
      >
        <Picker.Item label="Farmer" value="farmer" />
        <Picker.Item label="Buyer" value="buyer" />
        <Picker.Item label="Transporter" value="transporter" />
      </Picker>
      <Button
        onPress={handleRegister}
        disabled={isLoading}
        title={isLoading ? "Registering..." : "Register"}
      />
      {error && <Text style={{ color: "red" }}>{error}</Text>}
    </ScrollView>
  );
}
```

---

## 🌾 Cargo/Crop Management

### Fetch Cargo List

```typescript
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCargo } from "../store/slices/cargoSlice";
import { RootState, AppDispatch } from "../store";

export default function CargoListScreen() {
  const dispatch = useAppDispatch();
  const { cargo, isLoading, error } = useSelector(
    (state: RootState) => state.cargo
  );

  useEffect(() => {
    // Fetch cargo when component mounts
    dispatch(fetchCargo());
  }, [dispatch]);

  if (isLoading) return <Text>Loading cargo...</Text>;
  if (error) return <Text style={{ color: "red" }}>{error}</Text>;

  return (
    <ScrollView>
      {cargo.map((item) => (
        <CargoCard key={item._id} cargo={item} />
      ))}
    </ScrollView>
  );
}
```

### Create New Cargo

```typescript
import { useDispatch, useSelector } from "react-redux";
import { createCargo } from "../store/slices/cargoSlice";
import { RootState } from "../store";

export default function CreateCargoScreen({ navigation }: any) {
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state: RootState) => state.cargo);
  const [formData, setFormData] = useState({
    name: "",
    quantity: "",
    price: "",
    location: "",
    description: "",
  });

  const handleCreate = async () => {
    const result = await dispatch(createCargo(formData) as any);

    if (createCargo.fulfilled.match(result)) {
      Alert.alert("Success", "Cargo listed successfully!");
      navigation.goBack();
    }
  };

  return (
    <ScrollView>
      <Input
        placeholder="Cargo Name (e.g., Tomatoes)"
        value={formData.name}
        onChangeText={(value) => setFormData({ ...formData, name: value })}
      />
      <Input
        placeholder="Quantity (kg)"
        value={formData.quantity}
        onChangeText={(value) => setFormData({ ...formData, quantity: value })}
        keyboardType="numeric"
      />
      <Input
        placeholder="Price per unit"
        value={formData.price}
        onChangeText={(value) => setFormData({ ...formData, price: value })}
        keyboardType="numeric"
      />
      <Input
        placeholder="Pickup Location"
        value={formData.location}
        onChangeText={(value) => setFormData({ ...formData, location: value })}
      />
      <Input
        placeholder="Description (optional)"
        value={formData.description}
        onChangeText={(value) =>
          setFormData({ ...formData, description: value })
        }
        multiline
      />
      <Button
        onPress={handleCreate}
        disabled={isLoading}
        title={isLoading ? "Creating..." : "Create Cargo"}
      />
      {error && <Text style={{ color: "red" }}>{error}</Text>}
    </ScrollView>
  );
}
```

### Update Cargo

```typescript
import { updateCargo } from "../store/slices/cargoSlice";

const handleUpdateCargo = async (cargoId: string, updatedData: any) => {
  const result = await dispatch(
    updateCargo({
      id: cargoId,
      data: updatedData,
    }) as any
  );

  if (updateCargo.fulfilled.match(result)) {
    Alert.alert("Success", "Cargo updated successfully!");
  }
};
```

### Delete Cargo

```typescript
import { deleteCargo } from "../store/slices/cargoSlice";

const handleDeleteCargo = async (cargoId: string) => {
  Alert.alert("Delete Cargo", "Are you sure?", [
    { text: "Cancel", onPress: () => {} },
    {
      text: "Delete",
      onPress: async () => {
        const result = await dispatch(deleteCargo(cargoId) as any);
        if (deleteCargo.fulfilled.match(result)) {
          Alert.alert("Success", "Cargo deleted!");
        }
      },
    },
  ]);
};
```

---

## 📦 Order Management

### Fetch User's Orders

```typescript
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserOrders } from "../store/slices/ordersSlice";
import { RootState } from "../store";

export default function OrdersScreen() {
  const dispatch = useDispatch();
  const { orders, isLoading, error } = useSelector(
    (state: RootState) => state.orders
  );
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (user?._id) {
      dispatch(fetchUserOrders(user._id) as any);
    }
  }, [dispatch, user]);

  return (
    <ScrollView>
      {orders.map((order) => (
        <OrderCard key={order._id} order={order} />
      ))}
    </ScrollView>
  );
}
```

### Create Order

```typescript
import { createOrder } from "../store/slices/ordersSlice";

const handleCreateOrder = async (orderData: any) => {
  const result = await dispatch(
    createOrder({
      crop_id: orderData.cargoId,
      quantity: orderData.quantity,
      destination: orderData.deliveryLocation,
      delivery_date: orderData.deliveryDate,
    }) as any
  );

  if (createOrder.fulfilled.match(result)) {
    Alert.alert("Success", "Order created!");
  }
};
```

### Assign Transporter to Order

```typescript
import { assignTransporter } from "../store/slices/ordersSlice";

const handleAssignTransporter = async (
  orderId: string,
  transporterId: string
) => {
  const result = await dispatch(
    assignTransporter({
      orderId,
      transporterId,
    }) as any
  );

  if (assignTransporter.fulfilled.match(result)) {
    Alert.alert("Success", "Transporter assigned!");
  }
};
```

---

## 🚐 Transporter Management

### Fetch Available Transporters

```typescript
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAvailableTransporters } from "../store/slices/transportersSlice";
import { RootState } from "../store";

export default function TransportersScreen() {
  const dispatch = useDispatch();
  const { availableTransporters, isLoading, error } = useSelector(
    (state: RootState) => state.transporters
  );

  useEffect(() => {
    dispatch(fetchAvailableTransporters());
  }, [dispatch]);

  return (
    <ScrollView>
      {availableTransporters.map((transporter) => (
        <TransporterCard key={transporter._id} transporter={transporter} />
      ))}
    </ScrollView>
  );
}
```

### Get Single Transporter

```typescript
import { getTransporterById } from "../store/slices/transportersSlice";

const handleViewTransporter = async (transporterId: string) => {
  const result = await dispatch(getTransporterById(transporterId) as any);

  if (getTransporterById.fulfilled.match(result)) {
    console.log("Transporter details:", result.payload);
  }
};
```

### Update Transporter Profile

```typescript
import { updateTransporterProfile } from "../store/slices/transportersSlice";

const handleUpdateProfile = async (transporterId: string) => {
  const result = await dispatch(
    updateTransporterProfile({
      id: transporterId,
      data: {
        vehicle_type: "truck",
        capacity: 5000,
        rates: 50000,
      },
    }) as any
  );

  if (updateTransporterProfile.fulfilled.match(result)) {
    Alert.alert("Success", "Profile updated!");
  }
};
```

---

## 💳 Payment Processing

### Initiate Payment

```typescript
import * as paymentService from "../services/paymentService";

const handleInitiatePayment = async (orderId: string, amount: number) => {
  try {
    const paymentStatus = await paymentService.initiatePayment({
      order_id: orderId,
      amount: amount,
      method: "momo", // or 'bank_transfer', 'card'
    });

    console.log("Payment initiated:", paymentStatus);
    // Store payment ID for confirmation later
    setPaymentId(paymentStatus._id);
  } catch (error) {
    Alert.alert("Error", "Failed to initiate payment");
  }
};
```

### Check Payment Status

```typescript
const handleCheckPaymentStatus = async (paymentId: string) => {
  try {
    const status = await paymentService.getPaymentStatus(paymentId);

    if (status.status === "completed") {
      Alert.alert("Success", "Payment completed!");
      // Update order status
    } else if (status.status === "failed") {
      Alert.alert("Failed", "Payment failed. Please try again.");
    } else {
      Alert.alert("Pending", "Payment is still processing...");
    }
  } catch (error) {
    console.error("Error checking payment status:", error);
  }
};
```

---

## 🎣 Custom Hook for API Calls

### Create a Custom Hook

```typescript
// hooks/useApiCall.ts
import { useDispatch, useSelector } from "react-redux";
import { useState, useCallback } from "react";
import { RootState } from "../store";

export function useApiCall() {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeCall = useCallback(
    async (thunkAction: any) => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await dispatch(thunkAction);
        if (result.type.endsWith("/rejected")) {
          setError(result.payload || "An error occurred");
          return null;
        }
        return result.payload;
      } catch (err: any) {
        const errorMsg = err.message || "An error occurred";
        setError(errorMsg);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [dispatch]
  );

  return { isLoading, error, executeCall };
}

// Usage in component:
const { isLoading, error, executeCall } = useApiCall();

const handleFetch = async () => {
  const data = await executeCall(fetchCargo());
  if (data) {
    console.log("Fetched:", data);
  }
};
```

---

## 🔄 Polling for Real-Time Updates

```typescript
// Refresh orders every 30 seconds
useEffect(() => {
  const interval = setInterval(() => {
    if (user?._id) {
      dispatch(fetchUserOrders(user._id) as any);
    }
  }, 30000); // 30 seconds

  return () => clearInterval(interval);
}, [dispatch, user]);
```

---

## ⚡ Error Handling Patterns

### Global Error Handler

```typescript
// In your main App component or error boundary
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../store";

export function ErrorNotification() {
  const authError = useSelector((state: RootState) => state.auth.error);
  const cargoError = useSelector((state: RootState) => state.cargo.error);
  const ordersError = useSelector((state: RootState) => state.orders.error);

  useEffect(() => {
    if (authError) {
      Alert.alert("Auth Error", authError);
    }
    if (cargoError) {
      Alert.alert("Cargo Error", cargoError);
    }
    if (ordersError) {
      Alert.alert("Orders Error", ordersError);
    }
  }, [authError, cargoError, ordersError]);

  return null;
}
```

---

## 📱 Loading States

### Skeleton Loader While Loading

```typescript
{
  isLoading ? (
    <View style={styles.skeletonContainer}>
      <SkeletonLoader width="100%" height={100} />
      <SkeletonLoader width="100%" height={100} />
      <SkeletonLoader width="100%" height={100} />
    </View>
  ) : (
    <ScrollView>
      {cargo.map((item) => (
        <CargoCard key={item._id} cargo={item} />
      ))}
    </ScrollView>
  );
}
```

### Pull-to-Refresh

```typescript
import { useState } from "react";
import { RefreshControl } from "react-native";

export default function OrdersScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const { orders } = useSelector((state: RootState) => state.orders);
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  const onRefresh = async () => {
    setRefreshing(true);
    if (user?._id) {
      await dispatch(fetchUserOrders(user._id) as any);
    }
    setRefreshing(false);
  };

  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {orders.map((order) => (
        <OrderCard key={order._id} order={order} />
      ))}
    </ScrollView>
  );
}
```

---

## 🧪 Testing API Calls

### Manual Test Screen

```typescript
// Create src/screens/TestApiScreen.tsx
import React, { useState } from "react";
import { View, Text, Button, ScrollView, Alert } from "react-native";
import api from "../services/api";

export default function TestApiScreen() {
  const [response, setResponse] = useState<string>("");

  const testRegister = async () => {
    try {
      const res = await api.post("/auth/register", {
        name: "Test User " + Date.now(),
        phone: "+250700" + Math.random().toString().slice(2, 8),
        password: "testpass123",
        role: "farmer",
      });
      setResponse(JSON.stringify(res.data, null, 2));
    } catch (error: any) {
      setResponse("Error: " + error.message);
    }
  };

  const testLogin = async () => {
    try {
      const res = await api.post("/auth/login", {
        phone: "+250700000001",
        password: "password123",
      });
      setResponse(JSON.stringify(res.data, null, 2));
    } catch (error: any) {
      setResponse("Error: " + error.message);
    }
  };

  const testGetCrops = async () => {
    try {
      const res = await api.get("/crops");
      setResponse(JSON.stringify(res.data, null, 2));
    } catch (error: any) {
      setResponse("Error: " + error.message);
    }
  };

  return (
    <ScrollView style={{ flex: 1, padding: 10 }}>
      <Button title="Test Register" onPress={testRegister} />
      <Button title="Test Login" onPress={testLogin} />
      <Button title="Test Get Crops" onPress={testGetCrops} />
      <Text style={{ marginTop: 20, fontFamily: "monospace" }}>{response}</Text>
    </ScrollView>
  );
}
```

---

**All code snippets are copy-paste ready!** 🚀

Just replace placeholders with your actual data and adjust to your component structure.
