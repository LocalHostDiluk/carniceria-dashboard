import { supabase } from "@/lib/supabaseClient";
import type { Database } from "@/types/supabase";

// Tipos base
export type ProductRow = Database["public"]["Tables"]["products"]["Row"];
export type CategoryRow = Database["public"]["Tables"]["categories"]["Row"];
export type InventoryLotRow =
  Database["public"]["Tables"]["inventory_lots"]["Row"];

// Tipos extendidos
export type ProductWithCategory = ProductRow & {
  categories: CategoryRow | null;
};
export type ProductWithLots = ProductRow & {
  inventory_lots: InventoryLotRow[] | null;
  categories: CategoryRow | null;
};

/**
 * ✅ Obtiene todos los productos activos con su categoría
 */
export const getActiveProducts = async (): Promise<ProductWithCategory[]> => {
  const { data, error } = await supabase
    .from("products")
    .select(
      `
      *,
      categories ( * )
    `
    )
    .eq("is_active", true);

  if (error) {
    console.error("Error fetching active products:", error);
    throw new Error("No se pudieron cargar los productos.");
  }
  return data as ProductWithCategory[];
};

/**
 * ✅ Obtiene todo el inventario (productos con sus lotes)
 */
export const getInventory = async (): Promise<ProductWithLots[]> => {
  const { data, error } = await supabase
    .from("products")
    .select(
      `
      *,
      categories ( name ),
      inventory_lots ( * )
    `
    )
    .eq("is_active", true);

  if (error) {
    console.error("Error fetching inventory:", error);
    throw new Error("No se pudo cargar el inventario.");
  }

  return data as ProductWithLots[];
};
