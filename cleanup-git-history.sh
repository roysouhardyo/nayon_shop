#!/bin/bash

# Git History Cleanup Script
# This script removes sensitive files from Git history
# 
# ⚠️ WARNING: This will rewrite Git history!
# Make sure you have a backup before running this script.

set -e

echo "🔒 Git History Cleanup Script"
echo "=============================="
echo ""
echo "⚠️  WARNING: This will rewrite your Git history!"
echo "⚠️  All collaborators will need to re-clone the repository."
echo ""
read -p "Do you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Aborted."
    exit 1
fi

echo ""
echo "📋 Checking for git-filter-repo..."

if command -v git-filter-repo &> /dev/null; then
    echo "✅ git-filter-repo found"
    echo ""
    echo "🧹 Cleaning Git history using git-filter-repo..."
    
    # Remove the sensitive files from history
    git filter-repo --path create-cloudinary-preset.sh --invert-paths --force
    git filter-repo --path cloudinary-test.html --invert-paths --force
    
    echo "✅ Git history cleaned successfully!"
    
elif command -v java &> /dev/null; then
    echo "⚠️  git-filter-repo not found, checking for BFG..."
    
    if [ -f "bfg.jar" ]; then
        echo "✅ BFG found"
        echo ""
        echo "🧹 Cleaning Git history using BFG..."
        
        java -jar bfg.jar --delete-files create-cloudinary-preset.sh
        java -jar bfg.jar --delete-files cloudinary-test.html
        
        git reflog expire --expire=now --all
        git gc --prune=now --aggressive
        
        echo "✅ Git history cleaned successfully!"
    else
        echo "⚠️  BFG not found. Download from: https://rtyley.github.io/bfg-repo-cleaner/"
        echo ""
        echo "🔄 Falling back to git filter-branch..."
        use_filter_branch
    fi
else
    echo "⚠️  Neither git-filter-repo nor Java found"
    echo ""
    echo "🔄 Falling back to git filter-branch..."
    use_filter_branch
fi

function use_filter_branch() {
    echo ""
    echo "🧹 Cleaning Git history using git filter-branch..."
    
    git filter-branch --force --index-filter \
      "git rm --cached --ignore-unmatch create-cloudinary-preset.sh cloudinary-test.html" \
      --prune-empty --tag-name-filter cat -- --all
    
    echo "✅ Git history cleaned successfully!"
}

echo ""
echo "🔍 Verifying cleanup..."
echo ""

# Check if files still exist in history
if git log --all --full-history --oneline -- create-cloudinary-preset.sh cloudinary-test.html | grep -q .; then
    echo "⚠️  Warning: Files may still exist in history"
    echo "Please verify manually with:"
    echo "  git log --all --full-history -- create-cloudinary-preset.sh cloudinary-test.html"
else
    echo "✅ Files successfully removed from Git history"
fi

echo ""
echo "📤 Next steps:"
echo "1. Force push to remote:"
echo "   git push origin --force --all"
echo "   git push origin --force --tags"
echo ""
echo "2. Verify on GitHub that the files are removed"
echo ""
echo "3. Rotate your Cloudinary credentials (see SECURITY_INCIDENT.md)"
echo ""
echo "4. All collaborators must re-clone the repository:"
echo "   git clone https://github.com/roysouhardyo/nayon_shop.git"
echo ""

read -p "Do you want to force push now? (yes/no): " push_confirm

if [ "$push_confirm" = "yes" ]; then
    echo ""
    echo "📤 Force pushing to remote..."
    git push origin --force --all
    git push origin --force --tags
    echo "✅ Force push completed!"
else
    echo ""
    echo "⚠️  Remember to force push later with:"
    echo "   git push origin --force --all"
    echo "   git push origin --force --tags"
fi

echo ""
echo "✅ Cleanup complete!"
echo ""
echo "📋 Don't forget to:"
echo "   - Rotate Cloudinary credentials"
echo "   - Update .env.local with new credentials"
echo "   - Update Vercel environment variables"
echo "   - Verify on GitHub that credentials are removed"
echo ""
