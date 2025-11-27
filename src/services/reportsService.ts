import { supabase } from "@/lib/supabaseClient";
import { ErrorHandler } from "@/lib/errorHandler";
import type {
  DateRange,
  SaleRecord,
  ExpenseRecord,
  PurchaseRecord,
  FinancialSummary,
} from "@/types/reports";

class ReportsService {
  // 📈 OBTENER HISTORIAL DE VENTAS
  async getSalesHistory(range: DateRange): Promise<SaleRecord[]> {
    try {
      const { data, error } = await supabase.rpc("get_sales_history", {
        start_date: range.start_date,
        end_date: range.end_date,
      });

      if (error) throw error;

      return data || [];
    } catch (error) {
      const appError = ErrorHandler.fromSupabaseError(error);
      console.error("Error getting sales history:", appError);
      return [];
    }
  }

  // 💸 OBTENER HISTORIAL DE GASTOS
  async getExpensesHistory(range: DateRange): Promise<ExpenseRecord[]> {
    try {
      const { data, error } = await supabase.rpc("get_expenses_history", {
        start_date: range.start_date,
        end_date: range.end_date,
      });

      if (error) throw error;

      return data || [];
    } catch (error) {
      const appError = ErrorHandler.fromSupabaseError(error);
      console.error("Error getting expenses history:", appError);
      return [];
    }
  }

  // 🛒 OBTENER HISTORIAL DE COMPRAS
  async getPurchasesHistory(range: DateRange): Promise<PurchaseRecord[]> {
    try {
      const { data, error } = await supabase.rpc("get_purchases_history", {
        start_date: range.start_date,
        end_date: range.end_date,
      });

      if (error) throw error;

      return data || [];
    } catch (error) {
      const appError = ErrorHandler.fromSupabaseError(error);
      console.error("Error getting purchases history:", appError);
      return [];
    }
  }

  // 📊 OBTENER RESUMEN FINANCIERO
  async getFinancialSummary(
    range: DateRange
  ): Promise<FinancialSummary | null> {
    try {
      const { data, error } = await supabase.rpc("get_financial_summary", {
        start_date: range.start_date,
        end_date: range.end_date,
      });

      if (error) throw error;

      return data as FinancialSummary;
    } catch (error) {
      const appError = ErrorHandler.fromSupabaseError(error);
      console.error("Error getting financial summary:", appError);
      return null;
    }
  }

  // 📄 EXPORTAR A CSV
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  exportToCSV(data: any[], filename: string): void {
    if (!data || data.length === 0) {
      throw new Error("No hay datos para exportar");
    }

    // Obtener headers del primer objeto
    const headers = Object.keys(data[0]);

    // Crear contenido CSV
    const csvContent = [
      headers.join(","),
      ...data.map((row) =>
        headers
          .map((header) => {
            const value = row[header];
            // Escapar comillas y envolver en comillas si contiene comas
            if (
              typeof value === "string" &&
              (value.includes(",") || value.includes('"'))
            ) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value || "";
          })
          .join(",")
      ),
    ].join("\n");

    // Crear y descargar archivo
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `${filename}_${new Date().toISOString().split("T")[0]}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  // 🗓️ UTILIDADES DE FECHA
  getDateRange(
    type: "today" | "week" | "month" | "custom",
    customStart?: string,
    customEnd?: string
  ): DateRange {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    switch (type) {
      case "today":
        return { start_date: todayStr, end_date: todayStr };

      case "week":
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - 6);
        return {
          start_date: weekStart.toISOString().split("T")[0],
          end_date: todayStr,
        };

      case "month":
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        return {
          start_date: monthStart.toISOString().split("T")[0],
          end_date: todayStr,
        };

      case "custom":
        if (!customStart || !customEnd) {
          throw new Error(
            "Se requieren fechas de inicio y fin para rango personalizado"
          );
        }
        return { start_date: customStart, end_date: customEnd };

      default:
        return { start_date: todayStr, end_date: todayStr };
    }
  }
}

export const reportsService = new ReportsService();
