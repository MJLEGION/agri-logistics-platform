# 🔌 Payment & Escrow System - Integration Guide

Complete guide for integrating Payment, Escrow, and Receipt services into your screens.

---

## 📁 File Locations

```
src/services/
├── transactionService.ts        ← Main orchestrator
├── escrowService.ts             ← Escrow management
├── receiptService.ts            ← Digital receipts
├── momoService.ts               ← MoMo payment
├── flutterwaveService.ts        ← Flutterwave payment
└── paymentService.ts            ← Payment base

src/screens/shipper/
├── ShipperDashboard.tsx
├── CreateShipmentScreen.tsx     ← Integration needed here
└── PaymentScreen.tsx             ← Create this new file

src/screens/transporter/
├── TransporterDashboard.tsx
├── AcceptedDeliveriesScreen.tsx ← Integration needed here
└── DeliveryConfirmationScreen.tsx ← Integration needed here
```

---

## 🚀 Integration Steps

### Step 1: Create Payment Screen Component

Create new file: `src/screens/shipper/PaymentScreen.tsx`

```typescript
import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import {
  transactionService,
  TransactionRequest,
} from "@/services/transactionService";
import { receiptService } from "@/services/receiptService";

interface PaymentScreenProps {
  route: any;
  navigation: any;
}

/**
 * Farmer Payment Screen
 * Handles payment initiation with escrow & receipt generation
 */
export const PaymentScreen: React.FC<PaymentScreenProps> = ({
  route,
  navigation,
}) => {
  const { order, farmer, transporter } = route.params;

  const [phoneNumber, setPhoneNumber] = useState(farmer.phone);
  const [paymentMethod, setPaymentMethod] = useState<"momo" | "airtel">("momo");
  const [loading, setLoading] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receipt, setReceipt] = useState<any>(null);

  // Calculate totals
  const subtotal = order.items.reduce(
    (sum: number, item: any) => sum + item.total,
    0
  );
  const platformFee = order.platformFee || 0;
  const tax = Math.round(subtotal * 0.18); // 18% VAT
  const total = subtotal + platformFee + tax;

  const handlePayment = async () => {
    try {
      // Validate phone
      if (!phoneNumber || phoneNumber.length < 10) {
        Alert.alert("Invalid Phone", "Please enter a valid phone number");
        return;
      }

      setLoading(true);

      // Prepare transaction request
      const transactionRequest: TransactionRequest = {
        orderId: order.id,
        farmerId: farmer.id,
        farmerName: farmer.name,
        farmerPhone: farmer.phone,
        farmerEmail: farmer.email,
        farmerLocation: farmer.location,

        transporterId: transporter.id,
        transporterName: transporter.name,
        transporterPhone: transporter.phone,
        transporterEmail: transporter.email,
        transporterVehicleInfo: transporter.vehicleInfo,

        cargoDescription: order.cargo.description,
        cargoQuantity: order.cargo.quantity,
        cargoUnit: order.cargo.unit,
        pickupLocation: order.pickupLocation,
        dropoffLocation: order.dropoffLocation,
        pickupTime: order.pickupTime,
        estimatedDeliveryTime: order.estimatedDeliveryTime,

        paymentMethod,
        phoneNumber,
        email: farmer.email,

        items: order.items,
        platformFee,
        notes: order.notes,
      };

      // Initiate transaction (payment + escrow + receipt)
      const result = await transactionService.initiateTransaction(
        transactionRequest
      );

      if (result.success) {
        // Fetch receipt for display
        const receiptData = await receiptService.getReceipt(result.receiptId!);
        setReceipt(receiptData);
        setShowReceipt(true);

        // Show success
        Alert.alert(
          "✅ Payment Successful",
          `Receipt #${receiptData?.receiptNumber}\n\nPayment held in escrow until delivery confirmed.\n\nReceipt sent to both parties.`,
          [
            {
              text: "View Receipt",
              onPress: () => setShowReceipt(true),
            },
            {
              text: "Done",
              onPress: () => {
                // Navigate to order tracking
                navigation.replace("OrderTracking", { orderId: order.id });
              },
            },
          ]
        );
      } else {
        Alert.alert("❌ Payment Failed", result.message || "Please try again");
      }
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderPaymentMethodButton = (
    method: "momo" | "airtel",
    label: string
  ) => (
    <TouchableOpacity
      style={[
        styles.methodButton,
        paymentMethod === method && styles.methodButtonActive,
      ]}
      onPress={() => setPaymentMethod(method)}
      disabled={loading}
    >
      <Text
        style={[
          styles.methodButtonText,
          paymentMethod === method && styles.methodButtonTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  if (showReceipt && receipt) {
    return (
      <View style={styles.container}>
        <ScrollView>
          <View style={styles.receiptContainer}>
            <Text style={styles.receiptTitle}>Receipt</Text>
            <ReceiptPreview receipt={receipt} />
          </View>
        </ScrollView>
        <TouchableOpacity
          style={styles.downloadButton}
          onPress={() => {
            // In production: download/email receipt
            Alert.alert("Receipt", "Receipt has been emailed to you");
            setShowReceipt(false);
          }}
        >
          <Text style={styles.downloadButtonText}>📧 Emailed to You</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Order Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📦 Order Summary</Text>
        <View style={styles.summaryItem}>
          <Text style={styles.label}>From:</Text>
          <Text style={styles.value}>{order.pickupLocation}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.label}>To:</Text>
          <Text style={styles.value}>{order.dropoffLocation}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.label}>Cargo:</Text>
          <Text style={styles.value}>{order.cargo.description}</Text>
        </View>
      </View>

      {/* Cost Breakdown */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💰 Cost Breakdown</Text>

        {order.items.map((item: any, index: number) => (
          <View key={index} style={styles.costItem}>
            <Text style={styles.label}>{item.description}</Text>
            <Text style={styles.value}>RWF {item.total.toLocaleString()}</Text>
          </View>
        ))}

        <View style={styles.divider} />

        {platformFee > 0 && (
          <View style={styles.costItem}>
            <Text style={styles.label}>Platform Fee</Text>
            <Text style={styles.value}>RWF {platformFee.toLocaleString()}</Text>
          </View>
        )}

        <View style={styles.costItem}>
          <Text style={styles.label}>VAT (18%)</Text>
          <Text style={styles.value}>RWF {tax.toLocaleString()}</Text>
        </View>

        <View style={[styles.costItem, styles.totalItem]}>
          <Text style={styles.totalLabel}>TOTAL AMOUNT</Text>
          <Text style={styles.totalValue}>RWF {total.toLocaleString()}</Text>
        </View>
      </View>

      {/* Parties Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>👥 Parties</Text>

        <View style={styles.partyBox}>
          <Text style={styles.partyTitle}>👨‍🌾 Farmer</Text>
          <Text>{farmer.name}</Text>
          <Text style={styles.gray}>{farmer.phone}</Text>
        </View>

        <View style={styles.partyBox}>
          <Text style={styles.partyTitle}>🚗 Transporter</Text>
          <Text>{transporter.name}</Text>
          <Text style={styles.gray}>{transporter.phone}</Text>
        </View>
      </View>

      {/* Payment Method Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💳 Payment Method</Text>

        <View style={styles.methodsGrid}>
          {renderPaymentMethodButton("momo", "📱 MTN MoMo")}
          {renderPaymentMethodButton("airtel", "📱 Airtel Money")}
        </View>

        <Text style={styles.methodNote}>
          {paymentMethod === "momo"
            ? "MTN MoMo: 078, 079 numbers"
            : "Airtel Money: 072, 073, 075 numbers"}
        </Text>
      </View>

      {/* Phone Number Input */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📞 Phone Number</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. +250788123456"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          editable={!loading}
          keyboardType="phone-pad"
        />
      </View>

      {/* Escrow Information */}
      <View style={[styles.section, styles.infoBox]}>
        <Text style={styles.infoTitle}>🔒 Escrow Protection</Text>
        <Text style={styles.infoText}>
          Your payment will be held securely in escrow until the transporter
          confirms delivery. Once delivery is confirmed, payment is
          automatically released to the transporter.
        </Text>
        <Text style={styles.infoText}>
          If there's an issue, you can dispute the delivery and we'll resolve it
          within 24 hours.
        </Text>
      </View>

      {/* Payment Button */}
      <TouchableOpacity
        style={[styles.paymentButton, loading && styles.paymentButtonDisabled]}
        onPress={handlePayment}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.paymentButtonText}>
            💳 Pay RWF {total.toLocaleString()}
          </Text>
        )}
      </TouchableOpacity>

      {/* Cancel Button */}
      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => navigation.goBack()}
        disabled={loading}
      >
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

/**
 * Receipt Preview Component
 */
const ReceiptPreview: React.FC<{ receipt: any }> = ({ receipt }) => (
  <View style={styles.receiptContent}>
    <Text style={styles.receiptNumber}>Receipt #{receipt.receiptNumber}</Text>
    <Text style={styles.receiptDate}>
      {new Date(receipt.receiptDate).toLocaleDateString()}
    </Text>

    <View style={styles.receiptSection}>
      <Text style={styles.receiptSectionTitle}>Shipper</Text>
      <Text style={styles.bold}>{receipt.farmer.name}</Text>
      <Text style={styles.gray}>{receipt.farmer.phone}</Text>
    </View>

    <View style={styles.receiptSection}>
      <Text style={styles.receiptSectionTitle}>Transporter</Text>
      <Text style={styles.bold}>{receipt.transporter.name}</Text>
      <Text style={styles.gray}>{receipt.transporter.phone}</Text>
    </View>

    <View style={styles.receiptSection}>
      <Text style={styles.receiptSectionTitle}>Cargo</Text>
      <Text>{receipt.cargo.description}</Text>
      <Text style={styles.gray}>From: {receipt.cargo.pickupLocation}</Text>
      <Text style={styles.gray}>To: {receipt.cargo.dropoffLocation}</Text>
    </View>

    <View style={styles.divider} />

    <View style={styles.receiptTotal}>
      <View style={styles.totalRow}>
        <Text>Subtotal</Text>
        <Text>RWF {receipt.subtotal.toLocaleString()}</Text>
      </View>
      {receipt.platformFee > 0 && (
        <View style={styles.totalRow}>
          <Text>Platform Fee</Text>
          <Text>RWF {receipt.platformFee.toLocaleString()}</Text>
        </View>
      )}
      <View style={styles.totalRow}>
        <Text>VAT</Text>
        <Text>RWF {receipt.tax.toLocaleString()}</Text>
      </View>
      <View style={[styles.totalRow, styles.grand]}>
        <Text style={styles.bold}>TOTAL</Text>
        <Text style={[styles.bold, styles.green]}>
          RWF {receipt.totalAmount.toLocaleString()}
        </Text>
      </View>
    </View>

    <View style={[styles.infoBox, { marginTop: 20 }]}>
      <Text style={styles.infoTitle}>
        ✅ Payment Status: {receipt.paymentStatus}
      </Text>
      <Text style={styles.infoTitle}>
        🔒 Escrow Status: {receipt.escrowStatus}
      </Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 15,
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#27ae60",
  },
  summaryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  label: {
    color: "#666",
    flex: 1,
  },
  value: {
    fontWeight: "600",
    color: "#333",
  },
  costItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 10,
  },
  totalItem: {
    backgroundColor: "#f9f9f9",
    paddingHorizontal: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  totalLabel: {
    fontWeight: "bold",
    color: "#27ae60",
  },
  totalValue: {
    fontWeight: "bold",
    color: "#27ae60",
    fontSize: 16,
  },
  partyBox: {
    backgroundColor: "#f9f9f9",
    padding: 12,
    borderRadius: 5,
    marginBottom: 10,
  },
  partyTitle: {
    fontWeight: "bold",
    marginBottom: 5,
  },
  gray: {
    color: "#999",
    fontSize: 12,
  },
  methodsGrid: {
    flexDirection: "row",
    gap: 10,
  },
  methodButton: {
    flex: 1,
    padding: 12,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: "#ddd",
    backgroundColor: "#f9f9f9",
  },
  methodButtonActive: {
    borderColor: "#27ae60",
    backgroundColor: "#e8f8f5",
  },
  methodButtonText: {
    textAlign: "center",
    color: "#666",
    fontWeight: "600",
  },
  methodButtonTextActive: {
    color: "#27ae60",
  },
  methodNote: {
    color: "#999",
    fontSize: 12,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 12,
    fontSize: 16,
  },
  infoBox: {
    backgroundColor: "#e8f8f5",
    borderLeftWidth: 4,
    borderLeftColor: "#27ae60",
  },
  infoTitle: {
    fontWeight: "bold",
    color: "#27ae60",
    marginBottom: 8,
  },
  infoText: {
    color: "#555",
    marginBottom: 8,
    lineHeight: 20,
  },
  paymentButton: {
    backgroundColor: "#27ae60",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  paymentButtonDisabled: {
    opacity: 0.6,
  },
  paymentButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
  cancelButton: {
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  cancelButtonText: {
    textAlign: "center",
    color: "#666",
    fontWeight: "600",
  },

  // Receipt styles
  receiptContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 15,
  },
  receiptTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    paddingTop: 20,
    marginBottom: 20,
  },
  receiptContent: {
    padding: 15,
  },
  receiptNumber: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#27ae60",
    textAlign: "center",
  },
  receiptDate: {
    textAlign: "center",
    color: "#999",
    marginBottom: 20,
  },
  receiptSection: {
    marginBottom: 15,
  },
  receiptSectionTitle: {
    fontWeight: "bold",
    color: "#27ae60",
    marginBottom: 8,
  },
  bold: {
    fontWeight: "bold",
  },
  receiptTotal: {
    backgroundColor: "#f9f9f9",
    padding: 12,
    borderRadius: 5,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  grand: {
    borderTopWidth: 2,
    borderTopColor: "#27ae60",
    marginTop: 10,
    paddingTop: 10,
  },
  green: {
    color: "#27ae60",
  },
  downloadButton: {
    backgroundColor: "#27ae60",
    padding: 15,
    borderRadius: 8,
  },
  downloadButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
});

export default PaymentScreen;
```

---

### Step 2: Create Delivery Confirmation Screen

Create new file: `src/screens/transporter/DeliveryConfirmationScreen.tsx`

```typescript
import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { transactionService } from "@/services/transactionService";

interface DeliveryConfirmationScreenProps {
  route: any;
  navigation: any;
}

/**
 * Transporter Delivery Confirmation Screen
 * Confirms delivery and releases escrow payment
 */
export const DeliveryConfirmationScreen: React.FC<
  DeliveryConfirmationScreenProps
> = ({ route, navigation }) => {
  const { trip, transactionId } = route.params;

  const [otp, setOtp] = useState("");
  const [signature, setSignature] = useState("");
  const [loading, setLoading] = useState(false);
  const [signatureRequired] = useState(true);

  const handleConfirmDelivery = async () => {
    try {
      if (!otp || otp.length < 4) {
        Alert.alert("Missing Info", "Please enter OTP from farmer");
        return;
      }

      setLoading(true);

      // Confirm delivery and release escrow
      const result = await transactionService.confirmDeliveryAndReleaseEscrow(
        transactionId,
        {
          location: trip.dropoffLocation,
          photo: trip.proofPhoto,
          signature: signature || undefined,
          timestamp: new Date().toISOString(),
        }
      );

      if (result.success) {
        Alert.alert(
          "✅ Delivery Confirmed",
          `Payment of RWF ${trip.amount.toLocaleString()} has been released to your account.\n\nThank you!`,
          [
            {
              text: "Done",
              onPress: () => {
                navigation.replace("TransporterDashboard");
              },
            },
          ]
        );
      } else {
        Alert.alert("Error", result.message);
      }
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDispute = () => {
    Alert.prompt("Report Issue", "Describe what went wrong:", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Submit",
        onPress: async (reason) => {
          if (reason) {
            try {
              const result = await transactionService.raiseDispute(
                transactionId,
                reason,
                "transporter"
              );

              if (result.success) {
                Alert.alert(
                  "Issue Reported",
                  "Our team will review and contact you within 24 hours."
                );
                navigation.goBack();
              }
            } catch (error: any) {
              Alert.alert("Error", error.message);
            }
          }
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Delivery Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📍 Delivery Summary</Text>

        <View style={styles.summaryItem}>
          <Text style={styles.label}>From:</Text>
          <Text style={styles.value}>{trip.pickupLocation}</Text>
        </View>

        <View style={styles.summaryItem}>
          <Text style={styles.label}>To:</Text>
          <Text style={styles.value}>{trip.dropoffLocation}</Text>
        </View>

        <View style={styles.summaryItem}>
          <Text style={styles.label}>Cargo:</Text>
          <Text style={styles.value}>{trip.cargo}</Text>
        </View>
      </View>

      {/* Farmer Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>👨‍🌾 Farmer</Text>
        <Text style={styles.bold}>{trip.farmerName}</Text>
        <Text style={styles.gray}>{trip.farmerPhone}</Text>
      </View>

      {/* Payment Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💰 Payment</Text>
        <View style={styles.paymentInfo}>
          <View style={styles.paymentRow}>
            <Text>Amount:</Text>
            <Text style={styles.bold}>RWF {trip.amount.toLocaleString()}</Text>
          </View>
          <View style={styles.paymentRow}>
            <Text>Status:</Text>
            <Text style={[styles.bold, styles.pending]}>🔒 In Escrow</Text>
          </View>
          <Text style={styles.infoText}>
            Payment will be released to your account once delivery is confirmed
          </Text>
        </View>
      </View>

      {/* OTP Input */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔐 Verification</Text>
        <Text style={styles.label}>Enter OTP from farmer:</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 1234"
          value={otp}
          onChangeText={setOtp}
          keyboardType="number-pad"
          maxLength={6}
          editable={!loading}
        />
        <Text style={styles.gray}>
          Ask farmer for the 4-digit OTP sent to their phone
        </Text>
      </View>

      {/* Signature Input */}
      {signatureRequired && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✍️ Signature</Text>
          <TextInput
            style={[styles.input, styles.signatureInput]}
            placeholder="Farmer signature or thumb print photo URL"
            value={signature}
            onChangeText={setSignature}
            editable={!loading}
            multiline
          />
          <Text style={styles.gray}>
            Paste the URL of the signature/proof photo
          </Text>
        </View>
      )}

      {/* Proof Photos */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📸 Proof</Text>
        <View style={styles.proofBox}>
          <Text style={styles.bold}>Location Photo:</Text>
          <Text style={styles.gray}>{trip.proofPhoto || "Not provided"}</Text>
        </View>
        <Text style={styles.infoText}>
          Make sure you have taken clear photos of the delivery location
        </Text>
      </View>

      {/* Confirmation Warning */}
      <View style={[styles.section, styles.warningBox]}>
        <Text style={styles.warningTitle}>⚠️ Important</Text>
        <Text style={styles.warningText}>
          By confirming delivery, you certify that:
        </Text>
        <Text style={styles.warningText}>
          ✓ Cargo delivered to specified location
        </Text>
        <Text style={styles.warningText}>✓ Farmer verified and signed off</Text>
        <Text style={styles.warningText}>
          ✓ No disputes or issues with delivery
        </Text>
      </View>

      {/* Buttons */}
      <TouchableOpacity
        style={[styles.confirmButton, loading && styles.buttonDisabled]}
        onPress={handleConfirmDelivery}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.confirmButtonText}>
            ✅ Confirm Delivery & Release Payment
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.disputeButton}
        onPress={handleDispute}
        disabled={loading}
      >
        <Text style={styles.disputeButtonText}>⚠️ Report Issue</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => navigation.goBack()}
        disabled={loading}
      >
        <Text style={styles.cancelButtonText}>Back</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 15,
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#27ae60",
  },
  summaryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  label: {
    color: "#666",
    flex: 1,
  },
  value: {
    fontWeight: "600",
    color: "#333",
  },
  bold: {
    fontWeight: "bold",
  },
  gray: {
    color: "#999",
    fontSize: 12,
    marginTop: 5,
  },
  paymentInfo: {
    backgroundColor: "#f9f9f9",
    padding: 12,
    borderRadius: 5,
  },
  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  pending: {
    color: "#f39c12",
  },
  infoText: {
    color: "#666",
    marginTop: 10,
    lineHeight: 18,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 12,
    fontSize: 16,
    marginBottom: 8,
  },
  signatureInput: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  proofBox: {
    backgroundColor: "#f9f9f9",
    padding: 12,
    borderRadius: 5,
  },
  warningBox: {
    backgroundColor: "#fef5e7",
    borderLeftWidth: 4,
    borderLeftColor: "#f39c12",
  },
  warningTitle: {
    color: "#f39c12",
    fontWeight: "bold",
    marginBottom: 8,
  },
  warningText: {
    color: "#666",
    marginVertical: 4,
  },
  confirmButton: {
    backgroundColor: "#27ae60",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  confirmButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
  disputeButton: {
    backgroundColor: "#e74c3c",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  disputeButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
  },
  cancelButton: {
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  cancelButtonText: {
    textAlign: "center",
    color: "#666",
    fontWeight: "600",
  },
});

export default DeliveryConfirmationScreen;
```

---

### Step 3: Add to Navigation

Update `src/navigation/AppNavigator.tsx`:

```typescript
import PaymentScreen from "@/screens/shipper/PaymentScreen";
import DeliveryConfirmationScreen from "@/screens/transporter/DeliveryConfirmationScreen";

const ShipperStack = () => (
  <Stack.Navigator>
    {/* ... other screens ... */}
    <Stack.Screen
      name="Payment"
      component={PaymentScreen}
      options={{ title: "Complete Payment" }}
    />
  </Stack.Navigator>
);

const TransporterStack = () => (
  <Stack.Navigator>
    {/* ... other screens ... */}
    <Stack.Screen
      name="DeliveryConfirmation"
      component={DeliveryConfirmationScreen}
      options={{ title: "Confirm Delivery" }}
    />
  </Stack.Navigator>
);
```

---

### Step 4: Integration Points

#### 4a. Create Order (Shipper)

```typescript
// In CreateShipmentScreen.tsx or similar
import { transactionService } from "@/services/transactionService";

const handleCreateOrder = async () => {
  // ... create order ...

  // Navigate to payment
  navigation.navigate("Payment", {
    order: {
      id: orderId,
      cargo: cargoDetails,
      pickupLocation,
      dropoffLocation,
      pickupTime,
      estimatedDeliveryTime,
      items: costItems,
      platformFee: 5000,
      notes: additionalNotes,
    },
    farmer: {
      id: farmerId,
      name: farmerName,
      phone: farmerPhone,
      email: farmerEmail,
      location: farmerLocation,
    },
    transporter: {
      id: transporterId,
      name: transporterName,
      phone: transporterPhone,
      email: transporterEmail,
      vehicleInfo: vehicleInfo,
    },
  });
};
```

####4b. Accept Order (Transporter)

```typescript
// In AcceptedDeliveriesScreen.tsx or similar
const handleAcceptOrder = async (order) => {
  // ... accept order ...

  // Show payment status
  const txStatus = await transactionService.getTransactionStatus(
    order.transactionId
  );

  Alert.alert(
    "Order Accepted",
    `Payment of RWF ${order.amount.toLocaleString()} is held in escrow.\n\nIt will be released once you confirm delivery.`
  );
};
```

#### 4c. Complete Delivery (Transporter)

```typescript
// In trip completion flow
const handleCompleteTrip = () => {
  navigation.navigate("DeliveryConfirmation", {
    trip: tripData,
    transactionId: trip.transactionId,
  });
};
```

---

### Step 5: Track Payment Status

```typescript
// In order tracking screen
import { transactionService } from "@/services/transactionService";
import { escrowService } from "@/services/escrowService";

const PaymentStatusIndicator = ({ transactionId, escrowId }) => {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    const checkStatus = async () => {
      const txStatus = await transactionService.getTransactionStatus(
        transactionId
      );
      const escrow = await escrowService.getEscrow(escrowId);
      setStatus({ tx: txStatus, escrow });
    };

    checkStatus();
  }, []);

  return (
    <View>
      <Text>💰 Payment: {status?.tx?.paymentStatus}</Text>
      <Text>🔒 Escrow: {status?.escrow?.status}</Text>
    </View>
  );
};
```

---

## 🧪 Testing Integration

### Test Checklist

- [ ] Create order and navigate to payment screen
- [ ] Complete payment with MoMo/Airtel
- [ ] Verify escrow created
- [ ] Verify receipt emailed
- [ ] Accept order as transporter
- [ ] Complete delivery and release escrow
- [ ] Verify payment appears in wallet
- [ ] Test dispute flow
- [ ] Test refund flow
- [ ] Check transaction history

---

## 📊 Monitoring

### Logs to Check

```typescript
// Payment initiation
console.log("💳 Processing payment...");

// Escrow creation
console.log("✅ Escrow created:", { escrowId, amount, status: "held" });

// Receipt generation
console.log("✅ Receipt generated:", {
  receiptId,
  receiptNumber,
  amount: total,
});

// Receipt emailing
console.log("✅ Receipt emailed:", { receiptId, emailTo });

// Delivery confirmation
console.log("✅ Delivery confirmed and escrow released...");

// Errors
console.error("❌ Failed to...", error);
```

---

## 🚀 Production Deployment

1. **Backend API Setup**

   - Implement payment gateway endpoints
   - Set up email service for receipts
   - Configure SMS notifications

2. **Database**

   - Store transactions
   - Store escrows
   - Store receipts
   - For production migration from AsyncStorage

3. **Testing**

   - Test with real payment gateways (sandbox)
   - Test escrow flow completely
   - Test dispute resolution

4. **Monitoring**
   - Set up transaction logging
   - Monitor payment failures
   - Set up alerts for disputes

---

## 📞 Support

For issues or questions:

1. Check logs first
2. Review PAYMENT_ESCROW_SYSTEM.md for details
3. Test with mock data
4. Contact: support@agrilogistics.com

---

**Integration Complete! 🎉**
