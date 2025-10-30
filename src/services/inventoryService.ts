import { supabase } from "@/lib/supabaseClient";

// Tipos para el resumen de inventario
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

// Tipos para alertas
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

export class InventoryService {
  // Obtener resumen completo del inventario
  async getInventoryOverview(): Promise<InventoryOverview[]> {
    const { data, error } = await supabase.rpc("get_inventory_overview");

    if (error) {
      console.error("Error fetching inventory overview:", error);
      throw new Error("Error al cargar resumen de inventario");
    }

    return data || [];
  }

  // Obtener alertas de inventario
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

  // Obtener KPIs rápidos del inventario
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
}

export const inventoryService = new InventoryService();
