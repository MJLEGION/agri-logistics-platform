# 🚀 Vercel Deployment - Fixed Commands

## ⚠️ ERROR FIX

Your Expo project uses **Metro bundler** (not Webpack), so the commands are different.

---

## ✅ CORRECT DEPLOYMENT STEPS

### **Step 1: Build for Web**
```bash
# Use this command (NOT expo export:web)
npx expo export --platform web

# Output folder will be: dist/
```

### **Step 2: Create vercel.json Configuration**

Create `vercel.json` in your project root:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/static/(.*)",
      "dest": "/static/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

### **Step 3: Update package.json**

Add this script to your `package.json`:

```json
{
  "scripts": {
    "build": "expo export --platform web"
  }
}
```

### **Step 4: Deploy to Vercel**

**Option A: Via Dashboard (Easiest)**
1. Go to https://vercel.com
2. Click "Add New" → "Project"
3. Import your GitHub repo
4. Vercel will auto-detect and deploy!

**Option B: Via CLI**
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy from project root (NOT from dist folder)
vercel --prod
```

---

## 🔧 ALTERNATIVE: Manual Deploy

If automatic deployment doesn't work:

### **Step 1: Build Locally**
```bash
npx expo export --platform web
```

### **Step 2: Deploy dist folder**
```bash
cd dist
vercel --prod
```

---

## 📋 COMPLETE WORKFLOW

```bash
# 1. Update package.json
# Add: "build": "expo export --platform web"

# 2. Create vercel.json (content above)

# 3. Test build locally
npx expo export --platform web
npx serve dist

# 4. Push to GitHub
git add .
git commit -m "Add Vercel configuration"
git push

# 5. Deploy via Vercel Dashboard
# Import repo → Auto-deploy!
```

---

## 🎯 VERCEL DASHBOARD SETTINGS

When connecting via dashboard:

**Build Settings:**
- **Framework Preset:** Other
- **Build Command:** `npm run build` or `expo export --platform web`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

**Environment Variables:**
Add these in Vercel dashboard under "Settings" → "Environment Variables":
```
EXPO_PUBLIC_API_URL=https://your-backend.com
```

---

## ✅ WHAT WORKED FOR YOU

Based on your error, here's what to do:

1. **Create vercel.json** (configuration above)
2. **Update package.json** to add build script
3. **Push to GitHub**
4. **Connect repo in Vercel dashboard**
5. **Let Vercel auto-deploy!**

---

## 🐛 IF YOU STILL GET ERRORS

Try this alternative build command in Vercel:

**Build Command:**
```bash
npx expo export --platform web --output-dir dist
```

Or use this in `vercel.json`:
```json
{
  "buildCommand": "npx expo export --platform web",
  "outputDirectory": "dist"
}
```

---

## 🚀 FASTEST FIX NOW

```bash
# 1. Create vercel.json with content above
# 2. Push to GitHub
# 3. Go to vercel.com and import your repo
# 4. Deploy!
```

That's it! 🎉
