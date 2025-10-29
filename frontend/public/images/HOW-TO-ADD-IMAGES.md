# How to Add Album Cover Images

## 📸 Quick Guide

Album images are stored in the `frontend/public/images/albums/` folder and named by album ID.

## 🎯 Step-by-Step Instructions

### 1. Find Your Album IDs

Current albums in the database:

| Album ID | Album Name | Artist |
|----------|------------|--------|
| 1 | EXIST | EXO |
| 2 | Don't Fight the Feeling | EXO |
| 3 | The ReVe Festival 2022 | Red Velvet |
| 4 | Feel My Rhythm | Red Velvet |
| 5 | Formula of Love | TWICE |
| 6 | Taste of Love | TWICE |
| 7 | 5-STAR | Stray Kids |
| 8 | MAXIDENT | Stray Kids |
| 9 | BORN PINK | BLACKPINK |
| 10 | The Album | BLACKPINK |

### 2. Get Album Cover Images

**Where to find album covers:**
- Google Images: Search "album name album cover"
- Spotify: Right-click album → Copy Image
- Apple Music: Screenshot the album
- Official store sites: YesAsia, Kpopmart, Ktown4u
- Pinterest: Search K-Pop album covers

**Image Requirements:**
- **Format:** JPG or PNG (JPG preferred for smaller file size)
- **Recommended size:** 500x500 pixels minimum
- **Aspect ratio:** Square (1:1) for best results
- **File size:** Under 1MB per image

### 3. Rename Images

Rename each image to match the album ID:
```
1.jpg  → EXIST (EXO)
2.jpg  → Don't Fight the Feeling (EXO)
3.jpg  → The ReVe Festival 2022 (Red Velvet)
4.jpg  → Feel My Rhythm (Red Velvet)
5.jpg  → Formula of Love (TWICE)
6.jpg  → Taste of Love (TWICE)
7.jpg  → 5-STAR (Stray Kids)
8.jpg  → MAXIDENT (Stray Kids)
9.jpg  → BORN PINK (BLACKPINK)
10.jpg → The Album (BLACKPINK)
```

### 4. Upload to Folder

**Using File Explorer:**
1. Open File Explorer
2. Navigate to:
   ```
   C:\Users\marxa\OneDrive\Documents\GitHub\STADVDB-MCO2-GROUP-G\frontend\public\images\albums
   ```
3. Drag and drop your renamed images into this folder

**Final folder structure:**
```
frontend/public/images/albums/
├── 1.jpg
├── 2.jpg
├── 3.jpg
├── 4.jpg
├── 5.jpg
├── 6.jpg
├── 7.jpg
├── 8.jpg
├── 9.jpg
└── 10.jpg
```

### 5. View Results

1. Make sure Docker containers are running:
   ```bash
   docker-compose up -d
   ```

2. Open browser and go to: http://localhost:3000

3. Click "Albums" in the navigation

4. Your album covers will now appear! ✨

## 🎨 Optional: Add a Placeholder Image

Create a generic placeholder for albums without images:

1. Get or create a generic K-Pop themed image
2. Name it `album-placeholder.jpg`
3. Place it in `frontend/public/images/`
4. This will show when an album-specific image is missing

## 🔄 Adding More Albums Later

When you add new albums to the database:
1. Note the new album's ID
2. Get the album cover image
3. Rename to `[album_id].jpg`
4. Drop it in `frontend/public/images/albums/`
5. Refresh browser - it appears automatically!

## 💡 Tips

- **Square images look best** - the site displays them in squares
- **Use JPG for photos** - smaller file size
- **Use PNG for transparent backgrounds** - if needed
- **Keep file sizes small** - under 500KB each for faster loading
- **Consistent quality** - try to get similar resolution images

## 🆘 Troubleshooting

**Image not showing?**
- Check filename matches album ID exactly (e.g., `1.jpg` not `1 .jpg` or `01.jpg`)
- Check file extension is lowercase (`.jpg` not `.JPG`)
- Hard refresh browser: `Ctrl + Shift + R`
- Check file is in correct folder: `frontend/public/images/albums/`

**Image looks stretched or blurry?**
- Use higher resolution image (at least 500x500)
- Make sure image is square before uploading
- Use JPG quality 85-90% when saving

---

**Ready to go?** Just drop your images in the folder and watch your store come to life! 🎵✨
