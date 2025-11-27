// Tipos de dominio del negocio

// ============================================
// PRODUCTOS
// ============================================

export interface Product {
  product_id: string;
  name: string;
  category_id: string;
  category_name?: string;
  sale_price: number;
  unit_of_measure: string;
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
  image_file?: File;
  image_url?: string;
}

export interface UpdateProductData extends Partial<CreateProductData> {
  is_active?: boolean;
  remove_image?: boolean;
}

export interface ProductWithCategory {
  product_id: string;
  name: string;
  category_id: string;
  category_name: string | null;
  sale_price: number;
  unit_of_measure: "kg" | "pieza" | "rueda" | "bote" | "paquete";
  can_be_sold_by_weight: boolean;
  is_active: boolean;
  is_featured: boolean;
  image_url: string | null;
}

export interface Category {
  category_id: string;
  name: string;
}

export interface Supplier {
  supplier_id: string;
  name: string;
  contact_info?: string;
}

// ============================================
// INVENTARIO Y LOTES
// ============================================

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

export interface InventoryOverview {
  product_id: string;
  product_name: string;
  category_name: string | null;
  unit_of_measure: string;
  sale_price: number;
  total_stock: number;
  active_lots: number;
  avg_percentage_remaining: number;
  min_percentage_remaining: number;
  has_low_stock: boolean;
  has_near_expiry: boolean;
  category_id: string;
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

// ============================================
// GASTOS
// ============================================

export type ExpenseCategory =
  | "combustible"
  | "servicios"
  | "mantenimiento"
  | "compras_menores";

export type PaymentMethod = "efectivo" | "tarjeta" | "transferencia";

export interface ExpenseRequest {
  amount: number;
  description: string;
  category: ExpenseCategory;
  payment_method: PaymentMethod;
  expense_date?: string;
}

export interface Expense {
  expense_id: string;
  amount: number;
  description: string;
  category: ExpenseCategory;
  payment_method: PaymentMethod;
  expense_date: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  user_profiles?: {
    username: string;
  } | null;
}

export interface DailyCashFlow {
  date: string;
  sales: {
    total: number;
    cash: number;
    card: number;
    transfer: number;
    count: number;
  };
  expenses: {
    purchases: number;
    operations: number;
    total: number;
  };
  cash_flow: {
    in: number;
    out: number;
    net: number;
  };
  closure: {
    is_closed: boolean;
    starting_cash: number | null;
    ending_cash: number | null;
    difference: number | null;
    difference_type: "exact" | "surplus" | "deficit" | null;
  };
}
