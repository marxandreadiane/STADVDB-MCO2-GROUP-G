/**
 * Get album image URL with fallback support for both .webp and .jpg formats
 * @param {string} imageUrl - The image URL from the database (may be null/undefined)
 * @param {number} albumId - The album ID to use for fallback
 * @returns {string} - The image URL to use
 */
export const getAlbumImageUrl = (imageUrl, albumId) => {
  if (imageUrl) {
    return imageUrl;
  }
  
  return `/images/albums/${albumId}.webp`;
};

/**
 * Handle image error by trying alternative format
 * @param {Event} e - The error event
 * @param {number} albumId - The album ID
 */
export const handleImageError = (e, albumId) => {
  const img = e.target;
  const currentSrc = img.src;
  
  // Extract the base path and check current format
  const basePath = `/images/albums/${albumId}`;
  const isWebp = currentSrc.includes(`${albumId}.webp`) || currentSrc.endsWith('.webp');
  const isJpg = currentSrc.includes(`${albumId}.jpg`) || currentSrc.endsWith('.jpg');
  
  if (img.dataset.triedAlternate === 'true') {
    img.src = '/images/album-placeholder.jpg';
    return;
  }
  
  // If current src is .webp, try .jpg
  if (isWebp) {
    img.dataset.triedAlternate = 'true';
    img.src = `${basePath}.jpg`;
    return;
  }
  
  // If current src is .jpg, try .webp
  if (isJpg) {
    img.dataset.triedAlternate = 'true';
    img.src = `${basePath}.webp`;
    return;
  }
  
  // If format is unclear, try .jpg first, then .webp
  if (!isWebp && !isJpg) {
    img.dataset.triedAlternate = 'true';
    img.src = `${basePath}.jpg`;
    return;
  }
  
  // Final fallback to placeholder
  img.src = '/images/album-placeholder.jpg';
};

