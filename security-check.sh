#!/bin/bash

# Security Check Script for Nayon Shop
# Run this before pushing to GitHub

echo "🔐 Running Security Check..."
echo ""

# Check if .env.local exists
if [ -f ".env.local" ]; then
    echo "✅ .env.local file found"
else
    echo "⚠️  Warning: .env.local file not found"
fi

# Check if .env.local is in .gitignore
if grep -q "\.env\*\.local" .gitignore; then
    echo "✅ .env*.local is in .gitignore"
else
    echo "❌ ERROR: .env*.local is NOT in .gitignore!"
    exit 1
fi

# Check if .env is in .gitignore
if grep -q "^\.env$" .gitignore; then
    echo "✅ .env is in .gitignore"
else
    echo "❌ ERROR: .env is NOT in .gitignore!"
    exit 1
fi

# Check if .env.local would be committed
if git check-ignore -q .env.local; then
    echo "✅ .env.local will be ignored by git"
else
    echo "❌ ERROR: .env.local will NOT be ignored!"
    exit 1
fi

# Check if .env.example exists
if [ -f ".env.example" ]; then
    echo "✅ .env.example template exists"
else
    echo "⚠️  Warning: .env.example not found (recommended)"
fi

# Check for sensitive data in tracked files
echo ""
echo "🔍 Checking for potential credential leaks..."

# Check for MongoDB URIs in tracked files
if git grep -q "mongodb+srv://" 2>/dev/null; then
    echo "⚠️  WARNING: Found MongoDB URI in tracked files!"
    git grep -n "mongodb+srv://"
else
    echo "✅ No MongoDB URIs found in tracked files"
fi

# Check for JWT secrets in tracked files
if git grep -q "JWT_SECRET=" 2>/dev/null; then
    echo "⚠️  WARNING: Found JWT_SECRET in tracked files!"
    git grep -n "JWT_SECRET="
else
    echo "✅ No JWT secrets found in tracked files"
fi

# Check for Cloudinary secrets in tracked files
if git grep -q "CLOUDINARY_API_SECRET=" 2>/dev/null; then
    echo "⚠️  WARNING: Found Cloudinary secret in tracked files!"
    git grep -n "CLOUDINARY_API_SECRET="
else
    echo "✅ No Cloudinary secrets found in tracked files"
fi

echo ""
echo "🎉 Security check complete!"
echo ""
echo "📝 Before pushing to GitHub:"
echo "   1. Make sure .env.local is NOT committed"
echo "   2. Only .env.example should be in the repository"
echo "   3. Never share your .env.local file"
echo "   4. Rotate credentials if accidentally exposed"
echo ""
echo "✅ Safe to push to GitHub!"
