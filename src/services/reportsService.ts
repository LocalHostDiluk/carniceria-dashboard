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
      ErrorHandler.handle(error, "Obtener historial de ventas");
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
      ErrorHandler.handle(error, "Obtener historial de gastos");
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
      ErrorHandler.handle(error, "Obtener historial de compras");
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
      ErrorHandler.handle(error, "Obtener resumen financiero");
      return null;
    }
  }

  // 📈 NUEVO: Obtener ventas diarias para gráfica (últimos 30 días)
  async getDailySalesChart(days = 30) {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - days);

      const { data, error } = await supabase
        .from("sales")
        .select("sale_date, total_amount")
        .gte("sale_date", startDate.toISOString())
        .lte("sale_date", endDate.toISOString())
        .order("sale_date", { ascending: true });

      if (error) throw error;

      // Agrupar por día (Formato local MX)
      const grouped = (data || []).reduce((acc: any, curr) => {
        const date = new Date(curr.sale_date).toLocaleDateString("es-MX", {
          month: "short",
          day: "numeric",
        });
        acc[date] = (acc[date] || 0) + curr.total_amount;
        return acc;
      }, {});

      // Convertir a array para Recharts
      return Object.entries(grouped).map(([date, total]) => ({
        date,
        total,
      }));
    } catch (error) {
      ErrorHandler.handle(error, "Obtener gráfica de tendencia");
      return [];
    }
  }

  // 🥧 NUEVO: Obtener ventas por categoría (Pie Chart)
  async getSalesByCategoryChart(range: DateRange) {
    try {
      // Nota: Ajustamos para usar el rango de strings que manejas (YYYY-MM-DD)
      const startISO = new Date(range.start_date).toISOString();
      const endISO = new Date(range.end_date).toISOString();

      const { data, error } = await supabase
        .from("sale_details")
        .select(
          `
          price_at_sale,
          quantity_sold,
          products!inner (
            categories!inner ( name )
          )
        `
        )
        .gte("created_at", startISO)
        .lte("created_at", endISO);

      if (error) throw error;

      // Agrupar por categoría
      const grouped = (data || []).reduce((acc: any, curr: any) => {
        const category = curr.products?.categories?.name || "Sin Categoría";
        const amount = curr.price_at_sale * curr.quantity_sold;
        acc[category] = (acc[category] || 0) + amount;
        return acc;
      }, {});

      // Formatear para Recharts y ordenar
      return Object.entries(grouped)
        .map(([name, value]) => ({ name, value }))
        .sort((a: any, b: any) => b.value - a.value);
    } catch (error) {
      ErrorHandler.handle(error, "Obtener gráfica de categorías");
      return [];
    }
  }

  // 📄 EXPORTAR A CSV
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  exportToCSV(data: any[], filename: string): void {
    if (!data || data.length === 0) {
      throw new Error("No hay datos para exportar");
    }

    const headers = Object.keys(data[0]);

    const csvContent = [
      headers.join(","),
      ...data.map((row) =>
        headers
          .map((header) => {
            const value = row[header];
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
