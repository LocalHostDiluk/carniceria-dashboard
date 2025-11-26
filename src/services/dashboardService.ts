// src/services/dashboardService.ts
import { supabase } from "@/lib/supabaseClient";
import { ErrorHandler } from "@/lib/errorHandler";

export interface DashboardKpis {
  total_sales_today: number;
  transaction_count_today: number;
  average_ticket_today: number;
  low_stock_products_count: number;
}

export const fetchDashboardKpis = async (): Promise<DashboardKpis> => {
  // 'rpc' es la forma de llamar a una función de base de datos en Supabase
  const { data, error } = await supabase.rpc("get_dashboard_kpis");

  if (error) {
    throw ErrorHandler.fromSupabaseError(error);
  }

  // La función devuelve un array, tomamos el primer (y único) resultado
  return data[0];
};

export interface DailySale {
  sale_day: string;
  total: number;
}

export const fetchDailySales = async (): Promise<DailySale[]> => {
  const { data, error } = await supabase.rpc("get_daily_sales_last_7_days");

  if (error) {
    throw ErrorHandler.fromSupabaseError(error);
  }
  return data;
};

