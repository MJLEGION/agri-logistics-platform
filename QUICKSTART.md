# ⚡ Quick Start Guide

Get your Agri-Logistics Platform up and running in 5 minutes!

---

## 🚀 Fast Setup (5 Steps)

### **Step 1: Install Dependencies**

```bash
npm install
```

⏱️ _This may take 2-3 minutes_

---

### **Step 2: Create Environment File**

```bash
# Copy the example file
cp .env.example .env
```

**Edit `.env` file:**

```env
API_BASE_URL=http://localhost:3000/api
GOOGLE_MAPS_API_KEY=your_key_here
```

> 💡 **Tip**: For physical device testing, replace `localhost` with your computer's IP address

---

### **Step 3: Start the Development Server**

```bash
npm start
```

You'll see a QR code in your terminal.

---

### **Step 4: Open on Your Device**

#### **Option A: Physical Device (Recommended)**

1. Install **Expo Go** app:
   - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
   - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
2. Scan the QR code with your camera (iOS) or Expo Go app (Android)

#### **Option B: Emulator/Simulator**

```bash
# Android
npm run android

# iOS (macOS only)
npm run ios
```

---

### **Step 5: Test the App**

Try these test credentials (or register new users):

**Farmer Account:**

```
Email: farmer@test.com
Password: password123
```

**Buyer Account:**

```
Email: buyer@test.com
Password: password123
```

**Transporter Account:**

```
Email: transporter@test.com
Password: password123
```

---

## 🎯 What to Try First

### **As a Farmer:**

1. Navigate to "List Crop"
2. Add a new crop (e.g., Maize, 500kg, 800 RWF/kg)
3. View your listings
4. Check active orders

### **As a Buyer:**

1. Browse available crops
2. Place an order
3. Track order status in "My Orders"

### **As a Transporter:**

1. View available loads
2. Accept a delivery
3. Manage active trips

---

## 🔧 Common Issues & Quick Fixes

### **Issue: "Cannot connect to Metro bundler"**

```bash
# Clear cache and restart
npx expo start -c
```

### **Issue: "Module not found"**

```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

### **Issue: "Network request failed"**

- Check if backend API is running
- Verify `API_BASE_URL` in `.env` file
- For physical devices, use your computer's IP instead of `localhost`

### **Issue: App won't load on physical device**

- Ensure phone and computer are on the same WiFi network
- Check firewall settings
- Try restarting Expo server

---

## 📱 Device-Specific Instructions

### **Windows + Android Device**

1. Find your computer's IP:

   ```bash
   ipconfig
   ```

   Look for "IPv4 Address" (e.g., 192.168.1.100)

2. Update `.env`:

   ```env
   API_BASE_URL=http://192.168.1.100:3000/api
   ```

3. Restart Expo:
   ```bash
   npm start
   ```

### **macOS + iPhone**

1. Find your computer's IP:

   ```bash
   ifconfig | grep "inet "
   ```

2. Update `.env` with your IP

3. Restart Expo

---

## 🎨 Project Structure at a Glance

```
src/
├── screens/          # All app screens
│   ├── auth/         # Login, Register
│   ├── farmer/       # Farmer screens
│   ├── buyer/        # Buyer screens
│   └── transporter/  # Transporter screens
├── store/            # Redux state management
├── navigation/       # App navigation
├── components/       # Reusable components
└── types/            # TypeScript types
```

---

## 📚 Next Steps

- ✅ Read the full [README.md](README.md) for detailed documentation
- ✅ Check [DEMO_GUIDE.md](DEMO_GUIDE.md) for video recording tips
- ✅ Explore the codebase and customize features
- ✅ Add your own test data

---

## 💡 Pro Tips

1. **Use the Role Switcher**: Quickly test different user roles without logging out
2. **Check Redux DevTools**: Monitor state changes in real-time
3. **Hot Reload**: Save files to see changes instantly
4. **TypeScript Errors**: Run `npx tsc --noEmit` to check for type errors

---

## 🆘 Need Help?

- **Documentation**: See [README.md](README.md)
- **Troubleshooting**: Check the Troubleshooting section in README.md
- **Expo Docs**: https://docs.expo.dev/
- **React Native Docs**: https://reactnative.dev/

---

<div align="center">

**Happy Coding! 🌾📱**

_You're now ready to explore the Agri-Logistics Platform!_

</div>
