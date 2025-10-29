# Images Directory

## Where to Upload Your Images

### 1. **Home Page Hero Image**
Upload your main KPop store banner/hero image to:
```
frontend/public/images/kpop-placeholder.jpg
```
- Recommended size: 1200x600 pixels
- Format: JPG or PNG
- This will appear on the home page

### 2. **Individual Album Cover Images**
Upload album cover images to:
```
frontend/public/images/albums/
```
- Name them by album ID: `1.jpg`, `2.jpg`, `3.jpg`, etc.
- Recommended size: 500x500 pixels
- Format: JPG or PNG
- These will appear on the Albums page

### 3. **Placeholder for Missing Album Covers**
Upload a generic placeholder image to:
```
frontend/public/images/album-placeholder.jpg
```
- Recommended size: 500x500 pixels
- This will be shown when an album-specific image is missing

## Current Album IDs in Database
Based on your database, you have albums with IDs 1-10. To show custom images for each:
- `1.jpg` - XOXO by EXO
- `2.jpg` - The Red by Red Velvet
- `3.jpg` - Twicetagram by TWICE
- `4.jpg` - GO生 by Stray Kids
- `5.jpg` - THE ALBUM by BLACKPINK
- `6.jpg` - Universe by EXO
- `7.jpg` - Feel Special by TWICE
- `8.jpg` - IN生 by Stray Kids
- `9.jpg` - Ice Cream Cake by Red Velvet
- `10.jpg` - BORN PINK by BLACKPINK

## How to Add Images
1. Download or find the album cover images online
2. Rename them to match the album ID (1.jpg, 2.jpg, etc.)
3. Copy them to `frontend/public/images/albums/` folder
4. Refresh your browser - images will load automatically!

## Image Sources
You can find K-Pop album covers from:
- Spotify (screenshot the album covers)
- Apple Music
- Official artist websites
- Google Images (search "album name cover")
- Kpopmart, YesAsia, etc.

**Note:** The app will automatically show a placeholder if an image is missing, so don't worry if you don't have all images yet!
