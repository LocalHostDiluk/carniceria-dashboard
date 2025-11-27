"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { DollarSign, Package, CreditCard, AlertCircle } from "lucide-react";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KpiCardSkeleton } from "@/components/dashboard/KpiCardSkeleton";

import { useAuthGuard } from "@/hooks/useAuthGuard";
import { fetchDashboardKpis } from "@/services/dashboardService";
import { reportsService } from "@/services/reportsService";
import { ErrorHandler } from "@/lib/errorHandler";
import { SalesTrendChart } from "@/components/sales/SalesTrendChart";
import { CategoryDistributionChart } from "@/components/sales/CategoryDistributionChart";

export default function HomePage() {
  const { isAuthenticated, isLoading: authLoading } = useAuthGuard();

  // Estados para gráficas
  const [trendData, setTrendData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [areChartsLoading, setAreChartsLoading] = useState(true);

  // Cargar datos de las gráficas al montar
  useEffect(() => {
    const loadCharts = async () => {
      if (!isAuthenticated) return;
      try {
        setAreChartsLoading(true);

        // Cargar ambas gráficas en paralelo
        const [trend, categories] = await Promise.all([
          reportsService.getDailySalesChart(30), // Últimos 30 días
          reportsService.getSalesByCategoryChart({
            start_date: new Date(
              new Date().setDate(new Date().getDate() - 30)
            ).toISOString(),
            end_date: new Date().toISOString(),
          }),
        ]);

        setTrendData(trend);
        setCategoryData(categories);
      } catch (error) {
        ErrorHandler.handle(error, "Cargar gráficas del dashboard");
      } finally {
        setAreChartsLoading(false);
      }
    };

    loadCharts();
  }, [isAuthenticated]);

  // Use SWR for fetching KPIs (mantenemos esto igual porque funciona bien)
  const { data: kpis, isLoading: kpisLoading } = useSWR(
    isAuthenticated ? "dashboard-kpis" : null,
    fetchDashboardKpis,
    {
      revalidateOnFocus: true,
      dedupingInterval: 5000,
    }
  );

  if (authLoading) {
    return <div className="p-4">Verificando sesión...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount);
  };

  return (
    <DashboardLayout>
      <div className="flex items-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      </div>

      {/* 1. SECCIÓN DE KPIs */}
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4 mt-4">
        {kpisLoading && !kpis ? (
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
                <p className="text-xs text-muted-foreground">
                  Ingresos brutos del día
                </p>
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
                <p className="text-xs text-muted-foreground">
                  Ventas realizadas hoy
                </p>
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
                <p className="text-xs text-muted-foreground">
                  Promedio por venta
                </p>
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
                  {kpis?.low_stock_products_count || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Productos requieren atención
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* 2. SECCIÓN DE GRÁFICAS AVANZADAS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        {/* Gráfica de Tendencia (Ocupa 2 columnas) */}
        <div className="lg:col-span-2">
          <SalesTrendChart data={trendData} isLoading={areChartsLoading} />
        </div>

        {/* Gráfica de Categorías (Ocupa 1 columna) */}
        <div className="lg:col-span-1">
          <CategoryDistributionChart
            data={categoryData}
            isLoading={areChartsLoading}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
