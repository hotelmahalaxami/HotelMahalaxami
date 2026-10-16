export interface PublicMenuItem {
  id: number;
  categoryId: number;
  categoryName: string;
  name: string;
  price: number;
  isVeg: boolean;
  available: boolean;
  displayOrder: number;
  description?: string;
}

export interface PublicMenuCategory {
  id: number;
  name: string;
  displayOrder: number;
  items: PublicMenuItem[];
}

export interface PublicMenuResponse {
  categories: PublicMenuCategory[];
}

export type VegFilterOption = 'ALL' | 'VEG' | 'NON_VEG';
