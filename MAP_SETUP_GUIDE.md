# 🗺️ Maps Dependency Setup Guide

## ✅ What's Been Configured

Your app now has **platform-specific maps**:

- **Web**: Leaflet + OpenStreetMap (automatic, no API key needed)
- **Mobile (iOS/Android)**: React Native Maps with Google Maps

## 📦 Dependencies Installed

```
✓ leaflet           - Open-source mapping library for web
✓ react-native-maps - Maps for iOS and Android
✓ react-leaflet     - React bindings for Leaflet (just installed)
```

## 🔧 Setup Steps

### Step 1: Install All Dependencies

```bash
npm install
```

### Step 2: For Mobile Development (iOS/Android)

#### Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable **Maps SDK for Android** and **Maps SDK for iOS**
4. Create an API key (Unrestricted or restrict to Android/iOS apps)
5. Copy your API key

#### Update app.json

Replace `YOUR_GOOGLE_MAPS_API_KEY_HERE` in `app.json` under:

```json
"android": {
  "googleMapsApiKey": "YOUR_API_KEY_HERE"
}
```

#### For iOS (in Xcode):

- Add the API key to Info.plist
- Or use: `eas build --platform ios --profile preview`

### Step 3: For Web Development

✅ **No setup needed!** Leaflet uses OpenStreetMap which is free and doesn't require an API key.

- Just run: `npm start --web`
- Maps will work instantly

## 🚀 Testing the Maps

### On Web

```bash
npm start --web
```

- Navigate to Order Tracking or Trip Tracking
- You should see an interactive map with:
  - 🟢 Green pin: Pickup location
  - 🔴 Red pin: Delivery location
  - 🔵 Blue pin: Current location (if tracking)
  - Route line connecting the points

### On Mobile (Android)

```bash
npm start --android
```

### On Mobile (iOS)

```bash
npm start --ios
```

## 🗺️ Features Available

### Current Features

- ✅ Show pickup and delivery locations with different colored markers
- ✅ Draw route polyline between locations
- ✅ Auto-zoom to fit both markers in view
- ✅ Click markers to see location details
- ✅ Show current location when tracking active

### Future Enhancements

- Real-time location updates during delivery
- Navigation/turn-by-turn directions
- Traffic layer
- Terrain/satellite view toggle
- Multiple route options with distance/time estimates

## 📝 File Structure

```
src/components/
├── TripMapView.web.tsx    ← Web version (Leaflet)
├── TripMapView.native.tsx ← Mobile version (React Native Maps)
```

React automatically loads the correct file based on platform:

- `.web.tsx` → Web
- `.native.tsx` → iOS/Android

## 🆘 Troubleshooting

### Maps not showing on Web?

- Clear browser cache: `Ctrl+Shift+Delete`
- Check browser console for errors (F12)
- Verify Leaflet CSS is loaded
- Try different browser

### Maps not showing on Android?

- Verify Google Maps API key in app.json
- Check Google Maps API is enabled in Google Cloud Console
- Rebuild: `npm start --android` (clear cache if needed)
- Check AndroidManifest.xml has INTERNET permission (Expo handles this)

### Maps not showing on iOS?

- Verify build includes google-maps-ios-utils
- Check CocoaPods installation: `cd ios && pod install`
- Rebuild: `npm start --ios`

### Zooming issues?

- Check location coordinates are valid (latitude: -90 to 90, longitude: -180 to 180)
- Ensure both pickup and delivery have valid coordinates

## 🔑 API Key Best Practices

### DO:

- ✅ Use environment variables for API keys
- ✅ Restrict API key to specific apps (Android/iOS package names)
- ✅ Monitor API usage in Google Cloud Console
- ✅ Rotate keys periodically

### DON'T:

- ❌ Commit API keys to Git (add to .gitignore)
- ❌ Use same key in production and development
- ❌ Leave unrestricted keys in code

## 📚 Useful Documentation

- [Leaflet Documentation](https://leafletjs.com/reference.html)
- [React Leaflet](https://react-leaflet.js.org/)
- [React Native Maps](https://react-native-maps.js.org/)
- [Google Maps API Docs](https://developers.google.com/maps/documentation)

## ✨ Integration Points

Maps are currently used in:

1. **OrderTrackingScreen.tsx** - Track buyer's active orders
2. **TripTrackingScreen.tsx** - Transporter tracking trips
3. Any screen that imports TripMapView component

## 🎯 Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Get Google Maps API key (for mobile)
3. ✅ Update `app.json` with API key
4. ✅ Test on web: `npm start --web`
5. ✅ Test on mobile: `npm start --android` or `npm start --ios`
6. ✅ Enjoy your maps! 🗺️

---

**Status**: ✅ Ready to use!
**Platform Support**: Web ✅ | Android ✅ | iOS ✅
