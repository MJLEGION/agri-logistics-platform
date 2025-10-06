# Agri-Logistics Platform 🇷🇼

A mobile-first platform built with React Native and Expo to connect farmers, transporters, and buyers in Rwanda. The primary goal of this application is to digitize the agricultural supply chain and reduce post-harvest losses by providing a seamless, efficient, and transparent logistics solution.

## ✨ Key Features (Planned)

* **Role-Based Authentication:** Secure login and registration for three distinct user roles: **Farmers**, **Transporters**, and **Buyers**.
* **Produce Marketplace:** Farmers can list their available produce with details like quantity, quality, and asking price.
* **Bidding System:** Buyers can browse listings and place bids on produce.
* **Logistics & Order Management:** Once a bid is accepted, transporters can manage delivery requests.
* **Real-Time Tracking:** Farmers and buyers can track the location of their goods in real-time using integrated maps.
* **User Profiles:** Manage user information and view order history.

## 🛠️ Tech Stack

This project is built with a modern, scalable, and type-safe technology stack.

* **Framework:** [React Native](https://reactnative.dev/) with [Expo](https://expo.dev/)
* **Language:** [TypeScript](https://www.typescriptlang.org/)
* **State Management:** [Redux Toolkit](https://redux-toolkit.js.org/) with [Redux Persist](https://github.com/rt2zz/redux-persist)
* **Navigation:** [React Navigation](https://reactnavigation.org/) (Native Stack & Bottom Tabs)
* **UI Components:** [React Native Paper](https://reactnativepaper.com/) (Material Design)
* **Forms:** [Formik](https://formik.org/) for form state and [Yup](https://github.com/jquense/yup) for validation
* **API Client:** [Axios](https://axios-http.com/)
* **Mapping:** [React Native Maps](https://github.com/react-native-maps/react-native-maps) & [Expo Location](https://docs.expo.dev/versions/latest/sdk/location/)

## 🚀 Getting Started

Follow these instructions to get the development environment set up and running on your local machine.

### Prerequisites

* Node.js (LTS version recommended)
* npm or Yarn
* Expo Go app on your iOS or Android device, or an Android/iOS simulator.

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/your-username/agri-logistics-platform.git](https://github.com/your-username/agri-logistics-platform.git)
    cd agri-logistics-platform
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    * Create a `.env` file in the root of the project by making a copy of the example file.
        ```bash
        cp .env.example .env
        ```
    * Open the newly created `.env` file and add your specific keys:
        ```env
        # Backend API URL (once the backend is ready)
        API_BASE_URL=http://localhost:3000/api

        # Your Google Maps API Key for map functionalities
        GOOGLE_MAPS_API_KEY=your_google_maps_key
        ```

### Available Scripts

* **Start the development server:**
    ```bash
    npm start
    ```
    This will start the Metro bundler and show you a QR code.

* **Run on Android:**
    ```bash
    npm run android
    ```
    This will attempt to launch the app on a connected Android device or emulator.

* **Run on iOS:**
    ```bash
    npm run ios
    ```
    This will attempt to launch the app on an iOS simulator (requires macOS).

* **Run on Web (for testing):**
    ```bash
    npm run web
    ```

## 📂 Project Structure

The project follows a feature-oriented and modular structure to ensure scalability and maintainability.

```
src/
├── api/          # API call functions and Axios configuration
├── assets/       # Fonts, images, and other static assets
├── components/   # Reusable UI components (e.g., Button, Card)
├── constants/    # App-wide constants (e.g., colors, theme)
├── contexts/     # React Context providers
├── hooks/        # Custom React hooks
├── navigation/   # React Navigation stacks and navigators
├── screens/      # Individual screen components
├── store/        # Redux Toolkit store and slices
└── types/        # Global TypeScript types and interfaces
```

