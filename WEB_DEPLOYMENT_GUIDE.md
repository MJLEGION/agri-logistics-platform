# 🌐 Agri-Logistics Platform - Web Deployment Guide
**Platform:** React Native Web (Expo)
**Status:** Ready for Production
**Last Updated:** 2025-01-11

---

## 🚀 QUICK DEPLOYMENT (Choose One)

### **Option 1: Vercel (Easiest - 10 minutes)**
### **Option 2: Netlify (10 minutes)**
### **Option 3: Your Own Server (30 minutes)**

---

## ⚡ OPTION 1: VERCEL (RECOMMENDED)

### **Why Vercel?**
- ✅ Free tier available
- ✅ Automatic HTTPS
- ✅ Easy domain connection
- ✅ Automatic deployments from Git
- ✅ Edge network (fast globally)

### **Step-by-Step:**

#### **1. Install Vercel CLI**
```bash
npm install -g vercel
```

#### **2. Login to Vercel**
```bash
vercel login
```

#### **3. Build Your App**
```bash
# Build the web bundle
npx expo export:web

# This creates a 'web-build' folder
```

#### **4. Deploy to Vercel**
```bash
# Deploy from the web-build folder
cd web-build
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? agri-logistics-platform
# - Directory? ./
# - Override settings? No
```

#### **5. Connect Your Domain**

**Option A: Via Vercel Dashboard**
1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to "Settings" → "Domains"
4. Add your domain (e.g., `yourdomain.com`)
5. Follow DNS configuration instructions

**Option B: Via CLI**
```bash
vercel domains add yourdomain.com
```

#### **6. Configure DNS (At Your Domain Registrar)**

Add these records at your domain provider:
```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

**Done! Your app will be live at https://yourdomain.com** 🎉

---

## ⚡ OPTION 2: NETLIFY

### **Step-by-Step:**

#### **1. Build Your App**
```bash
npx expo export:web
```

#### **2. Install Netlify CLI**
```bash
npm install -g netlify-cli
```

#### **3. Login & Deploy**
```bash
netlify login
netlify deploy --dir=web-build --prod
```

#### **4. Connect Your Domain**
1. Go to https://app.netlify.com
2. Select your site
3. Go to "Domain settings"
4. Click "Add custom domain"
5. Enter your domain
6. Follow DNS configuration instructions

#### **5. Configure DNS**
Add at your domain registrar:
```
Type: A
Name: @
Value: 75.2.60.5

Type: CNAME
Name: www
Value: your-site-name.netlify.app
```

---

## ⚡ OPTION 3: YOUR OWN SERVER (VPS/Cloud)

### **Prerequisites:**
- VPS/Cloud server (DigitalOcean, AWS, Linode, etc.)
- Nginx or Apache installed
- SSH access

### **Step-by-Step:**

#### **1. Build Your App**
```bash
npx expo export:web
```

#### **2. Upload to Server**
```bash
# Using SCP
scp -r web-build/* user@your-server-ip:/var/www/html/

# Or using SFTP, FileZilla, etc.
```

#### **3. Configure Nginx**

Create config file: `/etc/nginx/sites-available/agrilogistics`
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    root /var/www/html;
    index index.html;

    # Enable gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### **4. Enable Site & Restart Nginx**
```bash
sudo ln -s /etc/nginx/sites-available/agrilogistics /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### **5. Configure SSL with Let's Encrypt**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

#### **6. Point Your Domain**
At your domain registrar, add:
```
Type: A
Name: @
Value: YOUR-SERVER-IP

Type: A
Name: www
Value: YOUR-SERVER-IP
```

---

## 📋 PRE-DEPLOYMENT CHECKLIST

### **1. Update Backend API URL**

**File:** `src/services/api.ts`
```typescript
// Change to your production backend
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://api.yourdomain.com';
```

### **2. Create Environment Variables**

Create `.env` file:
```env
REACT_APP_API_URL=https://api.yourdomain.com
REACT_APP_FLUTTERWAVE_PUBLIC_KEY=FLWPUBK-your-production-key
```

**For Vercel:** Add in dashboard under "Settings" → "Environment Variables"
**For Netlify:** Add in dashboard under "Site settings" → "Environment variables"

### **3. Update app.json**
```json
{
  "expo": {
    "name": "Agri-Logistics Platform",
    "web": {
      "favicon": "./assets/favicon.png",
      "bundler": "metro"
    }
  }
}
```

### **4. Test Build Locally**
```bash
# Build
npx expo export:web

# Serve locally to test
npx serve web-build

# Visit http://localhost:3000
```

---

## 🔧 BUILD COMMANDS

### **Development Server**
```bash
npm run web
# or
npx expo start --web
```

### **Production Build**
```bash
# Build for production
npx expo export:web

# Output folder: web-build/
```

### **Test Production Build Locally**
```bash
npx serve web-build
```

---

## 🎨 CUSTOM DOMAIN SETUP

### **Common Domain Registrars:**

#### **Namecheap**
1. Go to "Advanced DNS"
2. Add records as specified above
3. Save changes (propagation: 5-30 minutes)

#### **GoDaddy**
1. Go to "DNS Management"
2. Add records
3. Save (propagation: 1 hour)

#### **Cloudflare** (If using as DNS)
1. Add A/CNAME records
2. Set proxy status (orange cloud = proxied, gray = DNS only)
3. SSL/TLS mode: "Full" or "Full (strict)"

---

## 🚀 DEPLOYMENT WORKFLOW

### **Automatic Deployments (Recommended)**

#### **With Vercel:**
```bash
# 1. Push to GitHub
git push origin main

# 2. Connect repo in Vercel dashboard
# 3. Auto-deploy on every push!
```

#### **With Netlify:**
```bash
# 1. Connect GitHub repo in Netlify
# 2. Build command: npx expo export:web
# 3. Publish directory: web-build
# 4. Auto-deploy on push!
```

### **Manual Deployments**
```bash
# Build
npx expo export:web

# Deploy
vercel --prod
# or
netlify deploy --dir=web-build --prod
```

---

## ⚙️ ENVIRONMENT-SPECIFIC BUILDS

### **Development**
```bash
npm run web
```

### **Staging**
```bash
# Set staging env vars
export REACT_APP_API_URL=https://staging-api.yourdomain.com
npx expo export:web
vercel --prod --alias staging.yourdomain.com
```

### **Production**
```bash
# Set production env vars
export REACT_APP_API_URL=https://api.yourdomain.com
npx expo export:web
vercel --prod
```

---

## 🔒 SECURITY CHECKLIST

- [ ] HTTPS enabled (SSL certificate)
- [ ] Environment variables configured (not hardcoded)
- [ ] CORS configured on backend
- [ ] Remove debug console.logs ✅ (Already done)
- [ ] Enable security headers (CSP, HSTS, X-Frame-Options)
- [ ] Set up rate limiting on backend
- [ ] Configure CDN for assets (Vercel/Netlify handle this)

---

## 📊 PERFORMANCE OPTIMIZATION

### **Already Included:**
- ✅ Production build optimized
- ✅ Asset compression
- ✅ Code splitting
- ✅ Tree shaking

### **Additional (Optional):**

**Add to `app.json`:**
```json
{
  "expo": {
    "web": {
      "build": {
        "babel": {
          "include": ["@react-native"]
        }
      },
      "optimization": {
        "minify": true
      }
    }
  }
}
```

---

## 🐛 TROUBLESHOOTING

### **Build Fails**
```bash
# Clear cache
rm -rf web-build .expo node_modules
npm install
npx expo export:web
```

### **White Screen After Deploy**
- Check browser console for errors
- Verify API URL is correct
- Check CORS settings on backend
- Ensure all environment variables are set

### **Assets Not Loading**
- Check asset paths in build
- Verify CDN configuration
- Check CSP headers

### **Domain Not Working**
- DNS propagation can take up to 48 hours
- Use https://dnschecker.org to check propagation
- Clear browser cache
- Try incognito mode

---

## 📱 MOBILE RESPONSIVENESS

Your app is already mobile-responsive! Test on:
- Desktop (1920×1080)
- Tablet (768×1024)
- Mobile (375×667)

Chrome DevTools → Toggle device toolbar (Ctrl+Shift+M)

---

## 📈 MONITORING & ANALYTICS

### **Add Google Analytics**
```bash
npm install react-ga4
```

**File:** `App.tsx`
```typescript
import ReactGA from 'react-ga4';

useEffect(() => {
  ReactGA.initialize('G-YOUR-MEASUREMENT-ID');
  ReactGA.send('pageview');
}, []);
```

### **Add Sentry (Error Tracking)**
```bash
npm install @sentry/react
```

---

## 🎉 YOU'RE READY TO DEPLOY!

### **Fastest Path:**
```bash
# 1. Build
npx expo export:web

# 2. Deploy to Vercel
npm i -g vercel
cd web-build
vercel --prod

# 3. Add your domain in Vercel dashboard
```

### **Your App Includes:**
- ✅ Modern UI/UX
- ✅ Toast notifications
- ✅ Working pricing (425 RWF/km)
- ✅ Traffic calculations
- ✅ Payment integration
- ✅ Mobile responsive
- ✅ Production-ready code

---

## 📞 NEED HELP?

**Vercel:** https://vercel.com/docs
**Netlify:** https://docs.netlify.com
**Expo Web:** https://docs.expo.dev/workflow/web/

**Your domain is ready. Let's deploy!** 🚀🌐

---

**Next Command:**
```bash
npx expo export:web && vercel --prod
```
