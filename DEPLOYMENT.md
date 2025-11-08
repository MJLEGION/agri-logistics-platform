# 🚀 Deployment Guide - Agri-Logistics Platform

Complete step-by-step guide to deploy your full-stack application.

---

## 📋 Pre-Deployment Checklist

- [ ] Code is committed to GitHub
- [ ] All syntax errors fixed (TypeScript compiles)
- [ ] Environment variables documented
- [ ] Backend API exists and is ready
- [ ] MongoDB database accessible

---

## 🗄️ Step 1: Set Up MongoDB Atlas (Database)

### 1.1 Create Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Sign up for free account
3. Choose **FREE tier** (M0 Sandbox - 512MB)

### 1.2 Create Cluster
1. Click "Build a Database"
2. Choose **FREE** shared cluster
3. Select region closest to your users (e.g., Europe for Rwanda)
4. Click "Create Cluster"

### 1.3 Configure Access
1. **Database Access**:
   - Go to "Database Access" in left sidebar
   - Click "Add New Database User"
   - Create username/password (save these!)
   - Set permissions to "Read and write to any database"

2. **Network Access**:
   - Go to "Network Access"
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Confirm

### 1.4 Get Connection String
1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy connection string (looks like):
   ```
   mongodb+srv://username:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
4. Replace `<password>` with your actual password
5. Add database name: `...mongodb.net/agri-logistics?retryWrites...`

---

## 🖥️ Step 2: Deploy Backend to Render

### 2.1 Create Render Account
1. Go to [Render.com](https://render.com)
2. Sign up with GitHub

### 2.2 Create Web Service
1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. **Configure**:
   - **Name**: `agri-logistics-api`
   - **Region**: Choose closest to users
   - **Branch**: `main`
   - **Root Directory**: Leave empty (or path to backend if separate)
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start` or `node server.js`
   - **Plan**: Free

### 2.3 Set Environment Variables
Click "Advanced" → Add environment variables:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=<your-mongodb-atlas-connection-string>
JWT_SECRET=<generate-random-secret>
JWT_REFRESH_SECRET=<generate-random-secret>
FLUTTERWAVE_PUBLIC_KEY=<your-key>
FLUTTERWAVE_SECRET_KEY=<your-secret>
ALLOWED_ORIGINS=https://your-frontend.vercel.app
```

**To generate secrets**:
```bash
# Run in terminal
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 2.4 Deploy
1. Click "Create Web Service"
2. Wait 3-5 minutes for deployment
3. Note your backend URL: `https://agri-logistics-api.onrender.com`

---

## 🌐 Step 3: Deploy Frontend to Vercel

### 3.1 Update Environment Variables
Edit your `.env` file:

```env
EXPO_PUBLIC_API_URL=https://agri-logistics-api.onrender.com/api
```

Commit changes:
```bash
git add .env
git commit -m "Update API URL for production"
git push
```

### 3.2 Build for Web
Test local build first:

```bash
# Build
npx expo export:web

# This creates a 'dist' folder with your web app
```

### 3.3 Deploy to Vercel

**Option A: Using Vercel CLI** (Recommended)
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? (your account)
# - Link to existing project? No
# - What's your project's name? agri-logistics
# - In which directory is your code located? ./
```

**Option B: Using Vercel Dashboard**
1. Go to [Vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click "New Project"
4. Import your repository
5. Configure:
   - **Framework Preset**: Other
   - **Build Command**: `expo export:web`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
6. Add environment variables:
   ```
   EXPO_PUBLIC_API_URL=https://agri-logistics-api.onrender.com/api
   ```
7. Click "Deploy"

### 3.4 Get Your URL
Your site will be live at: `https://agri-logistics.vercel.app`

---

## 🔧 Step 4: Configure CORS (Backend)

Update your backend CORS settings to allow your frontend domain.

If you have a `server.js` or backend entry file, add:

```javascript
const cors = require('cors');

app.use(cors({
  origin: [
    'https://agri-logistics.vercel.app',
    'http://localhost:8081', // For local development
    'http://localhost:19006'  // Expo web dev
  ],
  credentials: true
}));
```

Redeploy backend on Render (it auto-deploys on git push).

---

## ✅ Step 5: Test Your Deployment

1. **Test Backend**:
   ```bash
   curl https://agri-logistics-api.onrender.com/api/health
   ```

2. **Test Frontend**:
   - Visit `https://agri-logistics.vercel.app`
   - Try registering a user
   - Try logging in
   - Check browser console for errors

3. **Check Logs**:
   - **Render**: Dashboard → Your service → Logs
   - **Vercel**: Dashboard → Your project → Deployments → View logs

---

## 🎯 Step 6: Custom Domain (Optional)

### On Vercel:
1. Go to Project Settings → Domains
2. Add your custom domain (e.g., `agrilogistics.com`)
3. Update DNS records as instructed
4. SSL certificate auto-configured

### On Render:
1. Go to your service → Settings → Custom Domain
2. Add domain (e.g., `api.agrilogistics.com`)
3. Update DNS CNAME record

---

## 📱 Mobile App Deployment (Bonus)

### Android APK:
```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure
eas build:configure

# Build APK
eas build --platform android --profile preview

# Download from Expo dashboard
```

### iOS (Requires Mac + Apple Developer Account):
```bash
eas build --platform ios --profile preview
```

---

## 🐛 Troubleshooting

### Backend Won't Start
- Check Render logs for errors
- Verify MongoDB connection string is correct
- Ensure all environment variables are set

### Frontend Can't Connect to Backend
- Check CORS configuration
- Verify API URL in frontend `.env`
- Check browser console for errors
- Ensure backend is running (Render free tier sleeps after inactivity)

### "Network Error" in App
- Backend might be sleeping (Render free tier)
- Visit backend URL to wake it up
- Consider upgrading to paid tier ($7/month) for always-on

### Build Fails
- Check build logs in Vercel/Render
- Ensure all dependencies in package.json
- Try building locally first: `npx expo export:web`

---

## 💰 Cost Summary

| Service | Free Tier | Paid Tier |
|---------|-----------|-----------|
| **MongoDB Atlas** | 512MB storage | $9/month (10GB) |
| **Render** | 750hrs/month (sleeps) | $7/month (always on) |
| **Vercel** | 100GB bandwidth | $20/month (Pro) |
| **Total FREE** | $0/month | - |
| **Total PAID** | - | ~$16-36/month |

**Recommendation**: Start free, upgrade backend to $7/month when traffic grows.

---

## 🔐 Security Checklist

- [ ] `.env` file is in `.gitignore`
- [ ] Sensitive keys NOT using `EXPO_PUBLIC_` prefix
- [ ] MongoDB user has limited permissions
- [ ] MongoDB network access restricted (or IP whitelisted)
- [ ] CORS properly configured
- [ ] JWT secrets are strong and random
- [ ] HTTPS enabled (automatic on Vercel/Render)

---

## 🚀 Next Steps After Deployment

1. **Set up monitoring**: Use Render/Vercel analytics
2. **Set up error tracking**: Consider Sentry
3. **Set up backups**: MongoDB Atlas auto-backups
4. **Add domain**: Get custom domain for professional look
5. **SEO optimization**: Add meta tags, sitemap
6. **Performance**: Monitor and optimize load times

---

## 📞 Support

- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **Expo Docs**: https://docs.expo.dev/distribution/publishing-websites/
- **MongoDB Atlas Docs**: https://docs.atlas.mongodb.com/

---

**Need help?** Open an issue on GitHub or check the troubleshooting section above.

Good luck with your deployment! 🌾🚚
