"use client";

import { useEffect, useState } from "react";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InventoryKPIs } from "@/components/inventory/InventoryKPIs";
import { 
  inventoryService, 
  type InventoryOverview,
  type InventoryAlert 
} from "@/services/inventoryService";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function InventoryPage() {
  // ✅ TODOS LOS HOOKS PRIMERO
  const { isAuthenticated, isLoading: authLoading } = useAuthGuard();
  const [overview, setOverview] = useState<InventoryOverview[]>([]);
  const [alerts, setAlerts] = useState<InventoryAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadInventoryData = async () => {
      try {
        setIsLoading(true);
        const [overviewData, alertsData] = await Promise.all([
          inventoryService.getInventoryOverview(),
          inventoryService.getInventoryAlerts(5, 7)
        ]);
        
        setOverview(overviewData);
        setAlerts(alertsData);
      } catch (error) {
        console.error('Error loading inventory data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      loadInventoryData();
    }
  }, [isAuthenticated]);

  // ✅ CONDICIONALES AL FINAL
  if (authLoading) {
    return <div className="p-4">Verificando sesión...</div>;
  }
  
  if (!isAuthenticated) {
    return null;
  }

  const kpis = inventoryService.getInventoryKPIs(overview);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const getStockStatus = (product: InventoryOverview) => {
    if (product.has_near_expiry) {
      return <Badge variant="destructive">Próximo a caducar</Badge>;
    }
    if (product.has_low_stock) {
      return <Badge variant="secondary">Bajo stock</Badge>;
    }
    return <Badge variant="outline">Normal</Badge>;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center">
          <h1 className="text-lg font-semibold md:text-2xl">Resumen de Inventario</h1>
        </div>

        {/* KPIs del inventario */}
        <InventoryKPIs 
          totalProducts={kpis.totalProducts}
          lowStockProducts={kpis.lowStockProducts}
          nearExpiryProducts={kpis.nearExpiryProducts}
          totalLots={kpis.totalLots}
          avgStockPercentage={kpis.avgStockPercentage}
          isLoading={isLoading}
        />

        {/* Tabla de productos */}
        <Card>
          <CardHeader>
            <CardTitle>Productos del Inventario</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="h-12 bg-muted rounded animate-pulse" />
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead className="text-right">Stock Total</TableHead>
                    <TableHead className="text-right">Precio</TableHead>
                    <TableHead className="text-center">% Stock Restante</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {overview.map((product) => (
                    <TableRow key={product.product_id}>
                      <TableCell className="font-medium">
                        {product.product_name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {product.category_name || "Sin categoría"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {product.total_stock} {product.unit_of_measure}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(product.sale_price)}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="space-y-1">
                          <Progress 
                            value={product.avg_percentage_remaining} 
                            className="h-2"
                          />
                          <span className="text-sm text-muted-foreground">
                            {Math.round(product.avg_percentage_remaining)}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStockStatus(product)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}