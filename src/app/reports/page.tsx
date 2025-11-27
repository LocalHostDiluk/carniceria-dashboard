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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // ✅ IMPORTAR TABS
import { ShoppingBag, Receipt } from "lucide-react"; // ✅ IMPORTAR ICONOS
import { ErrorHandler } from "@/lib/errorHandler";

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
      ErrorHandler.handle(error, "Cargar reportes");
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
            <h1 className="text-3xl font-bold">Reportes</h1>
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

        {/* ✅ AQUÍ CAMBIAMOS EL GRID POR TABS */}
        <Tabs defaultValue="sales" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="sales" className="gap-2">
              <ShoppingBag className="h-4 w-4" />
              Historial de Ventas
            </TabsTrigger>
            <TabsTrigger value="expenses" className="gap-2">
              <Receipt className="h-4 w-4" />
              Historial de Gastos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sales" className="space-y-4">
            <SalesHistoryTable sales={salesHistory} isLoading={isLoading} />
          </TabsContent>

          <TabsContent value="expenses" className="space-y-4">
            <ExpensesHistoryTable
              expenses={expensesHistory}
              isLoading={isLoading}
            />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
