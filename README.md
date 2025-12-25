# 🛠️ Nayon Hardware - Inventory Management System

A modern, mobile-first inventory management system for hardware shops in Bangladesh, with full Bengali language support.

## ✨ Features

- 📦 **Product Management** - Add, edit, delete products with multiple images
- 💰 **Sales Tracking** - Record and track sales with detailed reports
- 📊 **Purchase Management** - Track stock purchases and movements
- 📈 **Reports & Analytics** - Interactive charts and PDF reports
- 🌐 **Bilingual** - Full support for Bengali and English
- 📱 **Mobile-First** - Optimized for mobile phone usage
- 🖼️ **Image Carousel** - Multiple product images with navigation
- 🔐 **Secure Authentication** - JWT-based admin authentication
- ☁️ **Cloud Storage** - Cloudinary integration for images

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- MongoDB Atlas account (free tier works)
- Cloudinary account (free tier works)

### Installation

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd Nayon_Shop
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

4. **Edit `.env.local` with your credentials**

   - MongoDB connection string
   - JWT secret (generate with: `openssl rand -hex 64`)
   - Cloudinary credentials

5. **Run the development server**

   ```bash
   npm run dev
   ```

6. **Open your browser**
   ```
   http://localhost:3000
   ```

## 🔧 Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# MongoDB Atlas
MONGODB_URI=your-mongodb-connection-string

# JWT Secret (generate with: openssl rand -hex 64)
JWT_SECRET=your-secret-key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name

# App Configuration
NEXT_PUBLIC_APP_NAME=নয়ন হার্ডওয়্যার
NEXT_PUBLIC_SHOP_NAME_BN=নয়ন হার্ডওয়্যার
NEXT_PUBLIC_SHOP_NAME_EN=Nayon Hardware
```

**⚠️ IMPORTANT**: Never commit your `.env.local` file to GitHub!

## � Initial Setup Scripts

After setting up your environment variables, run these scripts to initialize your database:

### 1. Seed Categories

Populate the database with all product categories and subcategories:

```bash
node scripts/seed-categories.js
```

This will create:

- 8 main categories (Water Pump Parts, Motorcycle Parts, etc.)
- 80+ subcategories

### 2. Create Admin Account

Create your first admin user:

```bash
node scripts/create-admin.js
```

You'll be prompted for:

- Admin name
- Email
- Password

### 3. Seed Sample Products (Optional)

Add sample products for testing:

```bash
node scripts/seed-products.js
```

**Note**: Run scripts in this order for best results!

## �📋 Cloudinary Setup

1. Go to [Cloudinary Console](https://console.cloudinary.com/)
2. Navigate to Settings → Upload
3. Create an upload preset:
   - Name: `nayonshop`
   - Signing Mode: **Unsigned**
   - Folder: `products` (optional)

## 🗄️ MongoDB Setup

1. Create a free cluster on [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a database user
3. Whitelist your IP (or use 0.0.0.0/0 for development)
4. Get your connection string
5. Replace `<username>`, `<password>`, and `<database>` in the connection string

## 📱 Mobile Optimization

This app is optimized for mobile usage:

- ✅ Touch-friendly buttons (44x44px minimum)
- ✅ Responsive layouts
- ✅ Mobile-optimized charts
- ✅ Horizontal scroll for tables
- ✅ Full-screen modals on mobile
- ✅ Image carousels with swipe support

## 🏗️ Tech Stack

- **Framework**: Next.js 14
- **Database**: MongoDB
- **Authentication**: JWT
- **Image Storage**: Cloudinary
- **Styling**: Tailwind CSS
- **Charts**: Chart.js
- **Language**: Bengali (Hind Siliguri font) + English (Inter font)

## 📁 Project Structure

```
Nayon_Shop/
├── src/
│   ├── app/              # Next.js app directory
│   │   ├── admin/        # Admin pages
│   │   ├── api/          # API routes
│   │   └── public/       # Public pages
│   ├── components/       # Reusable components
│   ├── lib/              # Utility functions
│   └── models/           # Database models
├── public/               # Static assets
├── .env.local           # Environment variables (NOT in git)
├── .env.example         # Environment template
└── package.json         # Dependencies
```

## 🔐 Security

- ✅ `.env.local` is in `.gitignore`
- ✅ JWT authentication for admin routes
- ✅ Password hashing with bcrypt
- ✅ MongoDB injection protection
- ✅ CORS configuration

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project on [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

- **Netlify**: Supports Next.js
- **Railway**: Easy MongoDB + Next.js deployment
- **DigitalOcean**: App Platform

**Remember**: Always set environment variables in your deployment platform!

## 📝 Default Admin Credentials

After first run, create an admin user through the API or use the registration page.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Bengali font: [Hind Siliguri](https://fonts.google.com/specimen/Hind+Siliguri)
- Icons: Heroicons
- Charts: Chart.js

## 📞 Support

For issues and questions, please open an issue on GitHub.

---

**Made with ❤️ for Nayon Hardware**
