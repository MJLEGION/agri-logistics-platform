// src/services/cropImageServiceAPI.ts
// Fetches fresh produce images from Unsplash API with local caching
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// Create separate axios instance for Unsplash API (no baseURL)
const unsplashAxios = axios.create();

const UNSPLASH_API_URL = 'https://api.unsplash.com/search/photos';
const CACHE_KEY_PREFIX = 'crop_image_';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Fallback images in case API fails
const FALLBACK_IMAGES: { [key: string]: string } = {
  default:
    'https://images.unsplash.com/photo-1599599810694-b5ac4dd33653?w=400&h=400&fit=crop',
  vegetables:
    'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=400&fit=crop',
  fruits:
    'https://images.unsplash.com/photo-1560806887-1295cbd28588?w=400&h=400&fit=crop',
  proteins:
    'https://images.unsplash.com/photo-1635352511207-76c6d9b70994?w=400&h=400&fit=crop',
  grains:
    'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&h=400&fit=crop',
  dairy:
    'https://images.unsplash.com/photo-1550583328-6f71eb2f4ad9?w=400&h=400&fit=crop',
};

interface CacheData {
  imageUrl: string;
  timestamp: number;
}

/**
 * Fetches a fresh produce image from Unsplash API
 * Caches locally for 24 hours to reduce API calls
 * @param cropName - Name of the crop (e.g., "tomato", "chicken", "apple")
 * @returns Image URL string
 */
export const getCropImageFromAPI = async (cropName: string): Promise<string> => {
  const name = cropName.toLowerCase().trim();

  try {
    // Check cache first
    const cached = await getFromCache(name);
    if (cached) {
      return cached;
    }

    // Search Unsplash for fresh produce images
    const searchQuery = `fresh ${name} raw produce`;
    const response = await unsplashAxios.get(UNSPLASH_API_URL, {
      params: {
        query: searchQuery,
        page: 1,
        per_page: 1,
        orientation: 'squarish',
      },
      headers: {
        'Accept-Version': 'v1',
        // Note: Works without API key but with rate limiting (50 requests/hour)
        // Add to .env to increase limit: UNSPLASH_ACCESS_KEY=your_key
      },
    });

    // Extract image URL from response
    if (response.data.results && response.data.results.length > 0) {
      const imageUrl = response.data.results[0].urls.regular;

      // Cache the result
      await saveToCache(name, imageUrl);

      return imageUrl;
    }

    // If no results, try alternative search
    return await getAlternativeImage(name);
  } catch (error) {
    console.warn(`Error fetching image for ${name}:`, error);

    // Return fallback or try alternative
    return await getAlternativeImage(name);
  }
};

/**
 * Get alternative image if primary search fails
 */
const getAlternativeImage = async (cropName: string): Promise<string> => {
  try {
    // Try simpler search term
    const response = await unsplashAxios.get(UNSPLASH_API_URL, {
      params: {
        query: cropName,
        page: 1,
        per_page: 1,
        orientation: 'squarish',
      },
    });

    if (response.data.results && response.data.results.length > 0) {
      const imageUrl = response.data.results[0].urls.regular;
      await saveToCache(cropName, imageUrl);
      return imageUrl;
    }

    return FALLBACK_IMAGES.default;
  } catch (error) {
    console.warn(`Alternative search failed for ${cropName}`);
    return FALLBACK_IMAGES.default;
  }
};

/**
 * Get image from local cache
 */
const getFromCache = async (cropName: string): Promise<string | null> => {
  try {
    const cacheKey = `${CACHE_KEY_PREFIX}${cropName}`;
    const cached = await AsyncStorage.getItem(cacheKey);

    if (!cached) return null;

    const data: CacheData = JSON.parse(cached);
    const now = Date.now();

    // Check if cache has expired
    if (now - data.timestamp > CACHE_DURATION) {
      await AsyncStorage.removeItem(cacheKey);
      return null;
    }

    return data.imageUrl;
  } catch (error) {
    console.warn('Cache retrieval error:', error);
    return null;
  }
};

/**
 * Save image URL to local cache
 */
const saveToCache = async (cropName: string, imageUrl: string): Promise<void> => {
  try {
    const cacheKey = `${CACHE_KEY_PREFIX}${cropName}`;
    const data: CacheData = {
      imageUrl,
      timestamp: Date.now(),
    };
    await AsyncStorage.setItem(cacheKey, JSON.stringify(data));
  } catch (error) {
    console.warn('Cache save error:', error);
  }
};

/**
 * Batch fetch images for multiple crops
 * Useful for pre-loading images
 */
export const preLoadCropImages = async (cropNames: string[]): Promise<void> => {
  try {
    await Promise.all(cropNames.map((name) => getCropImageFromAPI(name)));
  } catch (error) {
    console.warn('Preload error:', error);
  }
};

/**
 * Clear all cached images
 */
export const clearImageCache = async (): Promise<void> => {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const cacheKeys = allKeys.filter((key) => key.startsWith(CACHE_KEY_PREFIX));
    await AsyncStorage.multiRemove(cacheKeys);
    console.log(`Cleared ${cacheKeys.length} cached images`);
  } catch (error) {
    console.warn('Cache clear error:', error);
  }
};

/**
 * Get fallback image by category
 */
export const getFallbackImageByCategory = (category: string): string => {
  const key = category.toLowerCase();
  return FALLBACK_IMAGES[key] || FALLBACK_IMAGES.default;
};