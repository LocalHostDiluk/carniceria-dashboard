"use client";

import { useState } from "react";
import { DateRangePicker } from "@/components/reports/DateRangePicker";
import { FinancialKPICards } from "@/components/reports/FinancialKPICards";
import { SalesHistoryTable } from "@/components/reports/SalesHistoryTable";
import { ExpensesHistoryTable } from "@/components/reports/ExpensesHistoryTable";
import { ExportButton } from "@/components/reports/ExportButton";
import { reportsService } from "@/services/reportsService";
import type {
  DateRange,
  SaleRecord,
  ExpenseRecord,
  FinancialSummary,
} from "@/types/reports";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useAuthGuard } from "@/hooks/useAuthGuard";

export default function ReportsPage() {
  // Estados principales
  const { isAuthenticated, isLoading: authLoading } = useAuthGuard();
  const [isLoading, setIsLoading] = useState(false);
  const [currentRange, setCurrentRange] = useState<DateRange | null>(null);

  // Datos
  const [financialSummary, setFinancialSummary] =
    useState<FinancialSummary | null>(null);
  const [salesHistory, setSalesHistory] = useState<SaleRecord[]>([]);
  const [expensesHistory, setExpensesHistory] = useState<ExpenseRecord[]>([]);

  if (authLoading) {
    return <div className="p-4">Verificando sesión...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }
  const loadReports = async (range: DateRange) => {
    setIsLoading(true);
    setCurrentRange(range);

    try {
      const [summary, sales, expenses] = await Promise.all([
        reportsService.getFinancialSummary(range),
        reportsService.getSalesHistory(range),
        reportsService.getExpensesHistory(range),
      ]);

      setFinancialSummary(summary);
      setSalesHistory(sales);
      setExpensesHistory(expenses);
    } catch (error) {
      console.error("Error loading reports:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">📊 Reportes</h1>
            <p className="text-muted-foreground">
              Análisis financiero y historial de operaciones
            </p>
          </div>

          {/* Botones de exportación */}
          {currentRange && (
            <div className="flex gap-2">
              <ExportButton
                data={salesHistory}
                filename="ventas_historial"
                label="Ventas"
                disabled={isLoading}
              />
              <ExportButton
                data={expensesHistory}
                filename="gastos_historial"
                label="Gastos"
                disabled={isLoading}
              />
            </div>
          )}
        </div>

        {/* Selector de fechas */}
        <DateRangePicker
          onDateRangeChange={loadReports}
          isLoading={isLoading}
        />

        {/* KPIs financieros */}
        <FinancialKPICards summary={financialSummary} isLoading={isLoading} />

        {/* Historiales */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <SalesHistoryTable sales={salesHistory} isLoading={isLoading} />
          <ExpensesHistoryTable
            expenses={expensesHistory}
            isLoading={isLoading}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
