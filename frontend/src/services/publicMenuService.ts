import publicApiClient from './publicApiClient';
import type { ApiResponse } from '../types/api';
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

    const response = await publicApiClient.get<ApiResponse<PublicMenuResponse> | PublicMenuResponse>(
      '/api/v1/public/menu'
    );
    const raw = response.data;
    const menuData: PublicMenuResponse =
      'data' in raw && raw.data && 'categories' in raw.data
        ? raw.data
        : 'categories' in raw
        ? raw
        : { categories: [] };
    memoryCache.set(PUBLIC_MENU_CACHE_KEY, menuData, PUBLIC_MENU_TTL_MS);
    return menuData;
  },

  /**
   * Fetch public categories only.
   */
  async getPublicCategories(): Promise<PublicMenuCategory[]> {
    const response = await publicApiClient.get<ApiResponse<PublicMenuCategory[]> | PublicMenuCategory[]>(
      '/api/v1/public/menu/categories'
    );
    const raw = response.data;
    return 'data' in raw && Array.isArray(raw.data) ? raw.data : Array.isArray(raw) ? raw : [];
  },

  /**
   * Fetch public items, optionally filtered by categoryId.
   */
  async getPublicItems(categoryId?: number): Promise<PublicMenuItem[]> {
    const params = categoryId ? { categoryId } : undefined;
    const response = await publicApiClient.get<ApiResponse<PublicMenuItem[]> | PublicMenuItem[]>(
      '/api/v1/public/menu/items',
      { params }
    );
    const raw = response.data;
    return 'data' in raw && Array.isArray(raw.data) ? raw.data : Array.isArray(raw) ? raw : [];
  },

  /**
   * Clear the public menu cache.
   */
  clearCache(): void {
    memoryCache.invalidate(PUBLIC_MENU_CACHE_KEY);
  },
};

export default publicMenuService;
