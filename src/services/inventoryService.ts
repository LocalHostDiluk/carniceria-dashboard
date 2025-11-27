import { supabase } from "@/lib/supabaseClient";
import { ErrorHandler } from "@/lib/errorHandler";
import type {
  InventoryOverview,
  InventoryAlert,
  Product,
  CreateProductData,
  UpdateProductData,
  Category,
  Supplier,
} from "@/types/models";

export interface InventoryFilters {
  search?: string;
  status?: "all" | "low_stock" | "near_expiry" | "ok";
  categoryId?: string;
}

export class InventoryService {
  // 📋 OBTENER RESUMEN DE INVENTARIO CON FILTROS Y PAGINACIÓN
  async getInventoryOverview(page = 1, limit = 20, filters?: InventoryFilters) {
    try {
      // 1. Obtener todos los datos brutos
      const { data, error } = await supabase.rpc("get_inventory_overview");

      if (error) throw error;

      let filteredData = (data || []) as InventoryOverview[];

      // 2. Aplicar filtros en memoria
      if (filters) {
        // Filtro de Búsqueda
        if (filters.search) {
          const term = filters.search.toLowerCase();
          filteredData = filteredData.filter(
            (p) =>
              p.product_name.toLowerCase().includes(term) ||
              p.category_name?.toLowerCase().includes(term)
          );
        }

        // Filtro de Categoría
        if (filters.categoryId && filters.categoryId !== "all") {
          filteredData = filteredData.filter(
            (p) => p.category_id === filters.categoryId
          );
        }

        // Filtro de Estado
        if (filters.status && filters.status !== "all") {
          switch (filters.status) {
            case "low_stock":
              filteredData = filteredData.filter((p) => p.has_low_stock);
              break;
            case "near_expiry":
              filteredData = filteredData.filter((p) => p.has_near_expiry);
              break;
            case "ok":
              filteredData = filteredData.filter(
                (p) => !p.has_low_stock && !p.has_near_expiry
              );
              break;
          }
        }
      }

      // 3. Ordenamiento Inteligente
      if (!filters?.status || filters.status === "all") {
        filteredData.sort((a, b) => {
          // Primero por caducar
          if (a.has_near_expiry !== b.has_near_expiry) {
            return a.has_near_expiry ? -1 : 1;
          }
          // Luego stock bajo
          if (a.has_low_stock !== b.has_low_stock) {
            return a.has_low_stock ? -1 : 1;
          }
          // Finalmente alfabético
          return a.product_name.localeCompare(b.product_name);
        });
      } else {
        filteredData.sort((a, b) =>
          a.product_name.localeCompare(b.product_name)
        );
      }

      // 4. Paginación Manual
      const total = filteredData.length;
      const totalPages = Math.ceil(total / limit);
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedData = filteredData.slice(startIndex, endIndex);

      return {
        data: paginatedData,
        total,
        page,
        limit,
        totalPages,
      };
    } catch (error) {
      ErrorHandler.handle(error, "Obtener resumen de inventario");
      return { data: [], total: 0, page: 1, limit, totalPages: 0 };
    }
  }

  // 🔔 OBTENER ALERTAS
  async getInventoryAlerts(
    lowStockThreshold: number = 5,
    daysToExpiry: number = 7
  ): Promise<InventoryAlert[]> {
    try {
      const { data, error } = await supabase.rpc("get_inventory_alerts", {
        low_stock_threshold: lowStockThreshold,
        days_to_expiry: daysToExpiry,
      });

      if (error) throw error;

      return data || [];
    } catch (error) {
      ErrorHandler.handle(error, "Obtener alertas de inventario");
      return [];
    }
  }

  // 📊 CALCULAR KPIs
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

  // ===== FUNCIONES CRUD =====

  // 📋 OBTENER LISTA COMPLETA DE PRODUCTOS
  async getProductsList(): Promise<Product[]> {
    try {
      const { data, error } = await supabase.rpc("get_products_list");

      if (error) throw error;

      return data || [];
    } catch (error) {
      ErrorHandler.handle(error, "Obtener lista de productos");
      return [];
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
      throw ErrorHandler.handle(error, "Crear producto");
    }
  }

  // ✏️ ACTUALIZAR PRODUCTO
  async updateProduct(
    productId: string,
    productData: UpdateProductData
  ): Promise<void> {
    try {
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
        p_image_url: productData.image_url || null,
      });

      if (error) throw error;
    } catch (error) {
      throw ErrorHandler.handle(error, "Actualizar producto");
    }
  }

  // 🔄 TOGGLE ACTIVO
  async toggleProductActive(
    productId: string,
    isActive: boolean
  ): Promise<void> {
    try {
      const { error } = await supabase.rpc("toggle_product_active", {
        p_product_id: productId,
        p_is_active: isActive,
      });

      if (error) throw error;
    } catch (error) {
      throw ErrorHandler.handle(error, "Cambiar estado del producto");
    }
  }

  // ⭐ TOGGLE DESTACADO
  async toggleProductFeatured(
    productId: string,
    isFeatured: boolean
  ): Promise<void> {
    try {
      const { error } = await supabase.rpc("toggle_product_featured", {
        p_product_id: productId,
        p_is_featured: isFeatured,
      });

      if (error) throw error;
    } catch (error) {
      throw ErrorHandler.handle(error, "Cambiar estado destacado");
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
      ErrorHandler.handle(error, "Obtener categorías");
      return [];
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
      ErrorHandler.handle(error, "Obtener proveedores");
      return [];
    }
  }
}

export const inventoryService = new InventoryService();
