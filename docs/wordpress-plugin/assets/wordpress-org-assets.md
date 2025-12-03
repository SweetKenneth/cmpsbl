# WordPress.org Assets

This directory contains assets for the WordPress.org plugin repository.

## Required Assets

### Screenshots (Required - 4 minimum)
Place PNG images in this directory with names:
- `screenshot-1.png` - Main Dashboard
- `screenshot-2.png` - Security Overview  
- `screenshot-3.png` - Upgrade/Pricing Page
- `screenshot-4.png` - Settings Panel

**Screenshot Guidelines:**
- Minimum resolution: 1280x720px
- Maximum file size: 1MB per screenshot
- Format: PNG (preferred) or JPG
- No transparency or alpha channels
- Show actual plugin interface (no mockups)

### Plugin Icon (Required)
- `icon-128x128.png` - Used in search results
- `icon-256x256.png` - Used in plugin detail page

**Icon Guidelines:**
- Square aspect ratio
- Format: PNG with transparency
- Clean, recognizable design
- Matches brand colors

### Plugin Banner (Optional but Recommended)
- `banner-772x250.png` - Low DPI banner
- `banner-1544x500.png` - High DPI (Retina) banner

**Banner Guidelines:**
- Landscape format
- Format: JPG or PNG
- High quality, professional design
- No text smaller than 48px

## Current Status

**v1.5.2 Assets:**
- ❌ Screenshots need to be captured from live plugin
- ❌ Plugin icons need to be designed/generated
- ❌ Plugin banners need to be designed/generated

## How to Upload Assets

After plugin approval on WordPress.org:

```bash
# 1. Check out the assets directory
svn co https://plugins.svn.wordpress.org/promptfluid-reflex/assets svn-assets
cd svn-assets

# 2. Copy your assets
cp /path/to/assets/*.png .

# 3. Add to SVN
svn add *.png

# 4. Commit
svn ci -m "Adding plugin assets for v1.5.2"
```

## Asset Descriptions for WordPress.org

### Screenshot 1: Main Dashboard
**Caption:** "Real-time security dashboard showing threat score, blocked attacks (last 24h), live activity feed, and module controls. Bot Sniper™ AI protection actively monitoring your site."

### Screenshot 2: Security Overview
**Caption:** "Comprehensive security overview displaying file integrity status (1000+ files monitored), firewall statistics, login guard metrics, and malware scan results."

### Screenshot 3: Upgrade/Pricing Page  
**Caption:** "Four-tier pricing with 3-day free trial. Choose from Lite (Free), Pro ($19/mo), Complete ($39/mo), or Sentinel ($79/mo). Secure Stripe checkout integration."

### Screenshot 4: Settings Panel
**Caption:** "Granular security controls - enable/disable individual protection modules, adjust sensitivity levels, configure email alerts, and customize protection rules."

## Notes

- Assets are uploaded AFTER plugin approval via SVN
- Assets are shared across all plugin versions
- Changes to assets appear immediately (no version update needed)
- Keep assets current with plugin UI as features evolve
