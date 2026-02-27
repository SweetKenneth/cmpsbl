#!/bin/bash

##
# PromptFluid Defense - WordPress.org Submission Package Creator
# This script creates a clean, WordPress.org compliant plugin ZIP file
##

echo "🛡️  Creating PromptFluid Reflex submission package..."

# Define directories
PLUGIN_DIR="wordpress-plugin"
BUILD_DIR="build"
PACKAGE_NAME="promptfluid-reflex"

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR/$PACKAGE_NAME"

# Copy plugin files
echo "📦 Copying plugin files..."
rsync -av \
  --exclude=".git*" \
  --exclude=".DS_Store" \
  --exclude="node_modules" \
  --exclude=".env*" \
  --exclude="*.md" \
  --exclude="react-admin" \
  --exclude=".wordpress-org" \
  --exclude="build" \
  --exclude="*.sh" \
  --exclude="PHASE_*.md" \
  --exclude="CREATE_SUBMISSION_ZIP.md" \
  --exclude="SUBMISSION_GUIDE.md" \
  --exclude="TESTING_CHECKLIST.md" \
  --exclude="FINAL_VERIFICATION.md" \
  --exclude="WORDPRESS_ORG_*.md" \
  --exclude="SUBMIT_*.md" \
  --exclude="STRIPE_*.md" \
  "$PLUGIN_DIR/" "$BUILD_DIR/$PACKAGE_NAME/"

# Create the ZIP
echo "🗜️  Creating ZIP file..."
cd "$BUILD_DIR"
zip -r "$PACKAGE_NAME.zip" "$PACKAGE_NAME" -q

# Calculate file size
FILE_SIZE=$(du -h "$PACKAGE_NAME.zip" | cut -f1)
echo "✅ Package created: $PACKAGE_NAME.zip ($FILE_SIZE)"

# Move to root
mv "$PACKAGE_NAME.zip" "../$PACKAGE_NAME.zip"
cd ..

echo ""
echo "📋 Submission Checklist:"
echo "  ✅ Plugin ZIP created"
echo "  ✅ Size: $FILE_SIZE"
echo "  ✅ Location: ./$PACKAGE_NAME.zip"
echo "  ✅ Version: 1.5.3 (Premium Dashboard Experience)"
echo ""
echo "📤 Next Steps:"
echo "  1. Test the plugin on a clean WordPress install"
echo "  2. Verify Stripe checkout flow works end-to-end"
echo "  3. Create WordPress.org account (username: promptfluid)"
echo "  4. Go to https://wordpress.org/plugins/developers/add/"
echo "  5. Upload $PACKAGE_NAME.zip"
echo "  6. Wait for review (5-10 business days)"
echo ""
echo "📝 Critical v1.5.3 Upgrade: Premium Dashboard Experience!"
echo "   - Installation wizard with 5-step onboarding"
echo "   - Toast notifications for all user actions"
echo "   - Live module toggles with instant feedback"
echo "   - Activity feed with real-time threat monitoring"
echo "   - Modern, fluid UI that feels protected"
echo ""
echo "📖 Full submission guide: See SUBMIT_NOW_v1.5.3.md"
echo ""
echo "✨ Good luck with your submission! 🚀"
