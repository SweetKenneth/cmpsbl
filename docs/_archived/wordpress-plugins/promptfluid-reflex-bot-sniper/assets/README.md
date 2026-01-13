# PromptFluid Defense - Plugin Assets

This folder contains the required assets for WordPress.org plugin directory listing.

## Required Files

### Banners
- **banner-772x250.png** - Standard resolution banner (displayed on plugin page)
- **banner-1544x500.png** - High resolution banner (Retina display)

### Icons
- **icon-256x256.png** - Plugin icon (displayed in plugin directory and admin)
- **icon-128x128.png** - Smaller icon version (optional, will be generated from 256x256)

### Screenshots
- **screenshot-1.png** - Main dashboard view showing bot detection statistics
- **screenshot-2.png** - Settings page configuration interface

## Asset Specifications

### Banner Dimensions
- Standard: 772 x 250 pixels
- Retina: 1544 x 500 pixels
- Format: PNG or JPG
- Max file size: 1MB recommended

### Icon Dimensions
- Standard: 128 x 128 pixels
- Retina: 256 x 256 pixels
- Format: PNG with transparency
- Max file size: 256KB recommended

### Screenshot Dimensions
- Recommended: 1280 x 720 pixels (16:9 ratio)
- Format: PNG or JPG
- Max file size: 1MB per screenshot

## Design Guidelines

### Color Palette
- Primary Purple: #7A5FFF
- Primary Cyan: #01C9E8
- Background: #0A0B10
- Text: #F6F9FF

### Typography
- Clean, modern sans-serif fonts
- High contrast for readability
- Professional tech aesthetic

### Imagery Style
- Futuristic, fluid design language
- AI/cybersecurity themes
- Dark mode optimized
- Gradient accents

## WordPress.org SVN Upload

After plugin approval, these assets must be uploaded to the plugin's SVN repository under `/assets/` directory:

```bash
svn co https://plugins.svn.wordpress.org/promptfluid-defense/
cd promptfluid-defense/assets
# Add banner and icon files
svn add *.png
svn commit -m "Add plugin assets"
```

## Notes

- Assets are separate from the plugin ZIP file
- Upload to SVN only after plugin approval
- Update assets anytime without plugin version bump
- Screenshots referenced in readme.txt must match filenames
