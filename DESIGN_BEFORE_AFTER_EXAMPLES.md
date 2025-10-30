# 🎨 Before & After Design Examples

## Real Code Comparisons - See What Changes

---

## 1️⃣ HOME SCREEN - Shipper/Farmer

### BEFORE

```typescript
// Current: Heavy, lots of colors, cramped
export const ShipperHomeScreen = () => {
  const theme = useTheme();

  return (
    <ScrollView style={{ backgroundColor: theme.colors.background }}>
      {/* Big header with color */}
      <View
        style={{
          backgroundColor: theme.colors.primary,
          paddingVertical: 24,
          paddingHorizontal: 16,
        }}
      >
        <Text style={{ fontSize: 20, fontWeight: "bold", color: "white" }}>
          Welcome back! 🌾
        </Text>
      </View>

      {/* Packed cards */}
      <View style={{ marginHorizontal: 12, marginTop: 12 }}>
        {/* Card 1 - Lots of info */}
        <View
          style={{
            backgroundColor: theme.colors.primaryLight,
            borderRadius: 12,
            padding: 16,
            marginBottom: 12,
            borderWidth: 1,
            borderColor: theme.colors.border,
          }}
        >
          <Text style={{ fontSize: 14, fontWeight: "bold" }}>
            Active Listings
          </Text>
          <View
            style={{
              flexDirection: "row",
              marginTop: 8,
              justifyContent: "space-between",
            }}
          >
            <Text>Total: 5</Text>
            <Text>Available: 3</Text>
            <Text>Pending: 2</Text>
          </View>
        </View>

        {/* Card 2 - Green background */}
        <View
          style={{
            backgroundColor: theme.colors.success,
            borderRadius: 12,
            padding: 16,
            marginBottom: 12,
            borderWidth: 1,
            borderColor: theme.colors.border,
          }}
        >
          <Text style={{ color: "white", fontWeight: "bold" }}>
            New Orders (3)
          </Text>
          <Text style={{ color: "white", marginTop: 8, fontSize: 12 }}>
            Tap to view details
          </Text>
        </View>

        {/* Multiple action buttons */}
        <View style={{ flexDirection: "row", marginTop: 12 }}>
          <Pressable style={{ flex: 1, marginRight: 8 }}>
            <Text
              style={{ padding: 12, backgroundColor: theme.colors.primary }}
            >
              Add Cargo
            </Text>
          </Pressable>
          <Pressable style={{ flex: 1, marginLeft: 8 }}>
            <Text style={{ padding: 12, backgroundColor: theme.colors.accent }}>
              View Orders
            </Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
};
```

### AFTER (Modern Minimalist)

```typescript
// Modern: Clean, spacious, focused
export const ShipperHomeScreen = () => {
  const theme = useTheme();

  return (
    <ScrollView style={{ backgroundColor: theme.colors.background }}>
      {/* Minimal header - just text */}
      <View
        style={{
          paddingVertical: 16,
          paddingHorizontal: 20,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.borderLight,
        }}
      >
        <Text
          style={{ fontSize: 32, fontWeight: "700", color: theme.colors.text }}
        >
          Shipments
        </Text>
      </View>

      {/* Main CTA button - single, clear */}
      <View style={{ paddingHorizontal: 20, paddingTop: 24 }}>
        <Pressable
          style={{
            backgroundColor: theme.colors.primary,
            borderRadius: 8,
            paddingVertical: 16,
            alignItems: "center",
            shadowColor: theme.colors.primary,
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 2,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: "white",
            }}
          >
            + Add New Shipment
          </Text>
        </Pressable>
      </View>

      {/* Generous spacing */}
      <View style={{ height: 24 }} />

      {/* Single, focused overview card */}
      <View style={{ paddingHorizontal: 20 }}>
        <Text
          style={{
            fontSize: 24,
            fontWeight: "600",
            color: theme.colors.text,
            marginBottom: 16,
          }}
        >
          Today's Activity
        </Text>

        {/* Card - minimal, clean */}
        <View
          style={{
            backgroundColor: theme.colors.card,
            borderRadius: 12,
            padding: 20,
            marginBottom: 16,
            borderWidth: 0, // No border
            shadowColor: "#000",
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 1,
          }}
        >
          {/* Simple grid layout */}
          <View style={{ flexDirection: "row", marginBottom: 16 }}>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 12,
                  color: theme.colors.textSecondary,
                  fontWeight: "500",
                  marginBottom: 4,
                }}
              >
                Active Listings
              </Text>
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: "700",
                  color: theme.colors.text,
                }}
              >
                5
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 12,
                  color: theme.colors.textSecondary,
                  fontWeight: "500",
                  marginBottom: 4,
                }}
              >
                New Orders
              </Text>
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: "700",
                  color: theme.colors.primary,
                }}
              >
                3
              </Text>
            </View>
          </View>
        </View>

        {/* Action - secondary button */}
        <Pressable
          style={{
            borderWidth: 1,
            borderColor: theme.colors.border,
            borderRadius: 8,
            paddingVertical: 12,
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: theme.colors.text,
            }}
          >
            View All Shipments
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
};
```

---

## 2️⃣ CARGO LIST SCREEN

### BEFORE

```typescript
// Dense, lots of colors, information overload
<FlatList
  data={cargoList}
  renderItem={({ item }) => (
    <View style={{ marginHorizontal: 12, marginBottom: 12 }}>
      <View
        style={{
          backgroundColor: theme.colors.primaryLight,
          borderRadius: 12,
          overflow: "hidden",
          borderWidth: 1,
          borderColor: theme.colors.border,
        }}
      >
        <View style={{ flexDirection: "row", padding: 12 }}>
          {/* Image */}
          <Image
            source={{ uri: item.image }}
            style={{ width: 60, height: 60, borderRadius: 8 }}
          />

          {/* Info - cramped */}
          <View style={{ flex: 1, marginLeft: 12 }}>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Text style={{ fontWeight: "bold", flex: 1 }}>{item.name}</Text>
              <View
                style={{
                  backgroundColor: theme.colors.success,
                  borderRadius: 20,
                  paddingHorizontal: 12,
                  paddingVertical: 4,
                }}
              >
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: "bold",
                    color: "white",
                  }}
                >
                  {item.status}
                </Text>
              </View>
            </View>

            <Text style={{ fontSize: 12, color: theme.colors.textSecondary }}>
              {item.quantity} {item.unit}
            </Text>

            <View
              style={{
                flexDirection: "row",
                marginTop: 8,
                justifyContent: "space-between",
              }}
            >
              <Text style={{ fontWeight: "bold" }}>RWF {item.price}</Text>
              <View style={{ flexDirection: "row" }}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <Text key={i} style={{ color: theme.colors.star }}>
                    ★
                  </Text>
                ))}
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  )}
/>
```

### AFTER (Modern Minimalist)

```typescript
// Clean, spacious, focused
<FlatList
  data={cargoList}
  renderItem={({ item }) => (
    <Pressable
      onPress={() => navigateToCargo(item.id)}
      style={{ paddingHorizontal: 20, marginBottom: 16 }}
    >
      <View
        style={{
          backgroundColor: theme.colors.card,
          borderRadius: 12,
          padding: 20,
          borderWidth: 0, // No border
          shadowColor: "#000",
          shadowOpacity: 0.05,
          shadowRadius: 2,
          elevation: 1,
        }}
      >
        {/* Clean hierarchy */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <View style={{ flex: 1 }}>
            {/* Title - prominent */}
            <Text
              style={{
                fontSize: 18,
                fontWeight: "600",
                color: theme.colors.text,
                marginBottom: 8,
              }}
            >
              {item.name}
            </Text>

            {/* Secondary info - subdued */}
            <Text
              style={{
                fontSize: 14,
                color: theme.colors.textSecondary,
                marginBottom: 12,
              }}
            >
              {item.quantity} {item.unit}
            </Text>

            {/* Price - emphasis */}
            <Text
              style={{
                fontSize: 20,
                fontWeight: "700",
                color: theme.colors.primary,
              }}
            >
              RWF {item.price.toLocaleString()}
            </Text>
          </View>

          {/* Status badge - minimal */}
          <View
            style={{
              backgroundColor: theme.colors.primaryLighter,
              borderRadius: 6,
              paddingHorizontal: 12,
              paddingVertical: 6,
              marginLeft: 12,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: "600",
                color: theme.colors.primary,
              }}
            >
              {item.status}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  )}
  contentContainerStyle={{ paddingTop: 16, paddingBottom: 24 }}
/>
```

---

## 3️⃣ TRIP TRACKING SCREEN

### BEFORE

```typescript
// Cluttered with lots of info
<ScrollView>
  {/* Status header */}
  <View
    style={{
      backgroundColor: theme.colors.primary,
      padding: 16,
    }}
  >
    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
      <View>
        <Text style={{ color: "white", fontWeight: "bold" }}>Trip Status</Text>
        <Text style={{ color: "white", fontSize: 18 }}>In Transit</Text>
      </View>
      <View
        style={{
          backgroundColor: theme.colors.accent,
          borderRadius: 8,
          paddingHorizontal: 12,
          paddingVertical: 8,
        }}
      >
        <Text style={{ fontWeight: "bold" }}>23 min</Text>
      </View>
    </View>
  </View>

  {/* Transporter info */}
  <View style={{ marginHorizontal: 12, marginTop: 12 }}>
    <View
      style={{
        backgroundColor: theme.colors.card,
        borderRadius: 12,
        padding: 12,
        flexDirection: "row",
        borderWidth: 1,
        borderColor: theme.colors.border,
      }}
    >
      <Image
        source={{ uri: trip.transporterImage }}
        style={{ width: 50, height: 50, borderRadius: 25 }}
      />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={{ fontWeight: "bold" }}>{trip.transporterName}</Text>
        <Text style={{ fontSize: 12 }}>Rating: 4.8 ⭐</Text>
        <Text style={{ fontSize: 12 }}>License: ABC-1234</Text>
      </View>
      <Pressable style={{ padding: 8 }}>
        <Text style={{ fontSize: 20 }}>📞</Text>
      </Pressable>
    </View>
  </View>

  {/* Map - small */}
  <View
    style={{
      marginHorizontal: 12,
      marginTop: 12,
      height: 200,
    }}
  >
    <MapView />
  </View>

  {/* Lots of buttons */}
  <View style={{ marginHorizontal: 12, marginTop: 12 }}>
    <Pressable
      style={{
        backgroundColor: theme.colors.primary,
        padding: 12,
        marginBottom: 8,
      }}
    >
      <Text>Call Driver</Text>
    </Pressable>
    <Pressable
      style={{
        backgroundColor: theme.colors.success,
        padding: 12,
        marginBottom: 8,
      }}
    >
      <Text>Send Message</Text>
    </Pressable>
    <Pressable
      style={{
        backgroundColor: theme.colors.info,
        padding: 12,
        marginBottom: 8,
      }}
    >
      <Text>View Details</Text>
    </Pressable>
  </View>

  {/* Details list */}
  <View style={{ marginHorizontal: 12, marginTop: 12 }}>
    <Text style={{ fontWeight: "bold", marginBottom: 8 }}>Trip Details</Text>
    <View
      style={{
        backgroundColor: theme.colors.primaryLight,
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
      }}
    >
      <Text>📍 From: {trip.from}</Text>
    </View>
    <View
      style={{
        backgroundColor: theme.colors.primaryLight,
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
      }}
    >
      <Text>📍 To: {trip.to}</Text>
    </View>
    <View
      style={{
        backgroundColor: theme.colors.primaryLight,
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
      }}
    >
      <Text>⏱️ ETA: {trip.eta}</Text>
    </View>
  </View>
</ScrollView>
```

### AFTER (Modern Minimalist)

```typescript
// Focused, clean, large map
<ScrollView
  style={{ backgroundColor: theme.colors.background }}
  scrollEnabled={false}
>
  {/* Minimal status - compact */}
  <View
    style={{
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.borderLight,
    }}
  >
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <View>
        <Text
          style={{
            fontSize: 14,
            color: theme.colors.textSecondary,
            fontWeight: "500",
            marginBottom: 4,
          }}
        >
          Trip Status
        </Text>
        <Text
          style={{
            fontSize: 24,
            fontWeight: "700",
            color: theme.colors.primary,
          }}
        >
          In Transit
        </Text>
      </View>
      <View style={{ alignItems: "flex-end" }}>
        <Text
          style={{
            fontSize: 12,
            color: theme.colors.textSecondary,
          }}
        >
          Est. Arrival
        </Text>
        <Text
          style={{
            fontSize: 18,
            fontWeight: "700",
            color: theme.colors.text,
          }}
        >
          23 min
        </Text>
      </View>
    </View>
  </View>

  {/* Large map - main focus */}
  <View
    style={{
      height: 400,
      backgroundColor: theme.colors.backgroundAlt,
    }}
  >
    <MapView />
  </View>

  {/* Driver info - single card */}
  <View style={{ paddingHorizontal: 20, paddingTop: 24 }}>
    <Text
      style={{
        fontSize: 16,
        fontWeight: "600",
        color: theme.colors.text,
        marginBottom: 12,
      }}
    >
      Driver
    </Text>

    <View
      style={{
        backgroundColor: theme.colors.card,
        borderRadius: 12,
        padding: 20,
        flexDirection: "row",
        borderWidth: 0,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
      }}
    >
      <Image
        source={{ uri: trip.transporterImage }}
        style={{ width: 60, height: 60, borderRadius: 30 }}
      />
      <View style={{ flex: 1, marginLeft: 16, justifyContent: "center" }}>
        <Text
          style={{
            fontSize: 16,
            fontWeight: "600",
            color: theme.colors.text,
          }}
        >
          {trip.transporterName}
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: theme.colors.textSecondary,
            marginTop: 4,
          }}
        >
          ⭐ 4.8 • {trip.tripsCompleted} trips
        </Text>
      </View>
      <Pressable
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: theme.colors.primary,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ fontSize: 18 }}>📞</Text>
      </Pressable>
    </View>
  </View>

  {/* Trip details - collapsible */}
  <View style={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 24 }}>
    <View
      style={{
        backgroundColor: theme.colors.card,
        borderRadius: 12,
        padding: 20,
        borderWidth: 0,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
      }}
    >
      {/* From */}
      <View style={{ marginBottom: 16 }}>
        <Text
          style={{
            fontSize: 12,
            color: theme.colors.textSecondary,
            fontWeight: "500",
            marginBottom: 4,
          }}
        >
          From
        </Text>
        <Text
          style={{
            fontSize: 16,
            fontWeight: "600",
            color: theme.colors.text,
          }}
        >
          {trip.from}
        </Text>
      </View>

      {/* To */}
      <View>
        <Text
          style={{
            fontSize: 12,
            color: theme.colors.textSecondary,
            fontWeight: "500",
            marginBottom: 4,
          }}
        >
          To
        </Text>
        <Text
          style={{
            fontSize: 16,
            fontWeight: "600",
            color: theme.colors.text,
          }}
        >
          {trip.to}
        </Text>
      </View>
    </View>
  </View>

  {/* Single primary action - full width */}
  <View style={{ paddingHorizontal: 20, paddingBottom: 24 }}>
    <Pressable
      style={{
        backgroundColor: theme.colors.primary,
        borderRadius: 8,
        paddingVertical: 16,
        alignItems: "center",
        shadowColor: theme.colors.primary,
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      <Text
        style={{
          fontSize: 16,
          fontWeight: "600",
          color: "white",
        }}
      >
        Mark as Delivered
      </Text>
    </Pressable>
  </View>
</ScrollView>
```

---

## Key Visual Changes Summary

| Aspect                  | Before                                          | After                                   |
| ----------------------- | ----------------------------------------------- | --------------------------------------- |
| **Colors**              | Multiple (primary light, success, info, accent) | Single focused color (primary for CTAs) |
| **Cards**               | Bordered (1px border)                           | Clean (shadow only)                     |
| **Spacing**             | Compact (8-12px)                                | Generous (16-24px)                      |
| **Buttons**             | Multiple per screen                             | Focused on 1-2 key actions              |
| **Typography**          | Varied, inconsistent                            | Clear hierarchy (h1, h2, body)          |
| **Information Density** | High (all info visible)                         | Progressive disclosure                  |
| **Visual Weight**       | Distributed                                     | Focused on key elements                 |

---

## Implementation Order

1. **Update `src/config/theme.ts`** - New colors ⏱️ 10 min
2. **Update Button, Card, Input components** - New styles ⏱️ 30 min
3. **Update Home screens** - Apply spacing, typography ⏱️ 1 hour
4. **Update List screens** - Cards, badges, filtering ⏱️ 1.5 hours
5. **Update Detail screens** - Focus, hierarchy ⏱️ 1 hour
6. **Update Auth screens** - Consistency ⏱️ 30 min
7. **Dark mode refinement** - Visual consistency ⏱️ 30 min
8. **Testing & refinement** - UX polish ⏱️ 1 hour

**Total**: ~6 hours

Would you like me to proceed with implementation?
