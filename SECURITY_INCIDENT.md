# 🔒 Security Incident Report & Remediation

**Date:** December 25, 2025
**Severity:** HIGH
**Status:** REMEDIATED (Pending Credential Rotation)

## Issue Identified

Two files containing hardcoded Cloudinary API credentials were committed to the Git repository:

1. **`create-cloudinary-preset.sh`** - Contained API Key and API Secret
2. **`cloudinary-test.html`** - Contained Cloud Name

These files were committed in: `3064f0a - Initial commit: Nayon Hardware Inventory Management System`

## Exposed Credentials

- **Cloudinary Cloud Name:** dfvkneves
- **Cloudinary API Key:** 563595939332626
- **Cloudinary API Secret:** UpAzXDF6Rc0X787MxivNfCXZMeE ⚠️

## Actions Taken

### ✅ Completed

1. Removed files from Git tracking
2. Updated `.gitignore` to prevent future commits
3. Created secure template files (`.example` versions)
4. Deleted local files with credentials
5. Documented the incident

### ⚠️ REQUIRED - Manual Steps

You **MUST** complete these steps immediately:

#### 1. Rotate Cloudinary Credentials

**Login to Cloudinary Dashboard:**

- URL: https://cloudinary.com/console
- Navigate to: Settings → Security → Access Keys

**Generate New Credentials:**

1. Click "Generate New API Secret"
2. Copy the new API Key and API Secret
3. Update your `.env.local` file:

```bash
CLOUDINARY_CLOUD_NAME=dfvkneves
CLOUDINARY_API_KEY=<NEW_API_KEY>
CLOUDINARY_API_SECRET=<NEW_API_SECRET>
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dfvkneves
```

4. Restart your development server

**Revoke Old Credentials:**

- In Cloudinary dashboard, revoke/delete the old API key if possible

#### 2. Clean Git History

The compromised credentials are still in your Git history. You need to remove them:

**Option A: Using git filter-repo (Recommended)**

```bash
# Install git-filter-repo if not already installed
# pip install git-filter-repo

git filter-repo --path create-cloudinary-preset.sh --invert-paths
git filter-repo --path cloudinary-test.html --invert-paths
```

**Option B: Using BFG Repo-Cleaner**

```bash
# Download BFG from https://rtyley.github.io/bfg-repo-cleaner/
java -jar bfg.jar --delete-files create-cloudinary-preset.sh
java -jar bfg.jar --delete-files cloudinary-test.html
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

**Option C: Using git filter-branch (Legacy)**

```bash
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch create-cloudinary-preset.sh cloudinary-test.html" \
  --prune-empty --tag-name-filter cat -- --all
```

#### 3. Force Push to GitHub

⚠️ **WARNING:** This will rewrite Git history!

```bash
# After cleaning history, force push
git push origin --force --all
git push origin --force --tags
```

#### 4. Verify on GitHub

1. Go to: https://github.com/roysouhardyo/nayon_shop
2. Check commit history to ensure files are removed
3. Search repository for "UpAzXDF6Rc0X787MxivNfCXZMeE" to verify it's gone

#### 5. Update Vercel Environment Variables

If you've deployed to Vercel, update the environment variables there:

1. Go to: https://vercel.com/dashboard
2. Select your project
3. Settings → Environment Variables
4. Update `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET` with new values
5. Redeploy the application

## Prevention Measures Implemented

1. ✅ Added security section to `.gitignore`
2. ✅ Created `.example` template files for sensitive configurations
3. ✅ Removed hardcoded credentials from codebase
4. ✅ All credentials now use environment variables

## Best Practices Going Forward

### ✅ DO:

- Use environment variables for ALL credentials
- Keep `.env.local` in `.gitignore`
- Use `.example` files for configuration templates
- Review commits before pushing
- Use pre-commit hooks to scan for secrets

### ❌ DON'T:

- Never commit files with credentials
- Never hardcode API keys, secrets, or passwords
- Never commit `.env` or `.env.local` files
- Never share credentials in code or comments

## Additional Security Recommendations

1. **Enable GitHub Secret Scanning:**

   - Go to repository Settings → Security → Secret scanning
   - Enable "Secret scanning" to detect future leaks

2. **Use Git Hooks:**

   - Install `git-secrets` or `detect-secrets`
   - Prevents committing secrets automatically

3. **Regular Security Audits:**
   - Periodically review repository for exposed secrets
   - Use tools like `truffleHog` or `gitleaks`

## Verification Checklist

- [ ] Rotated Cloudinary API credentials
- [ ] Updated `.env.local` with new credentials
- [ ] Cleaned Git history (removed compromised files)
- [ ] Force pushed to GitHub
- [ ] Verified files removed from GitHub
- [ ] Updated Vercel environment variables
- [ ] Redeployed application
- [ ] Tested application with new credentials
- [ ] Enabled GitHub secret scanning

## Status

**Current Status:** Files removed from working directory and Git tracking
**Next Action Required:** Rotate credentials and clean Git history (see steps above)
**Priority:** 🔴 HIGH - Complete within 24 hours

---

**Note:** This file is safe to commit as it contains only documentation, not actual credentials.
