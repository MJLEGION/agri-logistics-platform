# 🎥 Demo Video Guide

This guide will help you create an impressive demo video for your Agri-Logistics Platform project.

---

## 📋 Pre-Demo Checklist

### ✅ **Before Recording**

- [ ] Ensure the app is running smoothly without errors
- [ ] Clear any test data or create clean, realistic sample data
- [ ] Test all features you plan to demonstrate
- [ ] Prepare a script or outline of what you'll show
- [ ] Close unnecessary applications to avoid notifications
- [ ] Set your device to "Do Not Disturb" mode
- [ ] Ensure good lighting if recording your screen
- [ ] Test your microphone audio quality

### ✅ **Sample Data Preparation**

Create realistic test data:

- **Farmers**: 2-3 users with different crops listed
- **Buyers**: 1-2 users with some orders placed
- **Transporters**: 1-2 users with active trips
- **Crops**: Variety of produce (maize, beans, rice, potatoes, etc.)
- **Orders**: Mix of statuses (pending, accepted, in-progress, completed)

---

## 🎬 Demo Video Structure

### **Recommended Duration**: 5-8 minutes

### **1. Introduction (30-45 seconds)**

**What to say:**

```
"Hello! Today I'm presenting the Agri-Logistics Platform, a mobile application
designed to digitize Rwanda's agricultural supply chain. This platform connects
farmers, buyers, and transporters, reducing post-harvest losses and improving
market access for smallholder farmers."
```

**What to show:**

- App icon/splash screen
- Landing page or role selection screen

---

### **2. Technical Overview (45-60 seconds)**

**What to say:**

```
"This is a full-stack mobile application built with React Native and Expo,
using TypeScript for type safety. The frontend uses Redux Toolkit for state
management, React Navigation for routing, and React Native Paper for the UI
components. The app features role-based authentication and navigation for
three user types: Farmers, Buyers, and Transporters."
```

**What to show:**

- Quick code walkthrough (optional):
  - Show `src/` folder structure
  - Highlight `store/` (Redux setup)
  - Show `navigation/` (role-based navigation)
  - Display `package.json` (tech stack)

---

### **3. Farmer Features Demo (90-120 seconds)**

**What to say:**

```
"Let me demonstrate the farmer workflow. Farmers can register and log in
to the platform..."
```

**What to show:**

#### **A. Authentication**

- Show login screen
- Enter farmer credentials
- Navigate to farmer dashboard

#### **B. List a Crop**

- Click "List Crop" or "Add Crop"
- Fill in the form:
  - Crop name: "Maize"
  - Quantity: "500"
  - Unit: "kg"
  - Price per unit: "800" (RWF)
  - Harvest date: Select a date
- Submit the form
- Show success message

#### **C. View Listings**

- Navigate to "My Listings"
- Show the newly created crop
- Demonstrate edit functionality (optional)

#### **D. Active Orders**

- Navigate to "Active Orders"
- Show orders placed by buyers
- Highlight order details (buyer info, quantity, status)

**What to say:**

```
"Farmers can easily list their produce, manage their listings, and track
orders from buyers in real-time."
```

---

### **4. Buyer Features Demo (90-120 seconds)**

**What to say:**

```
"Now let's look at the buyer experience. Buyers can browse available crops
and place orders..."
```

**What to show:**

#### **A. Switch to Buyer Role**

- Log out or use role switcher
- Log in as a buyer

#### **B. Browse Crops**

- Show buyer home screen/dashboard
- Navigate to "Browse Crops"
- Demonstrate filtering (if implemented)
- Show crop cards with details

#### **C. Place an Order**

- Select a crop
- Click "Place Order" or "Order Now"
- Fill in order details:
  - Quantity
  - Delivery location
  - Any additional notes
- Submit the order
- Show success confirmation

#### **D. Track Orders**

- Navigate to "My Orders"
- Show order list with different statuses
- Click on an order to view details
- Highlight status tracking (pending → accepted → in-progress → completed)

**What to say:**

```
"Buyers have a seamless experience browsing crops, placing orders, and
tracking their deliveries through the entire process."
```

---

### **5. Transporter Features Demo (60-90 seconds)**

**What to say:**

```
"Finally, let's see how transporters manage deliveries..."
```

**What to show:**

#### **A. Switch to Transporter Role**

- Log out or use role switcher
- Log in as a transporter

#### **B. Available Loads**

- Show transporter dashboard
- Navigate to "Available Loads"
- Display delivery requests
- Show load details (pickup location, delivery location, crop details)

#### **C. Accept a Delivery**

- Select a load
- Click "Accept" or "Take Trip"
- Show confirmation

#### **D. Active Trips**

- Navigate to "Active Trips"
- Show ongoing deliveries
- Demonstrate status update (if implemented):
  - Mark as "Picked Up"
  - Mark as "In Transit"
  - Mark as "Delivered"

**What to say:**

```
"Transporters can view available delivery requests, accept trips, and
update delivery status in real-time, ensuring transparency for all parties."
```

---

### **6. UI/UX Highlights (30-45 seconds)**

**What to show:**

- Smooth navigation between screens
- Consistent design across all roles
- Responsive layouts
- Material Design components
- Theme colors (green/agricultural theme)
- Error handling (show a validation error)
- Loading states (if visible)

**What to say:**

```
"The app features a vibrant agricultural theme with consistent Material Design
components, smooth navigation, and responsive layouts optimized for mobile devices."
```

---

### **7. Technical Highlights (30-45 seconds)**

**What to show (optional code snippets):**

#### **A. TypeScript Type Safety**

```typescript
// Show src/types/index.ts
export interface Crop {
  _id?: string;
  id?: string;
  name: string;
  quantity: number;
  unit: "kg" | "tons" | "bags";
  // ...
}
```

#### **B. Redux Typed Hooks**

```typescript
// Show src/store/index.ts
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

#### **C. Redux Slice Example**

```typescript
// Show src/store/slices/cropsSlice.ts
export const fetchCrops = createAsyncThunk("crops/fetchCrops", async () => {
  const response = await axios.get("/crops");
  return response.data;
});
```

**What to say:**

```
"The codebase uses TypeScript for type safety, Redux Toolkit for state
management with typed hooks, and follows best practices for scalable
React Native development."
```

---

### **8. Conclusion (30-45 seconds)**

**What to say:**

```
"In summary, the Agri-Logistics Platform provides a comprehensive solution
for digitizing Rwanda's agricultural supply chain. It features role-based
access for farmers, buyers, and transporters, with intuitive interfaces
for listing crops, placing orders, and managing deliveries. The app is
built with modern technologies including React Native, TypeScript, and
Redux Toolkit, ensuring type safety, scalability, and maintainability.

Thank you for watching!"
```

**What to show:**

- Return to home screen or role selection
- Show app icon or closing screen

---

## 🎙️ Recording Tips

### **Screen Recording Tools**

#### **For Mobile Device:**

- **iOS**: Built-in screen recording (Control Center)
- **Android**: Built-in screen recording (Quick Settings)
- **Computer**: Use emulator/simulator with screen recording software

#### **For Computer Screen Recording:**

- **Windows**:
  - OBS Studio (free)
  - Xbox Game Bar (built-in, Win+G)
  - Camtasia (paid)
- **macOS**:
  - QuickTime Player (built-in)
  - OBS Studio (free)
  - ScreenFlow (paid)
- **Cross-platform**:
  - OBS Studio
  - Loom

### **Audio Recording**

- Use a good quality microphone (or headset mic)
- Record in a quiet environment
- Speak clearly and at a moderate pace
- Consider recording audio separately and syncing later for better quality

### **Video Quality Settings**

- **Resolution**: 1080p (1920x1080) minimum
- **Frame Rate**: 30 fps or 60 fps
- **Format**: MP4 (H.264 codec)
- **Orientation**: Portrait for mobile, Landscape for code walkthrough

---

## 📝 Script Template

Use this template to prepare your narration:

```
[INTRODUCTION]
"Hello, I'm [Your Name], and today I'm presenting..."

[TECHNICAL OVERVIEW]
"This application is built using..."

[FARMER DEMO]
"Let me start by demonstrating the farmer workflow..."
- "First, the farmer logs in..."
- "They can list a new crop by..."
- "Here we can see all their listings..."
- "And track active orders..."

[BUYER DEMO]
"Now, from the buyer's perspective..."
- "Buyers can browse available crops..."
- "Placing an order is simple..."
- "They can track their orders..."

[TRANSPORTER DEMO]
"Finally, transporters can..."
- "View available delivery requests..."
- "Accept trips..."
- "Update delivery status..."

[UI/UX HIGHLIGHTS]
"The app features..."

[TECHNICAL HIGHLIGHTS]
"From a technical standpoint..."

[CONCLUSION]
"In conclusion, this platform..."
"Thank you for watching!"
```

---

## ✨ Pro Tips

### **Do's:**

- ✅ Practice your demo 2-3 times before recording
- ✅ Speak enthusiastically and confidently
- ✅ Highlight unique features and technical achievements
- ✅ Show real-world use cases
- ✅ Demonstrate error handling
- ✅ Keep transitions smooth
- ✅ Use a consistent pace (not too fast, not too slow)
- ✅ Smile while talking (it shows in your voice!)

### **Don'ts:**

- ❌ Don't rush through features
- ❌ Don't show bugs or errors (unless demonstrating error handling)
- ❌ Don't use filler words excessively ("um", "uh", "like")
- ❌ Don't have background noise or interruptions
- ❌ Don't make the video too long (keep it under 10 minutes)
- ❌ Don't forget to test everything before recording

---

## 🎨 Visual Enhancements (Optional)

### **Add Text Overlays:**

- Feature names as you demonstrate them
- Technology stack labels
- Key statistics (e.g., "3 User Roles", "Type-Safe with TypeScript")

### **Add Transitions:**

- Smooth fades between sections
- Highlight important UI elements with circles/arrows

### **Background Music:**

- Use soft, non-distracting background music (royalty-free)
- Keep volume low (10-20% of voice volume)
- Sources: YouTube Audio Library, Epidemic Sound, Artlist

---

## 📤 Export & Submission

### **Final Video Checklist:**

- [ ] Video is 5-8 minutes long
- [ ] Audio is clear and audible
- [ ] All features are demonstrated
- [ ] No personal information is visible
- [ ] Video is in MP4 format
- [ ] Resolution is at least 1080p
- [ ] File size is reasonable (under 500MB if possible)

### **Compression (if needed):**

```bash
# Using ffmpeg (if file is too large)
ffmpeg -i input.mp4 -vcodec h264 -acodec aac -b:v 2M output.mp4
```

### **Upload Platforms:**

- YouTube (Unlisted or Public)
- Google Drive
- Dropbox
- Vimeo

---

## 🌟 Bonus: Create a Thumbnail

Create an attractive thumbnail for your video:

**Elements to include:**

- App icon or logo
- Screenshot of the app
- Text: "Agri-Logistics Platform"
- Subtitle: "React Native | TypeScript | Redux"
- Your name

**Tools:**

- Canva (free templates)
- Figma
- Adobe Photoshop
- PowerPoint/Keynote

---

## 📞 Need Help?

If you encounter issues while recording:

1. **Technical Issues**: Check the Troubleshooting section in README.md
2. **Recording Issues**: Test your recording software with a short clip first
3. **Content Questions**: Review the Features section in README.md

---

<div align="center">

**Good luck with your demo! 🎬🌾**

_Remember: Confidence and preparation are key to a great presentation!_

</div>
