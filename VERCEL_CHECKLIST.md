# ✅ Vercel Deployment Checklist

## Pre-Deployment Checklist

### 1. Code Ready ✅

- [x] All features implemented
- [x] Mobile optimized
- [x] Security implemented
- [x] Environment variables documented
- [x] `.gitignore` configured
- [x] `.env.local` NOT in git

### 2. Files Created ✅

- [x] `vercel.json` - Vercel configuration
- [x] `.vercelignore` - Files to exclude
- [x] `DEPLOYMENT.md` - Deployment guide
- [x] `README.md` - Project documentation
- [x] `.env.example` - Environment template

### 3. Dependencies ✅

- [x] `package.json` has build script
- [x] All dependencies listed
- [x] No missing packages

### 4. Build Configuration ✅

- [x] Next.js 14 configured
- [x] Tailwind CSS configured
- [x] MongoDB connection ready
- [x] Cloudinary configured

## Deployment Steps

### Step 1: Push to GitHub

```bash
# Run security check
./security-check.sh

# Add all files
git add .

# Commit
git commit -m "Ready for Vercel deployment"

# Push to GitHub
git push origin main
```

### Step 2: Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import from GitHub
4. Select `nayon-hardware` repository

### Step 3: Configure Environment Variables

Add these in Vercel Dashboard → Settings → Environment Variables:

**Required:**

```
MONGODB_URI=mongodb+srv://nayon:Roy06539@teamdivider.7dbezvd.mongodb.net/nayon_shop?appName=TeamDivider
JWT_SECRET=<generate-new-secret>
CLOUDINARY_CLOUD_NAME=dfvkneves
CLOUDINARY_API_KEY=563595939332626
CLOUDINARY_API_SECRET=UpAzXDF6Rc0X787MxivNfCXZMeE
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dfvkneves
```

**Optional:**

```
NEXT_PUBLIC_APP_NAME=নয়ন হার্ডওয়্যার
NEXT_PUBLIC_SHOP_NAME_BN=নয়ন হার্ডওয়্যার
NEXT_PUBLIC_SHOP_NAME_EN=Nayon Hardware
```

### Step 4: Deploy

Click "Deploy" button in Vercel

### Step 5: Post-Deployment

1. **MongoDB Atlas**:
   - Add IP: `0.0.0.0/0` (or Vercel IPs)
2. **Create Admin**:

   - Use `/api/admins` endpoint
   - Or run `scripts/create-admin.js`

3. **Seed Categories**:

   - Run `scripts/seed-categories.js`

4. **Test**:
   - Visit your deployed URL
   - Login as admin
   - Test all features

## Environment Variables Guide

### Generate JWT Secret:

```bash
openssl rand -hex 64
```

### MongoDB URI Format:

```
mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?appName=<app>
```

### Cloudinary Setup:

1. Upload preset: `nayonshop`
2. Mode: Unsigned
3. Folder: `products`

## Vercel Settings

### Build & Development Settings:

- **Framework**: Next.js (auto-detected)
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`
- **Development Command**: `npm run dev`

### Regions:

- **Recommended**: Singapore (`sin1`) - closest to Bangladesh
- **Alternative**: Mumbai (`bom1`)

## Testing Deployment

### 1. Public Page

```
https://your-app.vercel.app/public
```

- [ ] Products load
- [ ] Images display
- [ ] Filters work
- [ ] Search works

### 2. Login Page

```
https://your-app.vercel.app/login
```

- [ ] Login form works
- [ ] Authentication successful
- [ ] Redirects to dashboard

### 3. Admin Dashboard

```
https://your-app.vercel.app/admin
```

- [ ] Stats load
- [ ] Navigation works
- [ ] All pages accessible

### 4. Features

- [ ] Add product with images
- [ ] Record sale
- [ ] Generate report
- [ ] Create admin
- [ ] Mobile responsive

## Troubleshooting

### Build Fails

- Check environment variables
- Verify MongoDB connection
- Check Vercel logs

### Database Connection Error

- Whitelist Vercel IPs in MongoDB
- Verify connection string
- Check database name

### Image Upload Fails

- Verify Cloudinary credentials
- Check upload preset exists
- Ensure preset is unsigned

### 404 Errors

- Check route names
- Verify file structure
- Check Next.js configuration

## Performance Monitoring

### Vercel Analytics:

- Page load times
- Error rates
- Traffic patterns

### MongoDB Atlas:

- Query performance
- Connection count
- Database size

## Security

### Production Checklist:

- [ ] New JWT secret generated
- [ ] MongoDB IP whitelist configured
- [ ] HTTPS enabled (automatic)
- [ ] Environment variables secured
- [ ] No secrets in code
- [ ] `.env.local` in `.gitignore`

## Maintenance

### Regular Tasks:

- Monitor error logs
- Check database performance
- Update dependencies
- Backup database
- Review security

### Updates:

```bash
# Pull latest code
git pull

# Vercel auto-deploys on push to main
git push origin main
```

## Support

- **Vercel**: https://vercel.com/support
- **Next.js**: https://nextjs.org/docs
- **MongoDB**: https://docs.atlas.mongodb.com

---

## Quick Reference

### Vercel CLI Commands:

```bash
vercel                 # Deploy to preview
vercel --prod          # Deploy to production
vercel logs            # View logs
vercel env pull        # Pull environment variables
vercel env add         # Add environment variable
```

### Your App URLs:

- **Production**: `https://your-app.vercel.app`
- **Preview**: `https://your-app-git-branch.vercel.app`

---

**Your app is Vercel-ready!** 🚀

Just follow the steps above and you'll be live in minutes!
