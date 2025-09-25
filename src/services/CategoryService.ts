import { supabase } from '../config/supabase';
import { Category, CreateCategoryData, UpdateCategoryData, CategoryModel } from '../models/Category';

export class CategoryService {
  static async createCategory(categoryData: CreateCategoryData): Promise<Category> {
    // Validate input
    if (!CategoryModel.validateName(categoryData.name)) {
      throw new Error('Category name must be between 3 and 50 characters');
    }
    
    if (!CategoryModel.validateDisplayName(categoryData.display_name_en)) {
      throw new Error('English display name must be between 3 and 100 characters');
    }
    
    if (!CategoryModel.validateDisplayName(categoryData.display_name_tr)) {
      throw new Error('Turkish display name must be between 3 and 100 characters');
    }
    
    if (!CategoryModel.validateColorHex(categoryData.color_hex)) {
      throw new Error('Invalid color hex format');
    }

    const { data, error } = await supabase
      .from('categories')
      .insert({
        ...categoryData,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create category: ${error.message}`);
    }

    return data;
  }

  static async getCategoryById(id: string): Promise<Category | null> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return null;
    }

    return data;
  }

  static async getAllCategories(language?: 'en' | 'tr'): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      throw new Error(`Failed to get categories: ${error.message}`);
    }

    return data || [];
  }

  static async updateCategory(id: string, updateData: UpdateCategoryData): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update category: ${error.message}`);
    }

    return data;
  }

  static async deleteCategory(id: string): Promise<void> {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete category: ${error.message}`);
    }
  }

  static async getCategoryDisplayName(category: Category, language: 'en' | 'tr'): Promise<string> {
    return CategoryModel.getDisplayName(category, language);
  }

  static async getCategoryDescription(category: Category, language: 'en' | 'tr'): Promise<string> {
    return CategoryModel.getDescription(category, language);
  }

  static async isCategoryActive(category: Category): Promise<boolean> {
    return CategoryModel.isActive(category);
  }
}
