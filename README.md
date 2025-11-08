# 🌾 Agri-Logistics Platform

<div align="center">

**A Mobile-First Agricultural Supply Chain Solution for Rwanda**

[![React Native](https://img.shields.io/badge/React%20Native-0.81.4-blue.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-~54.0-000020.svg)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-blue.svg)](https://www.typescriptlang.org/)
[![Redux Toolkit](https://img.shields.io/badge/Redux%20Toolkit-2.9.0-purple.svg)](https://redux-toolkit.js.org/)

</div>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#️-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Setup](#environment-setup)
  - [Running the Application](#running-the-application)
- [User Roles & Workflows](#-user-roles--workflows)
- [Screenshots](#-screenshots)
- [Development](#-development)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌍 Overview

The **Agri-Logistics Platform** is a comprehensive mobile application designed to digitize and streamline the agricultural supply chain in Rwanda. By connecting **farmers**, **buyers**, and **transporters** on a single platform, we aim to:

- ✅ Reduce post-harvest losses
- ✅ Improve market access for smallholder farmers
- ✅ Optimize logistics and transportation
- ✅ Increase transparency in agricultural trade
- ✅ Enable real-time tracking and communication

This platform empowers farmers to list their produce, buyers to discover and order crops, and transporters to manage deliveries efficiently—all through an intuitive, mobile-first interface.

---

## ✨ Features

### 🔐 **Authentication & Role Management**

- Secure user registration and login
- Three distinct user roles: **Farmer**, **Buyer**, **Transporter**
- Role-based navigation and access control
- Seamless role switching for testing and multi-role users

### 👨‍🌾 **Farmer Features**

- **List Crops**: Add produce with details (name, quantity, unit, price, harvest date)
- **Manage Listings**: Edit or delete crop listings
- **View Orders**: Track active orders and order history
- **Dashboard**: Overview of listed crops and pending orders

### 🛒 **Buyer Features**

- **Browse Crops**: Discover available produce with filtering options
- **Place Orders**: Submit orders with quantity and delivery details
- **Order Tracking**: Monitor order status (pending, accepted, in-progress, completed)
- **Dashboard**: Quick access to recent listings and order summary

### 🚚 **Transporter Features**

- **Available Loads**: View and accept delivery requests
- **Active Trips**: Manage ongoing deliveries
- **Trip Tracking**: Update delivery status in real-time
- **Dashboard**: Overview of available and active trips

### 🎨 **UI/UX Highlights**

- Vibrant agricultural theme with green and earth tones
- Material Design components via React Native Paper
- Responsive layouts optimized for mobile devices
- Smooth animations and transitions
- Dark/Light theme support (via ThemeContext)

---

## 🛠️ Tech Stack

### **Frontend**

| Technology                                          | Version | Purpose                           |
| --------------------------------------------------- | ------- | --------------------------------- |
| [React Native](https://reactnative.dev/)            | 0.81.4  | Cross-platform mobile framework   |
| [Expo](https://expo.dev/)                           | ~54.0   | Development platform and tooling  |
| [TypeScript](https://www.typescriptlang.org/)       | 5.9.2   | Type-safe JavaScript              |
| [React Navigation](https://reactnavigation.org/)    | 7.x     | Navigation library (Stack & Tabs) |
| [React Native Paper](https://reactnativepaper.com/) | 5.14.5  | Material Design UI components     |

### **State Management**

| Technology                                              | Version | Purpose                             |
| ------------------------------------------------------- | ------- | ----------------------------------- |
| [Redux Toolkit](https://redux-toolkit.js.org/)          | 2.9.0   | State management with async thunks  |
| [React Redux](https://react-redux.js.org/)              | 9.2.0   | React bindings for Redux            |
| [Redux Persist](https://github.com/rt2zz/redux-persist) | 6.0.0   | Persist Redux state to AsyncStorage |

### **Forms & Validation**

| Technology                            | Version | Purpose               |
| ------------------------------------- | ------- | --------------------- |
| [Formik](https://formik.org/)         | 2.4.6   | Form state management |
| [Yup](https://github.com/jquense/yup) | 1.7.1   | Schema validation     |

### **Additional Libraries**

| Technology                                                                         | Version | Purpose                   |
| ---------------------------------------------------------------------------------- | ------- | ------------------------- |
| [Axios](https://axios-http.com/)                                                   | 1.12.2  | HTTP client for API calls |
| [Expo Location](https://docs.expo.dev/versions/latest/sdk/location/)               | ~19.0   | Geolocation services      |
| [React Native Maps](https://github.com/react-native-maps/react-native-maps)        | 1.20.1  | Map integration           |
| [Expo Linear Gradient](https://docs.expo.dev/versions/latest/sdk/linear-gradient/) | 15.0.7  | Gradient backgrounds      |

---

## 📂 Project Structure

```
agri-logistics-platform/
│
├── src/
│   ├── api/                    # API configuration and service calls
│   │   ├── axios.config.ts     # Axios instance with interceptors
│   │   └── services/           # API service modules
│   │
│   ├── components/             # Reusable UI components
│   │   ├── common/             # Shared components (BackButton, RoleSwitcher)
│   │   └── ui/                 # UI-specific components
│   │
│   ├── contexts/               # React Context providers
│   │   └── ThemeContext.tsx    # Theme management (light/dark mode)
│   │
│   ├── navigation/             # Navigation configuration
│   │   ├── AppNavigator.tsx    # Root navigator
│   │   ├── AuthNavigator.tsx   # Authentication flow
│   │   ├── FarmerNavigator.tsx # Farmer role navigation
│   │   ├── BuyerNavigator.tsx  # Buyer role navigation
│   │   └── TransporterNavigator.tsx # Transporter role navigation
│   │
│   ├── screens/                # Screen components organized by role
│   │   ├── auth/               # Login, Register, RoleSelection
│   │   ├── farmer/             # Farmer-specific screens
│   │   ├── buyer/              # Buyer-specific screens
│   │   └── transporter/        # Transporter-specific screens
│   │
│   ├── store/                  # Redux store configuration
│   │   ├── index.ts            # Store setup with typed hooks
│   │   └── slices/             # Redux slices
│   │       ├── authSlice.ts    # Authentication state
│   │       ├── cropsSlice.ts   # Crop listings state
│   │       ├── ordersSlice.ts  # Orders state
│   │       └── tripsSlice.ts   # Trips/deliveries state
│   │
│   └── types/                  # TypeScript type definitions
│       └── index.ts            # Global types (User, Crop, Order, Trip)
│
├── assets/                     # Static assets (images, fonts)
├── .env.example                # Environment variables template
├── app.json                    # Expo configuration
├── package.json                # Dependencies and scripts
├── tsconfig.json               # TypeScript configuration
└── README.md                   # This file
```

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js) or **Yarn**
- **Expo Go** app on your mobile device:
  - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
  - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
- **Android Studio** (for Android emulator) or **Xcode** (for iOS simulator, macOS only)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/agri-logistics-platform.git
   cd agri-logistics-platform
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

   Or if you prefer Yarn:

   ```bash
   yarn install
   ```

### Environment Setup

1. **Create environment file**

   Copy the example environment file:

   ```bash
   cp .env.example .env
   ```

2. **Configure environment variables**

   Open `.env` and add your configuration:

   ```env
   # Backend API URL
   API_BASE_URL=http://localhost:3000/api
   # For physical device testing, use your computer's local IP:
   # API_BASE_URL=http://192.168.1.XXX:3000/api

   # Google Maps API Key (for map features)
   GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
   ```

   > **Note**: To get a Google Maps API key, visit the [Google Cloud Console](https://console.cloud.google.com/)

### Running the Application

#### **Start the Development Server**

```bash
npm start
```

This will start the Expo development server and display a QR code in your terminal.

#### **Run on Physical Device**

1. Open the **Expo Go** app on your phone
2. Scan the QR code displayed in your terminal
3. The app will load on your device

#### **Run on Android Emulator**

```bash
npm run android
```

> **Prerequisites**: Android Studio with an Android Virtual Device (AVD) configured

#### **Run on iOS Simulator** (macOS only)

```bash
npm run ios
```

> **Prerequisites**: Xcode with iOS Simulator installed

#### **Run on Web** (for testing purposes)

```bash
npm run web
```

> **Note**: Some native features (maps, location) may not work on web

---

## 🖥️ Backend Setup

This application requires a Node.js + Express + MongoDB backend to function properly.

### Backend Installation

1. **Navigate to backend directory**

   ```bash
   cd ../agri-logistics-backend
   ```

2. **Install backend dependencies**

   ```bash
   npm install
   ```

3. **Configure backend environment**

   Create `.env` file in backend root:

   ```env
   PORT=5000
   MONGODB_URI=mongodb+srv://your_connection_string
   JWT_SECRET=your-super-secret-jwt-key
   JWT_REFRESH_SECRET=your-super-secret-refresh-token-key
   NODE_ENV=development
   ```

4. **Seed demo accounts** (optional but recommended)

   ```bash
   node scripts/seedDemoAccounts.js
   ```

5. **Start the backend server**

   ```bash
   npm start
   ```

   Backend will run on `http://localhost:5000`

### Demo Accounts

After seeding, you can use these credentials to test the application:

#### **Shipper Account**
- **Phone**: `0788000001`
- **Password**: `password123`
- **Use for**: Listing cargo, requesting transport, rating transporters

#### **Transporter Account**
- **Phone**: `0789000003`
- **Password**: `password123`
- **Use for**: Browsing loads, accepting trips, completing deliveries

---

## 📦 Building for Production

### Build Android APK

1. **Install EAS CLI**

   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo**

   ```bash
   eas login
   ```

3. **Configure build**

   ```bash
   eas build:configure
   ```

4. **Build APK** (Android)

   ```bash
   eas build --platform android --profile preview
   ```

   The APK will be available in your Expo dashboard for download.

5. **Build for App Store** (iOS - macOS only)

   ```bash
   eas build --platform ios --profile preview
   ```

### Alternative: Local APK Build

```bash
# For Android APK
expo build:android -t apk

# For iOS
expo build:ios
```

---

## 🧪 Testing Guide

### Manual Testing Workflow

1. **Authentication Flow**
   - Register new account
   - Login with demo credentials
   - Logout and re-login
   - Test role-based navigation

2. **Shipper Flow Test**
   - Login as shipper (0788000001)
   - List new cargo
   - View cargo in "My Cargo"
   - Request transport
   - Track active orders
   - Rate transporter after delivery

3. **Transporter Flow Test**
   - Login as transporter (0789000003)
   - Browse available loads
   - Accept a trip
   - View trip in "Active Trips"
   - Complete delivery
   - View earnings dashboard

4. **Cross-Platform Testing**
   - Test on Android device/emulator
   - Test on web browser
   - Test on different screen sizes
   - Test with different data values

5. **Performance Testing**
   - Test with slow network
   - Test with multiple cargo items
   - Test real-time GPS tracking
   - Test offline functionality

### Testing on Different Devices

- **Low-end Android** (4GB RAM, Android 9): Test performance
- **Mid-range Android** (6GB RAM, Android 11): Normal usage
- **High-end Android** (8GB+ RAM, Android 13): Smooth performance
- **iOS** (iPhone 8+): Test compatibility

---

## 👥 User Roles & Workflows

### 🌾 **Farmer Workflow**

1. **Register/Login** as a Farmer
2. **Navigate to "List Crop"** to add new produce
3. **Fill in crop details**: Name, quantity, unit (kg/tons/bags), price, harvest date
4. **View "My Listings"** to see all listed crops
5. **Edit or delete** listings as needed
6. **Check "Active Orders"** to see buyer orders
7. **Track order status** through completion

### 🛒 **Buyer Workflow**

1. **Register/Login** as a Buyer
2. **Browse available crops** on the home screen
3. **Filter crops** by name or status
4. **View crop details** (quantity, price, harvest date)
5. **Place an order** by specifying quantity and delivery location
6. **Track orders** in "My Orders" screen
7. **View order history** and status updates

### 🚚 **Transporter Workflow**

1. **Register/Login** as a Transporter
2. **View "Available Loads"** for delivery requests
3. **Accept a delivery** to start a trip
4. **Navigate to "Active Trips"** to manage ongoing deliveries
5. **Update trip status** (picked up, in transit, delivered)
6. **Complete deliveries** and view trip history

---

## 📱 Screenshots

> **Note**: Add screenshots of your app here when creating your demo video

```
[Login Screen]  [Role Selection]  [Farmer Dashboard]
[Browse Crops]  [Place Order]     [Active Trips]
```

---

## 💻 Development

### **TypeScript Configuration**

The project uses strict TypeScript settings for type safety. Key configurations:

- **Typed Redux Hooks**: Use `useAppDispatch` and `useAppSelector` instead of raw Redux hooks
- **Type Definitions**: All types are defined in `src/types/index.ts`
- **Strict Mode**: Enabled for better type checking

### **Redux Store Pattern**

```typescript
// ✅ Correct: Use typed hooks
import { useAppDispatch, useAppSelector } from "../../store";

const dispatch = useAppDispatch();
const { crops } = useAppSelector((state) => state.crops);

// ❌ Incorrect: Don't use raw Redux hooks
import { useDispatch, useSelector } from "react-redux";
```

### **Available Scripts**

| Command            | Description                       |
| ------------------ | --------------------------------- |
| `npm start`        | Start Expo development server     |
| `npm run android`  | Run on Android device/emulator    |
| `npm run ios`      | Run on iOS simulator (macOS only) |
| `npm run web`      | Run on web browser                |
| `npx tsc --noEmit` | Check TypeScript errors           |

### **Code Style**

- **Components**: Functional components with TypeScript
- **State Management**: Redux Toolkit with async thunks
- **Styling**: StyleSheet API with theme context
- **Navigation**: Type-safe navigation with React Navigation

---

## 🔧 Troubleshooting

### **Common Issues**

#### **1. Metro Bundler Issues**

```bash
# Clear cache and restart
npx expo start -c
```

#### **2. Module Not Found Errors**

```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

#### **3. TypeScript Errors**

```bash
# Check for errors
npx tsc --noEmit

# Common fixes:
# - Use useAppDispatch instead of useDispatch
# - Use useAppSelector instead of useSelector
# - Check type definitions in src/types/index.ts
```

#### **4. Environment Variables Not Loading**

- Ensure `.env` file exists in the root directory
- Restart the Expo development server after changing `.env`
- For physical devices, use your computer's local IP address instead of `localhost`

#### **5. Android Build Issues**

```bash
# Clean Android build
cd android
./gradlew clean
cd ..
npm run android
```

#### **6. iOS Build Issues** (macOS only)

```bash
# Clean iOS build
cd ios
pod install
cd ..
npm run ios
```

---

## 🎥 Demo Video Tips

When creating your demo video, consider showcasing:

1. **App Launch & Authentication**

   - Show the landing/role selection screen
   - Demonstrate registration and login

2. **Farmer Features**

   - List a new crop
   - Edit an existing listing
   - View active orders

3. **Buyer Features**

   - Browse available crops
   - Place an order
   - Track order status

4. **Transporter Features**

   - View available loads
   - Accept a delivery
   - Update trip status

5. **UI/UX Highlights**

   - Smooth navigation
   - Responsive design
   - Theme consistency
   - Error handling

6. **Technical Highlights**
   - TypeScript type safety
   - Redux state management
   - Role-based access control
   - Real-time updates

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Michael George**

- GitHub: MJLEGION (https://github.com/MJLEGION/agri-logistics-platform.git)
- Email: m.george@alustudent.com

---

## 🙏 Acknowledgments

- Built with [Expo](https://expo.dev/)
- UI components from [React Native Paper](https://reactnativepaper.com/)
- Icons from [Expo Vector Icons](https://icons.expo.fyi/)
- Inspired by the need to digitize Rwanda's agricultural supply chain

---

<div align="center">

**Made with ❤️ for Rwanda's Agricultural Community**

⭐ Star this repo if you find it helpful!

</div>
