#!/bin/bash

echo "🚀 GitHub Push Helper for Nayon Shop"
echo "===================================="
echo ""
echo "I'll help you push to: https://github.com/roysouhardyo/nayon_shop.git"
echo ""
echo "Choose your method:"
echo ""
echo "1) GitHub CLI (gh) - Easiest if you have it"
echo "2) Personal Access Token - Most common"
echo "3) Open GitHub Desktop - Visual interface"
echo ""
read -p "Enter your choice (1, 2, or 3): " choice

case $choice in
  1)
    echo ""
    echo "📦 Installing GitHub CLI..."
    
    # Check if gh is installed
    if command -v gh &> /dev/null; then
        echo "✅ GitHub CLI already installed"
    else
        echo "Installing gh..."
        type -p curl >/dev/null || (sudo apt update && sudo apt install curl -y)
        curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
        sudo chmod go+r /usr/share/keyrings/githubcli-archive-keyring.gpg
        echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
        sudo apt update
        sudo apt install gh -y
    fi
    
    echo ""
    echo "🔐 Authenticating with GitHub..."
    gh auth login
    
    echo ""
    echo "📤 Pushing to GitHub..."
    git remote set-url origin https://github.com/roysouhardyo/nayon_shop.git
    git push -u origin main
    
    echo ""
    echo "✅ Done! Check: https://github.com/roysouhardyo/nayon_shop"
    ;;
    
  2)
    echo ""
    echo "📝 Personal Access Token Method"
    echo "================================"
    echo ""
    echo "Step 1: Create a token"
    echo "   Go to: https://github.com/settings/tokens"
    echo "   Click: 'Generate new token (classic)'"
    echo "   Select: 'repo' scope"
    echo "   Click: 'Generate token'"
    echo "   Copy the token (starts with ghp_...)"
    echo ""
    read -p "Paste your token here: " token
    
    if [ -z "$token" ]; then
        echo "❌ No token provided!"
        exit 1
    fi
    
    echo ""
    echo "📤 Pushing to GitHub..."
    git remote set-url origin https://$token@github.com/roysouhardyo/nayon_shop.git
    git push -u origin main
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Successfully pushed!"
        echo "🔗 View at: https://github.com/roysouhardyo/nayon_shop"
    else
        echo ""
        echo "❌ Push failed. Please check your token and try again."
    fi
    ;;
    
  3)
    echo ""
    echo "🖥️  Opening GitHub Desktop method..."
    echo ""
    echo "Please follow these steps:"
    echo ""
    echo "1. Open GitHub Desktop"
    echo "2. File → Add Local Repository"
    echo "3. Choose: /home/souhardyo/Desktop/Nayon_Shop"
    echo "4. Click 'Publish repository' or 'Push origin'"
    echo "5. Sign in to GitHub if prompted"
    echo ""
    
    # Try to open GitHub Desktop if installed
    if command -v github-desktop &> /dev/null; then
        github-desktop /home/souhardyo/Desktop/Nayon_Shop
    elif command -v flatpak &> /dev/null && flatpak list | grep -q "GitHubDesktop"; then
        flatpak run io.github.shiftey.Desktop /home/souhardyo/Desktop/Nayon_Shop
    else
        echo "GitHub Desktop not found. Please install it or use option 1 or 2."
        echo ""
        echo "Install GitHub Desktop:"
        echo "https://desktop.github.com/"
    fi
    ;;
    
  *)
    echo "Invalid choice!"
    exit 1
    ;;
esac
