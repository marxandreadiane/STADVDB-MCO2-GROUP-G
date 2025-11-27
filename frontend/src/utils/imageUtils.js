/**
 * Get album image URL with fallback support for both .webp and .jpg formats
 * @param {string} imageUrl - The image URL from the database (may be null/undefined)
 * @param {number} albumId - The album ID to use for fallback
 * @returns {string} - The image URL to use
 */
export const getAlbumImageUrl = (imageUrl, albumId) => {
  // If image_url is provided, use it directly
  if (imageUrl) {
    return imageUrl;
  }
  
  // Otherwise, try .webp first, then .jpg as fallback
  // The onError handler will handle the fallback
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
  
  // Prevent infinite loop by checking if we've already tried switching
  if (img.dataset.triedAlternate === 'true') {
    // Both formats tried, use placeholder
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

