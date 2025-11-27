// Tipos específicos de reportes

// ============================================
// REPORTES
// ============================================

export interface DateRange {
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
}

export interface SaleRecord {
  sale_id: string;
  date: string;
  time: string;
  total_amount: number;
  payment_method: string;
  user: string;
  items_count: number;
  products: Array<{
    name: string;
    quantity: number;
    price: number;
    subtotal: number;
    unit: string;
  }>;
}

export interface ExpenseRecord {
  expense_id: string;
  date: string;
  time: string;
  amount: number;
  description: string;
  category: string;
  payment_method: string;
  user: string;
}

export interface PurchaseRecord {
  purchase_id: string;
  date: string;
  time: string;
  total_cost: number;
  supplier: string;
  payment_method: string;
  user: string;
  lots_count: number;
}

export interface FinancialSummary {
  period: {
    start_date: string;
    end_date: string;
    days: number;
  };
  sales: {
    total: number;
    by_method: Record<string, number>;
    average_daily: number;
  };
  costs: {
    purchases: number;
    expenses: number;
    total: number;
  };
  profit: {
    gross: number;
    net: number;
    margin_percentage: number;
  };
}
