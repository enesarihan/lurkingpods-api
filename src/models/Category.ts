export interface Category {
  id: string;
  name: string;
  display_name_en: string;
  display_name_tr: string;
  description_en: string;
  description_tr: string;
  icon_url: string;
  color_hex: string;
  is_active: boolean;
  sort_order: number;
  created_at: Date;
}

export interface CreateCategoryData {
  name: string;
  display_name_en: string;
  display_name_tr: string;
  description_en: string;
  description_tr: string;
  icon_url: string;
  color_hex: string;
  sort_order: number;
}

export interface UpdateCategoryData {
  display_name_en?: string;
  display_name_tr?: string;
  description_en?: string;
  description_tr?: string;
  icon_url?: string;
  color_hex?: string;
  is_active?: boolean;
  sort_order?: number;
}

export class CategoryModel {
  static validateName(name: string): boolean {
    return name.length >= 3 && name.length <= 50;
  }

  static validateDisplayName(displayName: string): boolean {
    return displayName.length >= 3 && displayName.length <= 100;
  }

  static validateColorHex(colorHex: string): boolean {
    const hexRegex = /^#[0-9A-Fa-f]{6}$/;
    return hexRegex.test(colorHex);
  }

  static getDisplayName(category: Category, language: 'en' | 'tr'): string {
    return language === 'en' ? category.display_name_en : category.display_name_tr;
  }

  static getDescription(category: Category, language: 'en' | 'tr'): string {
    return language === 'en' ? category.description_en : category.description_tr;
  }

  static isActive(category: Category): boolean {
    return category.is_active;
  }
}
