import { supabase } from "@/lib/supabaseClient";
import { ErrorHandler } from "@/lib/errorHandler";

export interface PurchaseItem {
  product_id: string;
  quantity: number;
  unit_cost: number;
  expiration_date?: string;
}

export interface CreatePurchaseData {
  supplier_id: string;
  payment_method: "efectivo" | "tarjeta" | "transferencia";
  items: PurchaseItem[];
  notes?: string;
}

export interface Purchase {
  purchase_id: string;
  supplier_id: string;
  total_cost: number;
  purchase_date: string;
  payment_method: string;
  supplier_name?: string;
  user_name?: string;
  items_count?: number;
}

export class PurchaseService {
  // Obtener historial de compras
  async getPurchases(page = 1, limit = 20) {
    try {
      const offset = (page - 1) * limit;

      const { data, error, count } = await supabase
        .from("purchases")
        .select(
          `
          *,
          suppliers ( name ),
          user_profiles ( username ),
          inventory_lots ( count )
        `,
          { count: "exact" }
        )
        .order("purchase_date", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return {
        data: (data || []).map((p: any) => ({
          ...p,
          supplier_name: p.suppliers?.name,
          user_name: p.user_profiles?.username,
          items_count: p.inventory_lots?.[0]?.count || 0, // Supabase devuelve array de objetos count
        })) as Purchase[],
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
      };
    } catch (error) {
      throw ErrorHandler.handle(error, "Obtener compras");
    }
  }

  // Crear una nueva compra con sus lotes
  async createPurchase(data: CreatePurchaseData) {
    try {
      // 1. Calcular costo total
      const totalCost = data.items.reduce(
        (sum, item) => sum + item.quantity * item.unit_cost,
        0
      );

      // 2. Insertar la cabecera de la compra
      const { data: purchase, error: purchaseError } = await supabase
        .from("purchases")
        .insert({
          supplier_id: data.supplier_id,
          payment_method: data.payment_method,
          total_cost: totalCost,
          user_id: (await supabase.auth.getUser()).data.user?.id,
        })
        .select()
        .single();

      if (purchaseError) throw purchaseError;

      // 3. Preparar los lotes (items de la compra)
      const lotsToInsert = data.items.map((item) => ({
        purchase_id: purchase.purchase_id,
        product_id: item.product_id,
        stock_quantity: item.quantity, // Stock actual
        initial_quantity: item.quantity, // Stock inicial (para referencias)
        purchase_price: item.unit_cost,
        expiration_date: item.expiration_date || null,
      }));

      // 4. Insertar los lotes
      const { error: lotsError } = await supabase
        .from("inventory_lots")
        .insert(lotsToInsert);

      if (lotsError) {
        // Si falla la inserción de lotes, deberíamos intentar borrar la compra (rollback manual)
        await supabase
          .from("purchases")
          .delete()
          .eq("purchase_id", purchase.purchase_id);
        throw lotsError;
      }

      return purchase;
    } catch (error) {
      throw ErrorHandler.handle(error, "Registrar compra");
    }
  }

  // Obtener detalles de una compra específica
  async getPurchaseDetails(purchaseId: string) {
    try {
      const { data, error } = await supabase
        .from("inventory_lots")
        .select(
          `
          lot_id,
          stock_quantity,
          initial_quantity,
          purchase_price,
          expiration_date,
          products ( name, unit_of_measure )
        `
        )
        .eq("purchase_id", purchaseId);

      if (error) throw error;

      return data.map((item: any) => ({
        lot_id: item.lot_id,
        product_name: item.products?.name,
        unit: item.products?.unit_of_measure,
        quantity: item.initial_quantity, // Mostramos lo que se compró originalmente
        unit_price: item.purchase_price,
        total: item.initial_quantity * item.purchase_price,
        expiration: item.expiration_date,
      }));
    } catch (error) {
      throw ErrorHandler.handle(error, "Obtener detalles de compra");
    }
  }
}

export const purchaseService = new PurchaseService();
