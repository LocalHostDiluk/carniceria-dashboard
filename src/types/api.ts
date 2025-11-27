// Tipos de API, requests y responses

import type { CartItem } from "@/components/sales/TicketItem";
import type { DailyCashFlow } from "./models";

// ============================================
// VENTAS
// ============================================

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

// ============================================
// CAJA
// ============================================

export interface CashClosureRequest {
  starting_cash: number;
  ending_cash: number;
  notes?: string;
}

export interface CashClosureResult {
  success: boolean;
  session_id?: string;
  date: string;
  cash_flow: {
    starting_cash: number;
    cash_in: number;
    cash_out: number;
    expected_ending: number;
    actual_ending: number;
    difference: number;
  };
  breakdown: {
    sales_cash: number;
    purchases_cash: number;
    expenses_cash: number;
  };
  difference_type: "surplus" | "deficit" | "exact";
  message: string;
}

export interface CashSession {
  session_id: string;
  user_id: string;
  start_time: string;
  end_time?: string | null;
  starting_cash: number;
  ending_cash?: number | null;
  calculated_sales?: number | null;
  difference?: number | null;
  notes?: string | null;
  session_date: string;
  user_profiles: {
    username: string;
  } | null;
}

// ============================================
// DASHBOARD
// ============================================

export interface DashboardKpis {
  total_sales_today: number;
  transaction_count_today: number;
  average_ticket_today: number;
  low_stock_products_count: number;
}

export interface DailySale {
  sale_day: string;
  total: number;
}

// Re-export DailyCashFlow for convenience
export type { DailyCashFlow };
