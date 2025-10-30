# 🌟 Rating System - How to Access & Use

## ✅ Now Available in Your App!

The rating system has been integrated into your app navigation. Here's how to access it:

---

## 📱 For Shippers/Farmers (Rating Transporters)

### Method 1: Direct Navigation (After Trip Completion)

After a delivery is completed, navigate to the Rating Screen:

```typescript
// In any screen where you have delivery/trip completion
navigation.navigate("Rating", {
  transactionId: trip.id, // Unique trip ID
  transporterId: transporter.id, // ID of transporter being rated
  transporterName: transporter.name, // Name of transporter
  farmerId: user.id, // Your (shipper's) ID
  farmerName: user.name, // Your (shipper's) name
});
```

### Method 2: From Trip/Order History

1. Go to **"Active Orders"** or **"Order History"** screen
2. Find a completed order
3. Add a "Rate" button to the order card (see code below)

#### Add Rate Button to ShipperActiveOrdersScreen

In `src/screens/shipper/ShipperActiveOrdersScreen.tsx`, add this inside the order card:

```typescript
{
  item.status === "completed" && (
    <TouchableOpacity
      style={[styles.rateButton, { backgroundColor: theme.tertiary }]}
      onPress={() => {
        navigation.navigate("Rating", {
          transactionId: item._id || item.id,
          transporterId: item.transporterId,
          transporterName: item.transporterName,
          farmerId: user?._id || user?.id,
          farmerName: user?.name || user?.full_name,
        });
      }}
    >
      <Ionicons name="star" size={16} color="#FFF" />
      <Text style={styles.rateButtonText}>Rate Transporter</Text>
    </TouchableOpacity>
  );
}
```

Add to styles:

```typescript
rateButton: {
  flexDirection: 'row',
  alignItems: 'center',
  padding: 12,
  borderRadius: 8,
  marginTop: 10,
  gap: 8,
},
rateButtonText: {
  color: '#FFF',
  fontWeight: '600',
  fontSize: 14,
},
```

---

## 🎯 The Rating Screen Features

Once you navigate to the Rating Screen, you'll see:

### ⭐ Star Selection

- Click on 1-5 stars to rate your experience
- Stars show labels:
  - 1 ⭐ = Poor - Not satisfied
  - 2 ⭐ = Fair - Some issues
  - 3 ⭐ = Good - Acceptable
  - 4 ⭐ = Great - Very satisfied
  - 5 ⭐ = Excellent - Outstanding

### 💬 Optional Comment

- Add a comment (0-1000 characters)
- Share details about your experience
- Character counter shows progress

### ✅ Submit Your Rating

- Click "Submit" button to save your rating
- Choose to "View Profile" or "Go Home" after submission

---

## 📊 View Your Ratings

Once a transporter has ratings, you can:

1. **View Transporter Profile** - See average rating, reviews, and verification badges
2. **Check Leaderboard** - See top-rated transporters
3. **Read Reviews** - See what others said about the transporter

---

## 🧪 Test the Rating System

### Quick Test Steps:

1. **Navigate to Rating Screen directly** (in your emulator/app):

   ```
   Use React Native DevTools or add a test button to your home screen
   ```

2. **Use these test parameters**:

   ```json
   {
     "transactionId": "trip-001",
     "transporterId": "trans-123",
     "transporterName": "John's Transport",
     "farmerId": "farmer-456",
     "farmerName": "Your Name"
   }
   ```

3. **Submit a rating** with all options (1-5 stars + comment)

4. **Verify the rating was saved** by checking:
   - Rating service response
   - Local storage (offline sync)
   - Backend database (if connected)

---

## 🔗 Navigation Reference

The Rating screen is now added to your app navigation stack:

```typescript
// File: src/navigation/AppNavigator.tsx

// Added to transporter stack:
<Stack.Screen name="Rating" component={RatingScreen} />
<Stack.Screen name="TransporterProfile" component={TransporterProfileScreen} />

// You can navigate from anywhere:
navigation.navigate('Rating', { /* params */ })
navigation.navigate('TransporterProfile', { transporterId: 'xxx' })
```

---

## 📝 Next Steps

1. ✅ Add "Rate Transporter" button to order/trip history screens
2. ✅ Trigger rating screen after trip completion
3. ✅ Add "View Transporter Profile" link in search results
4. ✅ Implement rating reminders (optional)
5. ✅ Show ratings in transporter listings

---

## 🐛 Troubleshooting

### Rating screen not showing?

- Make sure navigation params are passed correctly
- Check that `transactionId`, `transporterId`, and `farmerId` are provided
- Verify the Rating screen is imported in AppNavigator

### Rating not saving?

- Check that `ratingService.createRating()` is working
- Verify backend API is responding (if using backend)
- Check browser console/app logs for errors

### Need help?

- Check `src/screens/transporter/RatingScreen.tsx` for full implementation
- Check `src/services/ratingService.ts` for rating logic
- Look at `COMPLETE_RATINGS_INTEGRATION_CHECKLIST.md` for detailed integration steps

---

## ✨ Next Phase: Advanced Features

Once basic ratings are working, you can add:

- **Leaderboard** - Top-rated transporters
- **Incentives** - Rewards for high ratings
- **Rating Reminders** - Notify users to rate
- **Advanced Analytics** - Charts and insights
- **Sentiment Analysis** - Auto-categorize reviews

See `ADVANCED_RATINGS_FEATURES.md` for details.
