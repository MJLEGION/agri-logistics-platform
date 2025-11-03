# Live Geocoding - Quick Start (2 min setup)

## 🚀 What's Changed?

Your app now uses **real-time geocoding APIs** instead of hardcoded coordinates. Addresses like "KK 104 St" are automatically converted to accurate GPS coordinates.

## 📋 3-Step Setup

### Step 1: [OPTIONAL] Get Google Maps API Key (5 min)

**Skip if you want free OpenStreetMap mode**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create/select project
3. Enable: **Geocoding API**
4. Create API Key (Credentials)
5. Copy the key

### Step 2: Add to `.env` File

**Option A: With Google Maps** (Recommended for accuracy)

```
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here
```

**Option B: Without Google Maps** (Free, automatic OpenStreetMap)

```
# Leave blank or just use default .env
```

### Step 3: Test in App

1. Open cargo listing form
2. Enter custom destination: **"KK 104 St, Kigali"**
3. Should see accurate distance (~11 km to KG 70 St)
4. ETA and traffic should display

## 🧪 Testing

### In Browser Console (F12)

Type:

```javascript
// Should see geocoding logs
// Example: ✅ Google Maps API: "KK 104 St" → (-1.9486, 30.0872)
```

### What You'll See

**Console Output:**

```
🎯 Starting distance/ETA calculation for: KK 104 St, Kigali
📍 Static: Exact match for "KK 104 St, Kigali"
📏 Distance calculated: 11.0 km
🚦 Traffic factor: 1.6 (Peak hour +60%)
💰 Estimated shipping cost: 17,600 RWF
⏱️ Estimated time: 23 minutes
```

## 🔄 How It Works

```
Address entered
    ↓
Try static mappings (instant)
    ↓
Try Google Maps API (if key configured)
    ↓
Try OpenStreetMap (free fallback)
    ↓
Default to Kigali center
```

## ✅ Features

| Feature        | Before                  | After                                |
| -------------- | ----------------------- | ------------------------------------ |
| Address format | Only zone codes (kk226) | Any address (streets, cities, zones) |
| Accuracy       | Approximate             | Google Maps / OpenStreetMap accuracy |
| API calls      | None                    | Optional (with fallback)             |
| Cost           | Free                    | Free (or optional Google pricing)    |
| Speed          | Instant                 | Cache + fallback layers              |
| Offline        | ✅                      | ✅ For known addresses               |

## 🎯 Supported Addresses Now

✅ Kigali zone codes: `"kk226"`, `"kk104 st"`, `"kk229a"`  
✅ Street names: `"KK 104 St, Kigali"`, `"KG 70 St, Kigali"`  
✅ Neighborhoods: `"Nyarutarama"`, `"Remera"`  
✅ Cities: `"Kigali"`, `"Butare"`, `"Gisenyi"`  
✅ Partial addresses: Automatically geocoded via API

## 📊 Performance

- **Static mapping:** <5ms (instant)
- **Cache hit:** ~2-3ms
- **First API call:** ~300-500ms
- **Fallback layers:** Automatic & transparent

## ⚙️ Configuration

### Check if API Key is Set

```bash
# In your .env file
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here
```

If missing → Still works! Uses free OpenStreetMap

### Test Different Scenarios

**Scenario 1: Known Zone Code (fastest)**

```
Input: "kk226"
Result: Instant (~1ms) from static mapping
```

**Scenario 2: Custom Address (API)**

```
Input: "123 Main St, Kigali"
Result: ~400ms via Google Maps or OpenStreetMap
```

**Scenario 3: Invalid Address**

```
Input: "XYZ Invalid"
Result: Default Kigali center (safe fallback)
```

## 🔍 Debugging

### Issue: Address not geocoding

**Check:**

1. Open F12 console
2. Look for red error messages
3. Try a known address first (kk226)
4. Check internet connection

### Issue: API Key not working

**Fix:**

1. Verify key in .env
2. Enable Geocoding API in Google Cloud Console
3. Check API key restrictions (should allow HTTP from your domain)

### Issue: Slow response

**Solution:**

1. Repeated addresses use cache (instant)
2. First call to new address takes ~400ms
3. This is normal and cached for future use

## 📚 Full Documentation

For detailed info, see: `LIVE_GEOCODING_SETUP.md`

## 🎉 You're Done!

App now uses **live geocoding with smart fallback**. Your addresses are accurate, and everything degrades gracefully if APIs fail.

**Test it:**

1. Enter "KK 104 St, Kigali" as origin
2. Enter "KG 70 St, Kigali" as destination
3. Should see ~11 km distance ✅
4. ETA and traffic display ✅

---

**Questions?** Check console logs (F12) for detailed status on each geocoding step.
