# 🚀 Vercel Deployment Guide - Nayon Hardware

## Prerequisites

- GitHub account
- Vercel account (free tier is fine)
- MongoDB Atlas database
- Cloudinary account

## Step-by-Step Deployment

### 1. Prepare Your Repository

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Nayon Hardware Inventory System"

# Create repository on GitHub
# Then add remote and push
git remote add origin https://github.com/YOUR_USERNAME/nayon-hardware.git
git branch -M main
git push -u origin main
```

### 2. Deploy to Vercel

#### Option A: Using Vercel Dashboard (Recommended)

1. **Go to [Vercel](https://vercel.com)**
2. **Click "Add New Project"**
3. **Import your GitHub repository**
4. **Configure Project**:

   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: `./`
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)
   - Install Command: `npm install` (default)

5. **Add Environment Variables** (IMPORTANT!):

Click "Environment Variables" and add:

```env
# MongoDB
MONGODB_URI=mongodb+srv://nayon:Roy06539@teamdivider.7dbezvd.mongodb.net/nayon_shop?appName=TeamDivider

# JWT Secret (generate new one for production!)
JWT_SECRET=your-production-jwt-secret-here

# Cloudinary (Server-side)
CLOUDINARY_CLOUD_NAME=dfvkneves
CLOUDINARY_API_KEY=563595939332626
CLOUDINARY_API_SECRET=UpAzXDF6Rc0X787MxivNfCXZMeE

# Cloudinary (Client-side)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dfvkneves

# App Configuration
NEXT_PUBLIC_APP_NAME=নয়ন হার্ডওয়্যার
NEXT_PUBLIC_SHOP_NAME_BN=নয়ন হার্ডওয়্যার
NEXT_PUBLIC_SHOP_NAME_EN=Nayon Hardware
```

6. **Click "Deploy"**

#### Option B: Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? nayon-hardware
# - Directory? ./
# - Override settings? No

# Add environment variables
vercel env add MONGODB_URI
vercel env add JWT_SECRET
vercel env add CLOUDINARY_CLOUD_NAME
vercel env add CLOUDINARY_API_KEY
vercel env add CLOUDINARY_API_SECRET
vercel env add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
vercel env add NEXT_PUBLIC_APP_NAME
vercel env add NEXT_PUBLIC_SHOP_NAME_BN
vercel env add NEXT_PUBLIC_SHOP_NAME_EN

# Deploy to production
vercel --prod
```

### 3. Post-Deployment Setup

#### A. MongoDB Atlas Whitelist Vercel IPs

1. Go to MongoDB Atlas → Network Access
2. Add IP Address: **0.0.0.0/0** (allow all)
   - Or add specific Vercel IPs (recommended for production)

#### B. Cloudinary Upload Preset

Make sure your Cloudinary upload preset `nayonshop` is:

- Set to **Unsigned** mode
- Folder: `products`

#### C. Create First Admin

After deployment, run the setup script:

```bash
# SSH into your server or use Vercel CLI
vercel env pull .env.local
node scripts/create-admin.js
```

Or create admin via API:

```bash
curl -X POST https://your-app.vercel.app/api/admins \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin Name",
    "email": "admin@example.com",
    "password": "your-password"
  }'
```

### 4. Verify Deployment

Visit your deployed app:

```
https://your-app.vercel.app
```

Check:

- ✅ Public page loads
- ✅ Login page works
- ✅ Admin dashboard accessible
- ✅ Images upload to Cloudinary
- ✅ Database connection works

## Environment Variables Reference

### Required Variables:

| Variable                            | Description               | Example                              |
| ----------------------------------- | ------------------------- | ------------------------------------ |
| `MONGODB_URI`                       | MongoDB connection string | `mongodb+srv://...`                  |
| `JWT_SECRET`                        | Secret for JWT tokens     | Generate with `openssl rand -hex 64` |
| `CLOUDINARY_CLOUD_NAME`             | Cloudinary cloud name     | `dfvkneves`                          |
| `CLOUDINARY_API_KEY`                | Cloudinary API key        | `563595939332626`                    |
| `CLOUDINARY_API_SECRET`             | Cloudinary API secret     | `UpAzXDF6...`                        |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Public cloud name         | Same as above                        |

### Optional Variables:

| Variable                   | Description         | Default             |
| -------------------------- | ------------------- | ------------------- |
| `NEXT_PUBLIC_APP_NAME`     | App name            | `নয়ন হার্ডওয়্যার` |
| `NEXT_PUBLIC_SHOP_NAME_BN` | Shop name (Bengali) | `নয়ন হার্ডওয়্যার` |
| `NEXT_PUBLIC_SHOP_NAME_EN` | Shop name (English) | `Nayon Hardware`    |

## Vercel Configuration

The `vercel.json` file is already configured with:

- Build command
- Framework detection
- Region settings (Singapore - closest to Bangladesh)
- Environment variable placeholders

## Custom Domain (Optional)

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain (e.g., `nayonhardware.com`)
3. Update DNS records as instructed
4. SSL certificate is automatically provisioned

## Automatic Deployments

Vercel automatically deploys:

- **Production**: When you push to `main` branch
- **Preview**: When you create a pull request

## Monitoring

### Vercel Dashboard:

- View deployment logs
- Monitor performance
- Check analytics
- View error logs

### MongoDB Atlas:

- Monitor database performance
- View connection logs
- Set up alerts

## Troubleshooting

### Build Fails:

```bash
# Check build logs in Vercel dashboard
# Common issues:
# 1. Missing environment variables
# 2. MongoDB connection issues
# 3. Cloudinary configuration
```

### Database Connection Issues:

```bash
# Verify MongoDB URI is correct
# Check IP whitelist in MongoDB Atlas
# Test connection locally first
```

### Image Upload Issues:

```bash
# Verify Cloudinary credentials
# Check upload preset exists
# Ensure preset is "unsigned"
```

## Security Checklist

Before going to production:

- [ ] Generate new JWT_SECRET (don't use development secret)
- [ ] Whitelist specific IPs in MongoDB (not 0.0.0.0/0)
- [ ] Enable MongoDB authentication
- [ ] Use environment variables for all secrets
- [ ] Enable HTTPS (automatic with Vercel)
- [ ] Set up monitoring and alerts
- [ ] Regular database backups

## Performance Optimization

Vercel automatically provides:

- ✅ CDN (Content Delivery Network)
- ✅ Edge caching
- ✅ Image optimization
- ✅ Automatic HTTPS
- ✅ Serverless functions

## Costs

### Free Tier Includes:

- Unlimited deployments
- 100 GB bandwidth/month
- Automatic HTTPS
- Preview deployments

### Paid Features (if needed):

- More bandwidth
- Team collaboration
- Advanced analytics
- Priority support

## Support

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **MongoDB Atlas**: https://docs.atlas.mongodb.com
- **Cloudinary**: https://cloudinary.com/documentation

## Quick Commands

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod

# View logs
vercel logs

# Pull environment variables
vercel env pull

# List deployments
vercel ls
```

---

**Your app is now ready for Vercel deployment!** 🚀

Just push to GitHub and connect to Vercel. Don't forget to add environment variables!
