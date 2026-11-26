// TMDB image URLs are built as: secure_base_url + size + file_path.
// Base URL and sizes were verified with GET /configuration (images.*).
// They are constants so the app does not need an extra request on startup.
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/'

// Sizes we use, all taken from the /configuration size lists.
export const IMAGE_SIZES = {
  posterThumb: 'w92', // poster_sizes (terminal result rows)
  posterCard: 'w342', // poster_sizes
  posterDetail: 'w500', // poster_sizes
  backdrop: 'w1280', // backdrop_sizes
  backdropSmall: 'w780', // backdrop_sizes
  profile: 'w185', // profile_sizes
  profileLarge: 'h632', // profile_sizes
}

/**
 * Returns a full image URL, or null when TMDB has no image (path is null).
 * Components render their own themed placeholder when this returns null.
 * @param {string|null|undefined} path TMDB file_path, e.g. '/abc.jpg'
 * @param {string} size One of IMAGE_SIZES (defaults to the card poster size)
 */
export function imageUrl(path, size = IMAGE_SIZES.posterCard) {
  if (!path) return null
  return `${IMAGE_BASE_URL}${size}${path}`
}
