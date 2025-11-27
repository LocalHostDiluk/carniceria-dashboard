import { supabase } from "@/lib/supabaseClient";
import { ErrorHandler } from "@/lib/errorHandler";
import { storageService } from "./storageService";
import type {
  Product,
  CreateProductData,
  UpdateProductData,
  Category,
  Supplier,
  ProductWithCategory,
} from "@/types/models";

export async function getActiveProducts(): Promise<ProductWithCategory[]> {
  try {
    const { data, error } = await supabase.rpc("get_products_list");
    if (error) throw error;

    return (
      (data || [])
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .filter((p: any) => p.is_active)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((p: any) => ({
          product_id: p.product_id,
          name: p.name,
          category_id: p.category_id,
          category_name: p.category_name ?? null,
          sale_price: Number(p.sale_price),
          unit_of_measure: p.unit_of_measure,
          can_be_sold_by_weight: !!p.can_be_sold_by_weight,
          is_active: !!p.is_active,
          is_featured: !!p.is_featured,
          image_url: p.image_url || null, // ✅ AGREGAR ESTA LÍNEA
        }))
    );
  } catch (error) {
    const appError = ErrorHandler.fromSupabaseError(error);
    console.error("Error getting active products (rpc):", appError);
    throw appError;
  }
}

export class ProductService {
  // Obtener lista de productos
  async getProducts(): Promise<Product[]> {
    try {
      const { data, error } = await supabase.rpc("get_products_list");

      if (error) throw error;

      return data || [];
    } catch (error) {
      const appError = ErrorHandler.fromSupabaseError(error);
      console.error("Error getting products:", appError);
      throw appError;
    }
  }

  // Crear producto
  async createProduct(productData: CreateProductData): Promise<string> {
    try {
      let imageUrl: string | undefined;

      // Subir imagen si se proporciona
      if (productData.image_file) {
        imageUrl = await storageService.uploadProductImage(
          productData.image_file
        );
      }

      // Crear producto
      const { data, error } = await supabase.rpc("create_product", {
        p_name: productData.name,
        p_category_id: productData.category_id,
        p_sale_price: productData.sale_price,
        p_unit_of_measure: productData.unit_of_measure,
        p_supplier_id: productData.supplier_id || null,
        p_can_be_sold_by_weight: productData.can_be_sold_by_weight || false,
        p_is_featured: productData.is_featured || false,
        p_image_url: imageUrl || null,
      });

      if (error) throw error;

      return data.product_id;
    } catch (error) {
      const appError = ErrorHandler.fromSupabaseError(error);
      console.error("Error creating product:", appError);
      throw appError;
    }
  }

  // Actualizar producto
  async updateProduct(
    productId: string,
    productData: UpdateProductData
  ): Promise<void> {
    try {
      let imageUrl: string | null = null;

      // Manejar imagen
      if (productData.remove_image) {
        imageUrl = null;
      } else if (productData.image_file) {
        imageUrl = await storageService.uploadProductImage(
          productData.image_file,
          productId
        );
      }

      // Actualizar producto
      const { error } = await supabase.rpc("update_product", {
        p_product_id: productId,
        p_name: productData.name || null,
        p_category_id: productData.category_id || null,
        p_sale_price: productData.sale_price || null,
        p_unit_of_measure: productData.unit_of_measure || null,
        p_supplier_id: productData.supplier_id || null,
        p_can_be_sold_by_weight: productData.can_be_sold_by_weight || null,
        p_is_featured: productData.is_featured || null,
        p_is_active: productData.is_active || null,
        p_image_url: imageUrl,
      });

      if (error) throw error;
    } catch (error) {
      const appError = ErrorHandler.fromSupabaseError(error);
      console.error("Error updating product:", appError);
      throw appError;
    }
  }

  // Toggle estado activo
  async toggleActive(productId: string, isActive: boolean): Promise<void> {
    try {
      const { error } = await supabase.rpc("toggle_product_active", {
        p_product_id: productId,
        p_is_active: isActive,
      });

      if (error) throw error;
    } catch (error) {
      const appError = ErrorHandler.fromSupabaseError(error);
      console.error("Error toggling product active:", appError);
      throw appError;
    }
  }

  // Toggle destacado
  async toggleFeatured(productId: string, isFeatured: boolean): Promise<void> {
    try {
      const { error } = await supabase.rpc("toggle_product_featured", {
        p_product_id: productId,
        p_is_featured: isFeatured,
      });

      if (error) throw error;
    } catch (error) {
      const appError = ErrorHandler.fromSupabaseError(error);
      console.error("Error toggling product featured:", appError);
      throw appError;
    }
  }

  // Obtener categorías
  async getCategories(): Promise<Category[]> {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("category_id, name")
        .order("name");

      if (error) throw error;

      return data || [];
    } catch (error) {
      const appError = ErrorHandler.fromSupabaseError(error);
      console.error("Error getting categories:", appError);
      throw appError;
    }
  }

  // Obtener proveedores
  async getSuppliers(): Promise<Supplier[]> {
    try {
      const { data, error } = await supabase
        .from("suppliers")
        .select("supplier_id, name, contact_info")
        .order("name");

      if (error) throw error;

      return data || [];
    } catch (error) {
      const appError = ErrorHandler.fromSupabaseError(error);
      console.error("Error getting suppliers:", appError);
      throw appError;
    }
  }
}

export const productService = new ProductService();
