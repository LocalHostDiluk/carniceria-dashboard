// src/services/dashboardService.ts
import { supabase } from "@/lib/supabaseClient";
import { ErrorHandler } from "@/lib/errorHandler";
import type { DashboardKpis, DailySale } from "@/types/api";

export const fetchDashboardKpis = async (): Promise<DashboardKpis> => {
  // 'rpc' es la forma de llamar a una función de base de datos en Supabase
  const { data, error } = await supabase.rpc("get_dashboard_kpis");

  if (error) {
    throw ErrorHandler.fromSupabaseError(error);
  }

  // La función devuelve un array, tomamos el primer (y único) resultado
  return data[0];
};
