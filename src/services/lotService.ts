import { supabase } from "@/lib/supabaseClient";
import { ErrorHandler } from "@/lib/errorHandler";

import type { Product } from "./productService";

// Tipos para lotes
export interface InventoryLot {
  lot_id: string;
  stock_quantity: number;
  initial_quantity: number;
  purchase_price: number;
  expiration_date: string | null;
  purchase_id: string;
  supplier_name: string | null;
  purchase_date: string;
  created_at: string;
  days_until_expiry: number | null;
  percentage_remaining: number;
  status:
    | "normal"
    | "stock_bajo"
    | "próximo_a_caducar"
    | "caducado"
    | "agotado";
}

export interface CreateLotData {
  product_id: string;
  stock_quantity: number;
  purchase_price: number;
  purchase_id: string;
  expiration_date?: string;
}

export interface InventoryAdjustment {
  adjustment_id: string;
  lot_id: string;
  product_name: string;
  quantity: number;
  reason: "merma" | "caducado" | "daño" | "ajuste manual";
  user: string;
  adjustment_date: string;
  stock_before: number;
  stock_after: number;
}

// ✅ EXPORTAR: Re-exportar Product para que ProductLotsModal pueda importarlo
export type { Product };

export class LotService {
  // Crear nuevo lote
  async createLot(lotData: CreateLotData): Promise<string> {
    try {
      const { data, error } = await supabase.rpc("create_inventory_lot", {
        p_product_id: lotData.product_id,
        p_stock_quantity: lotData.stock_quantity,
        p_purchase_price: lotData.purchase_price,
        p_purchase_id: lotData.purchase_id,
        p_expiration_date: lotData.expiration_date || null,
      });

      if (error) throw error;

      return data.lot_id;
    } catch (error) {
      const appError = ErrorHandler.fromSupabaseError(error);
      console.error("Error creating lot:", appError);
      throw appError;
    }
  }

  // Obtener lotes de un producto
  async getProductLots(productId: string): Promise<InventoryLot[]> {
    try {
      const { data, error } = await supabase.rpc("get_product_lots", {
        p_product_id: productId,
      });

      if (error) throw error;

      return data || [];
    } catch (error) {
      const appError = ErrorHandler.fromSupabaseError(error);
      console.error("Error getting product lots:", appError);
      throw appError;
    }
  }

  // Ajustar inventario
  async adjustLot(
    lotId: string,
    quantity: number,
    reason: string
  ): Promise<void> {
    try {
      
      const { error } = await supabase.rpc("adjust_inventory_lot", {
        p_lot_id: lotId,
        p_quantity: quantity,
        p_reason: reason,
      });

      if (error) throw error;
    } catch (error) {
      const appError = ErrorHandler.fromSupabaseError(error);
      console.error("Error adjusting lot:", appError);
      throw appError;
    }
  }

  // Obtener historial de ajustes
  async getAdjustments(
    productId?: string,
    limit: number = 50
  ): Promise<InventoryAdjustment[]> {
    try {
      const { data, error } = await supabase.rpc("get_inventory_adjustments", {
        p_product_id: productId || null,
        p_limit: limit,
      });

      if (error) throw error;

      return data || [];
    } catch (error) {
      const appError = ErrorHandler.fromSupabaseError(error);
      console.error("Error getting adjustments:", appError);
      throw appError;
    }
  }

  // Obtener lista de compras para crear lotes
  async getPurchases(): Promise<
    Array<{
      purchase_id: string;
      supplier_name: string;
      purchase_date: string;
      total_cost: number;
    }>
  > {
    try {
      const { data, error } = await supabase
        .from("purchases")
        .select(
          `
          purchase_id,
          total_cost,
          purchase_date,
          suppliers:supplier_id ( name )
        `
        )
        .order("purchase_date", { ascending: false })
        .limit(50);

      if (error) throw error;

      return (data || []).map((p: any) => ({
        purchase_id: p.purchase_id,
        supplier_name: p.suppliers?.name || "Sin proveedor",
        purchase_date: p.purchase_date,
        total_cost: Number(p.total_cost),
      }));
    } catch (error) {
      const appError = ErrorHandler.fromSupabaseError(error);
      console.error("Error getting purchases:", appError);
      throw appError;
    }
  }
}

export const lotService = new LotService();
