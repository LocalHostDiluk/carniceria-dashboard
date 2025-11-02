import { supabase } from "@/lib/supabaseClient";
import type { CartItem } from "@/components/sales/TicketItem";

export interface SaleProcessRequest {
  items: CartItem[];
  paymentMethod: "efectivo" | "tarjeta" | "transferencia";
  total: number;
}

export interface SaleProcessResult {
  success: boolean;
  saleId?: string;
  message: string;
  errors?: string[];
}

export interface SaleValidationError {
  productId: string;
  productName: string;
  error: string;
  availableStock?: number;
}

class SalesService {
  // Procesar una venta completa
  async processSale(request: SaleProcessRequest): Promise<SaleProcessResult> {
    try {
      // 1. Validar stock disponible para todos los productos
      const validationResult = await this.validateStock(request.items);
      if (!validationResult.isValid) {
        return {
          success: false,
          message: "Error de validación de stock",
          errors: validationResult.errors.map(
            (e) => `${e.productName}: ${e.error}`
          ),
        };
      }

      // 2. Procesar la venta en una transacción
      const result = await this.executeSaleTransaction(request);

      return result;
    } catch (error) {
      console.error("Error processing sale:", error);
      return {
        success: false,
        message: "Error inesperado al procesar la venta",
      };
    }
  }

  // Validar que hay stock suficiente para todos los productos
  private async validateStock(items: CartItem[]): Promise<{
    isValid: boolean;
    errors: SaleValidationError[];
  }> {
    const errors: SaleValidationError[] = [];

    for (const item of items) {
      // Obtener stock disponible del producto
      const { data: lots, error } = await supabase
        .from("inventory_lots")
        .select("stock_quantity, expiration_date")
        .eq("product_id", item.product_id)
        .gt("stock_quantity", 0)
        .order("expiration_date", { ascending: true });

      if (error) {
        errors.push({
          productId: item.product_id,
          productName: item.name,
          error: "Error al verificar stock",
        });
        continue;
      }

      const totalAvailableStock =
        lots?.reduce((sum, lot) => sum + lot.stock_quantity, 0) || 0;

      if (totalAvailableStock < item.quantity) {
        errors.push({
          productId: item.product_id,
          productName: item.name,
          error: `Stock insuficiente. Disponible: ${totalAvailableStock}`,
          availableStock: totalAvailableStock,
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Ejecutar la transacción de venta
  private async executeSaleTransaction(
    request: SaleProcessRequest
  ): Promise<SaleProcessResult> {
    // Usar RPC para transacción atómica
    const { data, error } = await supabase.rpc("process_sale", {
      sale_items: request.items.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.price,
      })),
      payment_method: request.paymentMethod,
      total_amount: request.total,
    });

    if (error) {
      console.error("Error in sale transaction:", error);
      return {
        success: false,
        message:
          "Error al procesar la venta: " +
          (error?.message || "Error desconocido"),
      };
    }

    return {
      success: true,
      saleId: data?.sale_id || undefined,
      message: "¡Venta procesada exitosamente!",
    };
  }

  // Obtener ventas recientes
  async getRecentSales(limit: number = 10) {
    const { data, error } = await supabase
      .from("sales")
      .select(
        `
        sale_id,
        total_amount,
        payment_method,
        created_at,
        sale_details (
          quantity,
          unit_price,
          products (
            name
          )
        )
      `
      )
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching recent sales:", error);
      throw error;
    }

    return data || [];
  }
}

export const salesService = new SalesService();
