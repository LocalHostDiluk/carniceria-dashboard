// src/app/page.tsx
"use client";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Package, CreditCard, AlertCircle } from "lucide-react";
import {
  fetchDashboardKpis,
  fetchDailySales,
} from "@/services/dashboardService";
import { KpiCardSkeleton } from "@/components/dashboard/KpiCardSkeleton";
import { SalesChart } from "@/components/dashboard/SalesChart";
import { ChartSkeleton } from "@/components/dashboard/ChartSkeleton";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import useSWR from "swr";

export default function HomePage() {
  const { isAuthenticated, isLoading: authLoading } = useAuthGuard();

  // Use SWR for fetching KPIs
  const { data: kpis, isLoading: kpisLoading } = useSWR(
    isAuthenticated ? "dashboard-kpis" : null,
    fetchDashboardKpis,
    {
      revalidateOnFocus: true, // Revalidate when window gets focus
      dedupingInterval: 5000, // Dedupe requests within 5 seconds
    }
  );

  // Use SWR for fetching sales data
  const { data: salesData, isLoading: salesLoading } = useSWR(
    isAuthenticated ? "dashboard-sales" : null,
    fetchDailySales,
    {
      revalidateOnFocus: true,
      dedupingInterval: 5000,
    }
  );

  if (authLoading) {
    return <div className="p-4">Verificando sesión...</div>;
  }

  if (!isAuthenticated) {
    return null; // Redirecting
  }

  const isLoading = kpisLoading || salesLoading;

  // ✅ Formatters
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount);
  };

  return (
    <DashboardLayout>
      <div className="flex items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        {isLoading && !kpis ? (
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
        {isLoading && !salesData ? (
          <ChartSkeleton />
        ) : (
          <SalesChart data={salesData || []} />
        )}
      </div>
    </DashboardLayout>
  );
}
