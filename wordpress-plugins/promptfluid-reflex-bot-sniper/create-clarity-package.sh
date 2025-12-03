#!/bin/bash

# PromptFluid Clarity - WordPress Plugin Package Builder
# Creates distribution-ready ZIP file

echo "🌊 PromptFluid Clarity - Package Builder"
echo "========================================"

# Check if React build exists
if [ ! -d "admin/react-admin/dist" ]; then
    echo "⚠️  React build not found. Building now..."
    cd admin/react-admin
    npm install
    npm run build
    cd ../..
fi

# Create temporary directory
TEMP_DIR="promptfluid-clarity-temp"
PKG_NAME="promptfluid-clarity"

echo "📦 Creating package directory..."
rm -rf $TEMP_DIR
mkdir -p $TEMP_DIR/$PKG_NAME

# Copy plugin files
echo "📋 Copying plugin files..."
cp promptfluid-clarity.php $TEMP_DIR/$PKG_NAME/
cp config.php $TEMP_DIR/$PKG_NAME/
cp readme.txt $TEMP_DIR/$PKG_NAME/
cp LICENSE.txt $TEMP_DIR/$PKG_NAME/

# Copy includes directory
echo "📂 Copying includes..."
cp -r includes $TEMP_DIR/$PKG_NAME/

# Copy React build (dist only)
echo "⚛️  Copying React admin build..."
mkdir -p $TEMP_DIR/$PKG_NAME/admin/react-admin
cp -r admin/react-admin/dist $TEMP_DIR/$PKG_NAME/admin/react-admin/

# Create assets directory for WordPress.org
echo "🎨 Creating assets directory..."
mkdir -p $TEMP_DIR/$PKG_NAME/assets
if [ -d ".wordpress-org" ]; then
    cp .wordpress-org/*.png $TEMP_DIR/$PKG_NAME/assets/ 2>/dev/null || true
fi

# Create ZIP
echo "🗜️  Creating ZIP archive..."
cd $TEMP_DIR
zip -r ../$PKG_NAME.zip $PKG_NAME
cd ..

# Cleanup
echo "🧹 Cleaning up..."
rm -rf $TEMP_DIR

echo "✅ Package created: $PKG_NAME.zip"
echo ""
echo "📊 Package size:"
ls -lh $PKG_NAME.zip
echo ""
echo "🚀 Ready for WordPress.org submission!"
