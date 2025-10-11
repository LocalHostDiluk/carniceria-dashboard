// src/services/dashboardService.ts
import { supabase } from "@/lib/supabaseClient";

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
    console.error("Error fetching dashboard KPIs:", error);
    throw new Error("No se pudieron cargar las métricas del dashboard.");
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
    console.error("Error fetching daily sales:", error);
    throw new Error("No se pudieron cargar los datos de ventas.");
  }
  return data;
};

