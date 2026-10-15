import publicApiClient from './publicApiClient';
import type { PublicMenuResponse, PublicMenuCategory, PublicMenuItem } from '../types/publicMenu';
import { memoryCache } from '../utils/cache';

const PUBLIC_MENU_CACHE_KEY = 'public:menu:full';
const PUBLIC_MENU_TTL_MS = 3 * 60 * 1000; // 3 minutes

export const publicMenuService = {
  /**
   * Fetch complete public menu (categories with their available items).
   * Uses in-memory cache to reduce load on public endpoints.
   */
  async getPublicMenu(forceRefresh = false): Promise<PublicMenuResponse> {
    if (!forceRefresh) {
      const cached = memoryCache.get<PublicMenuResponse>(PUBLIC_MENU_CACHE_KEY);
      if (cached) {
        return cached;
      }
    }

    const response = await publicApiClient.get<PublicMenuResponse>('/api/v1/public/menu');
    memoryCache.set(PUBLIC_MENU_CACHE_KEY, response.data, PUBLIC_MENU_TTL_MS);
    return response.data;
  },

  /**
   * Fetch public categories only.
   */
  async getPublicCategories(): Promise<PublicMenuCategory[]> {
    const response = await publicApiClient.get<PublicMenuCategory[]>('/api/v1/public/menu/categories');
    return response.data;
  },

  /**
   * Fetch public items, optionally filtered by categoryId.
   */
  async getPublicItems(categoryId?: number): Promise<PublicMenuItem[]> {
    const params = categoryId ? { categoryId } : undefined;
    const response = await publicApiClient.get<PublicMenuItem[]>('/api/v1/public/menu/items', { params });
    return response.data;
  },

  /**
   * Clear the public menu cache.
   */
  clearCache(): void {
    memoryCache.invalidate(PUBLIC_MENU_CACHE_KEY);
  },
};

export default publicMenuService;
