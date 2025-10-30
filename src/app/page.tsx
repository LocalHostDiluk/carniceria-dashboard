// src/app/page.tsx
"use client";
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Package, CreditCard, AlertCircle } from "lucide-react";
import {
  fetchDashboardKpis,
  type DashboardKpis,
  fetchDailySales,
  type DailySale,
} from "@/services/dashboardService";
import { KpiCardSkeleton } from "@/components/dashboard/KpiCardSkeleton";
import { SalesChart } from "@/components/dashboard/SalesChart";
import { ChartSkeleton } from "@/components/dashboard/ChartSkeleton";
import { useAuthGuard } from "@/hooks/useAuthGuard";

export default function HomePage() {
  const { isAuthenticated, isLoading: authLoading } = useAuthGuard();
  const [kpis, setKpis] = useState<DashboardKpis | null>(null);
  const [salesData, setSalesData] = useState<DailySale[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        const [kpisData, dailySalesData] = await Promise.all([
          fetchDashboardKpis(),
          fetchDailySales(),
        ]);
        setKpis(kpisData);
        setSalesData(dailySalesData);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Solo cargar datos SI está autenticado
    if (isAuthenticated) {
      loadDashboardData();
    }
  }, [isAuthenticated]); // Depende de isAuthenticated

  if (authLoading) {
    return <div className="p-4">Verificando sesión...</div>;
  }

  if (!isAuthenticated) {
    return null; // Se está redirigiendo
  }

  // ✅ Formatters (pueden ir donde quieras)
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount);
  };

  return (
    <DashboardLayout>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Dashboard</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        {isLoading ? (
          <>
            <KpiCardSkeleton />
            <KpiCardSkeleton />
            <KpiCardSkeleton />
            <KpiCardSkeleton />
          </>
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Ventas de Hoy
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(kpis?.total_sales_today || 0)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Transacciones
                </CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  +{kpis?.transaction_count_today || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Ticket Promedio
                </CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(kpis?.average_ticket_today || 0)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Bajo Stock
                </CardTitle>
                <AlertCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {kpis?.low_stock_products_count || 0} productos
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <div className="grid gap-4 md:gap-8 lg:grid-cols-1 mt-8">
        {isLoading ? <ChartSkeleton /> : <SalesChart data={salesData} />}
      </div>
    </DashboardLayout>
  );
}
