import { supabase } from "@/lib/supabaseClient";
import { ErrorHandler } from "@/lib/errorHandler";

export interface Category {
  category_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCategoryData {
  name: string;
}

export interface UpdateCategoryData {
  name: string;
}

export class CategoryService {
  // Obtener todas las categorías con paginación
  async getCategories(page = 1, limit = 20) {
    try {
      const offset = (page - 1) * limit;

      // Obtener categorías con conteo total
      const { data, error, count } = await supabase
        .from("categories")
        .select("*", { count: "exact" })
        .order("name", { ascending: true })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return {
        data: (data || []) as Category[],
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
      };
    } catch (error) {
      const appError = ErrorHandler.fromSupabaseError(error);
      console.error("Error getting categories:", appError);
      throw appError;
    }
  }

  // Obtener todas las categorías sin paginación (para selects)
  async getAllCategories(): Promise<Category[]> {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;

      return (data || []) as Category[];
    } catch (error) {
      const appError = ErrorHandler.fromSupabaseError(error);
      console.error("Error getting all categories:", appError);
      throw appError;
    }
  }

  // Crear categoría
  async createCategory(categoryData: CreateCategoryData): Promise<Category> {
    try {
      const { data, error } = await supabase
        .from("categories")
        .insert({
          name: categoryData.name.trim(),
        })
        .select()
        .single();

      if (error) throw error;

      return data as Category;
    } catch (error) {
      const appError = ErrorHandler.fromSupabaseError(error);
      console.error("Error creating category:", appError);
      throw appError;
    }
  }

  // Actualizar categoría
  async updateCategory(
    categoryId: string,
    categoryData: UpdateCategoryData
  ): Promise<Category> {
    try {
      const { data, error } = await supabase
        .from("categories")
        .update({
          name: categoryData.name.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq("category_id", categoryId)
        .select()
        .single();

      if (error) throw error;

      return data as Category;
    } catch (error) {
      const appError = ErrorHandler.fromSupabaseError(error);
      console.error("Error updating category:", appError);
      throw appError;
    }
  }

  // Eliminar categoría
  async deleteCategory(categoryId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("categories")
        .delete()
        .eq("category_id", categoryId);

      if (error) throw error;
    } catch (error) {
      const appError = ErrorHandler.fromSupabaseError(error);
      console.error("Error deleting category:", appError);
      throw appError;
    }
  }

  // Verificar si una categoría está en uso
  async isCategoryInUse(categoryId: string): Promise<boolean> {
    try {
      const { count, error } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("category_id", categoryId);

      if (error) throw error;

      return (count || 0) > 0;
    } catch (error) {
      const appError = ErrorHandler.fromSupabaseError(error);
      console.error("Error checking category usage:", appError);
      throw appError;
    }
  }
}

export const categoryService = new CategoryService();
