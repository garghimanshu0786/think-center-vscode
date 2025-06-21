# 🚀 GitHub Setup and VS Code Extension Publishing Guide

## 📋 Prerequisites

Before running these commands, make sure you have:

1. **GitHub CLI installed**: `brew install gh` (or download from github.com/cli/cli)
2. **VSCE installed**: `npm install -g vsce`
3. **VS Code Publisher Account**: Visit https://marketplace.visualstudio.com/manage

## 🗂️ Step 1: Create GitHub Repository

### Option A: Using GitHub CLI (Recommended)
```bash
# Login to GitHub
gh auth login

# Create repository as fork of original think-center
gh repo create think-center-vscode --public --description "VS Code extension for Think Center multi-perspective cognitive framework - forked from think-center" --clone=false

# Push your code
git push -u origin master
```

### Option B: Manual Setup
1. Go to https://github.com/new
2. Repository name: `think-center-vscode`
3. Description: `VS Code extension for Think Center multi-perspective cognitive framework`
4. Make it Public
5. **Important**: After creating, go to Settings → Manage Repository → "Create Fork" from `himanshu-garg/think-center`

## 🏷️ Step 2: Create Release Tag
```bash
# Create and push a release tag
git tag v0.1.0
git push origin v0.1.0
```

## 📦 Step 3: Package the Extension
```bash
# Build the extension package
npm run package

# Create the .vsix package
vsce package
```

## 🌟 Step 4: Publish to VS Code Marketplace

### Setup Publisher Account
1. Go to https://marketplace.visualstudio.com/manage
2. Sign in with Microsoft account
3. Create publisher `garghimanshu0786` if not exists
4. Generate Personal Access Token (PAT)

### Publish Extension
```bash
# Login with your PAT
vsce login garghimanshu0786

# Publish to marketplace
vsce publish
```

## 🔗 Step 5: Update Repository Links

After creating the GitHub repo, update these files:

### Update README.md
Add these badges at the top:
```markdown
[![VS Code Marketplace](https://img.shields.io/vscode-marketplace/v/garghimanshu0786.think-center.svg)](https://marketplace.visualstudio.com/items?itemName=garghimanshu0786.think-center)
[![Downloads](https://img.shields.io/vscode-marketplace/d/garghimanshu0786.think-center.svg)](https://marketplace.visualstudio.com/items?itemName=garghimanshu0786.think-center)
[![GitHub](https://img.shields.io/github/stars/garghimanshu0786/think-center-vscode.svg?style=social)](https://github.com/garghimanshu0786/think-center-vscode)
```

## 🎯 Final Result

Your extension will be:
- ✅ Published on VS Code Marketplace as "Think Center"
- ✅ Available on GitHub as `garghimanshu0786/think-center-vscode`
- ✅ Properly attributed as forked from original think-center
- ✅ Ready for users to install via VS Code or `code --install-extension garghimanshu0786.think-center`

## 🚀 Quick Commands Summary
```bash
# 1. Create GitHub repo
gh repo create think-center-vscode --public --description "VS Code extension for Think Center multi-perspective cognitive framework"

# 2. Push code
git push -u origin master

# 3. Create release
git tag v0.1.0 && git push origin v0.1.0

# 4. Package and publish
npm run package
vsce package
vsce login garghimanshu0786
vsce publish
```

## 🔧 Troubleshooting

**If VSCE login fails:**
- Ensure your Microsoft account has marketplace access
- Generate new PAT at https://dev.azure.com with Marketplace scope
- Use `vsce login garghimanshu0786 --pat YOUR_PAT_HERE`

**If GitHub shows as not forked:**
- Go to your repo Settings → General → Template repository
- Or mention in README: "Forked from [think-center](https://github.com/himanshu-garg/think-center)"

---
**Ready to launch your Think Center VS Code extension! 🧠✨**
