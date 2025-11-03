import { supabase } from "@/lib/supabaseClient";
import { ErrorHandler } from "@/lib/errorHandler";

// ===== TIPOS EXISTENTES =====
export interface InventoryOverview {
  product_id: string;
  product_name: string;
  category_name: string;
  sale_price: number;
  unit_of_measure: string;
  total_stock: number;
  active_lots: number;
  avg_percentage_remaining: number;
  min_percentage_remaining: number;
  has_low_stock: boolean;
  has_near_expiry: boolean;
}

export interface InventoryAlert {
  alert_type: "low_stock" | "near_expiry";
  lot_id: string;
  product_id: string;
  product_name: string;
  category_name: string;
  stock_quantity: number;
  expiration_date: string;
  days_until_expiry: number;
}

// ===== NUEVOS TIPOS PARA CRUD =====
export interface Product {
  product_id: string;
  name: string;
  category_id: string;
  category_name?: string;
  sale_price: number;
  unit_of_measure: "kg" | "pieza" | "rueda" | "bote" | "paquete";
  supplier_id?: string;
  supplier_name?: string;
  can_be_sold_by_weight: boolean;
  is_active: boolean;
  is_featured: boolean;
  image_url?: string;
  created_at: string;
  updated_at: string;
  total_stock?: number;
  active_lots?: number;
}

export interface CreateProductData {
  name: string;
  category_id: string;
  sale_price: number;
  unit_of_measure: "kg" | "pieza" | "rueda" | "bote" | "paquete";
  supplier_id?: string;
  can_be_sold_by_weight?: boolean;
  is_featured?: boolean;
  image_url?: string;
}

export interface UpdateProductData {
  name?: string;
  category_id?: string;
  sale_price?: number;
  unit_of_measure?: "kg" | "pieza" | "rueda" | "bote" | "paquete";
  supplier_id?: string;
  can_be_sold_by_weight?: boolean;
  is_featured?: boolean;
  is_active?: boolean;
  image_url?: string;
}

export interface Category {
  category_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Supplier {
  supplier_id: string;
  name: string;
  contact_info?: string;
  created_at: string;
  updated_at: string;
}

export class InventoryService {
  // ===== FUNCIONES EXISTENTES =====
  async getInventoryOverview(): Promise<InventoryOverview[]> {
    const { data, error } = await supabase.rpc("get_inventory_overview");

    if (error) {
      console.error("Error fetching inventory overview:", error);
      throw new Error("Error al cargar resumen de inventario");
    }

    return data || [];
  }

  async getInventoryAlerts(
    lowStockThreshold: number = 5,
    daysToExpiry: number = 7
  ): Promise<InventoryAlert[]> {
    const { data, error } = await supabase.rpc("get_inventory_alerts", {
      low_stock_threshold: lowStockThreshold,
      days_to_expiry: daysToExpiry,
    });

    if (error) {
      console.error("Error fetching inventory alerts:", error);
      throw new Error("Error al cargar alertas de inventario");
    }

    return data || [];
  }

  getInventoryKPIs(overview: InventoryOverview[]) {
    const totalProducts = overview.length;
    const lowStockProducts = overview.filter((p) => p.has_low_stock).length;
    const nearExpiryProducts = overview.filter((p) => p.has_near_expiry).length;
    const totalLots = overview.reduce((sum, p) => sum + p.active_lots, 0);
    const avgStockPercentage =
      overview.length > 0
        ? overview.reduce((sum, p) => sum + p.avg_percentage_remaining, 0) /
          overview.length
        : 0;

    return {
      totalProducts,
      lowStockProducts,
      nearExpiryProducts,
      totalLots,
      avgStockPercentage: Math.round(avgStockPercentage),
    };
  }

  // ===== NUEVAS FUNCIONES CRUD =====

  // 📋 OBTENER LISTA COMPLETA DE PRODUCTOS
  async getProductsList(): Promise<Product[]> {
    try {
      const { data, error } = await supabase.rpc("get_products_list");

      if (error) throw error;

      return data || [];
    } catch (error) {
      const appError = ErrorHandler.fromSupabaseError(error);
      console.error("Error getting products list:", appError);
      throw new Error("Error al cargar lista de productos");
    }
  }

  // ➕ CREAR PRODUCTO
  async createProduct(productData: CreateProductData): Promise<string> {
    try {
      const { data, error } = await supabase.rpc("create_product", {
        p_name: productData.name,
        p_category_id: productData.category_id,
        p_sale_price: productData.sale_price,
        p_unit_of_measure: productData.unit_of_measure,
        p_supplier_id: productData.supplier_id || null,
        p_can_be_sold_by_weight: productData.can_be_sold_by_weight || false,
        p_is_featured: productData.is_featured || false,
        p_image_url: productData.image_url || null,
      });

      if (error) throw error;

      return data.product_id;
    } catch (error) {
      const appError = ErrorHandler.fromSupabaseError(error);
      console.error("Error creating product:", appError);
      throw new Error("Error al crear producto");
    }
  }

  // ✏️ ACTUALIZAR PRODUCTO
  async updateProduct(
    productId: string,
    productData: UpdateProductData
  ): Promise<void> {
    try {
      const { data, error } = await supabase.rpc("update_product", {
        p_product_id: productId,
        p_name: productData.name || null,
        p_category_id: productData.category_id || null,
        p_sale_price: productData.sale_price || null,
        p_unit_of_measure: productData.unit_of_measure || null,
        p_supplier_id: productData.supplier_id || null,
        p_can_be_sold_by_weight: productData.can_be_sold_by_weight || null,
        p_is_featured: productData.is_featured || null,
        p_is_active: productData.is_active || null,
        p_image_url: productData.image_url || null,
      });

      if (error) throw error;
    } catch (error) {
      const appError = ErrorHandler.fromSupabaseError(error);
      console.error("Error updating product:", appError);
      throw new Error("Error al actualizar producto");
    }
  }

  // 🔄 TOGGLE ACTIVO
  async toggleProductActive(
    productId: string,
    isActive: boolean
  ): Promise<void> {
    try {
      const { data, error } = await supabase.rpc("toggle_product_active", {
        p_product_id: productId,
        p_is_active: isActive,
      });

      if (error) throw error;
    } catch (error) {
      const appError = ErrorHandler.fromSupabaseError(error);
      console.error("Error toggling product active:", appError);
      throw new Error("Error al cambiar estado del producto");
    }
  }

  // ⭐ TOGGLE DESTACADO
  async toggleProductFeatured(
    productId: string,
    isFeatured: boolean
  ): Promise<void> {
    try {
      const { data, error } = await supabase.rpc("toggle_product_featured", {
        p_product_id: productId,
        p_is_featured: isFeatured,
      });

      if (error) throw error;
    } catch (error) {
      const appError = ErrorHandler.fromSupabaseError(error);
      console.error("Error toggling product featured:", appError);
      throw new Error("Error al cambiar estado destacado del producto");
    }
  }

  // 📂 OBTENER CATEGORÍAS
  async getCategories(): Promise<Category[]> {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");

      if (error) throw error;

      return data || [];
    } catch (error) {
      const appError = ErrorHandler.fromSupabaseError(error);
      console.error("Error getting categories:", appError);
      throw new Error("Error al cargar categorías");
    }
  }

  // 🏪 OBTENER PROVEEDORES
  async getSuppliers(): Promise<Supplier[]> {
    try {
      const { data, error } = await supabase
        .from("suppliers")
        .select("*")
        .order("name");

      if (error) throw error;

      return data || [];
    } catch (error) {
      const appError = ErrorHandler.fromSupabaseError(error);
      console.error("Error getting suppliers:", appError);
      throw new Error("Error al cargar proveedores");
    }
  }
}

export const inventoryService = new InventoryService();
