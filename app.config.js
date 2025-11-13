export default {
  expo: {
    name: "Agri-Logistics Platform",
    slug: "agri-logistics-platform",
    version: "2.1.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      }
    },
    web: {
      favicon: "./assets/favicon.ico",
      bundler: "metro"
    },
    extra: {
      apiUrl: process.env.EXPO_PUBLIC_API_URL || "https://agri-logistics-backend.vercel.app/api",
      eas: {
        projectId: "your-project-id"
      }
    },
    plugins: [
      "expo-router"
    ]
  }
};
