"use client";

import { useEffect, useState } from "react";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InventoryKPIs } from "@/components/inventory/InventoryKPIs";
import { DataPagination } from "@/components/ui/data-pagination";
import { inventoryService } from "@/services/inventoryService";
import type { InventoryOverview } from "@/types/models";
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
  const { isAuthenticated, isLoading: authLoading } = useAuthGuard();
  const [overview, setOverview] = useState<InventoryOverview[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Estados de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    const loadInventoryData = async () => {
      try {
        setIsLoading(true);
        const overviewData = await inventoryService.getInventoryOverview();
        setOverview(overviewData);
        setTotalItems(overviewData.length);
      } catch (error) {
        console.error("Error loading inventory data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      loadInventoryData();
    }
  }, [isAuthenticated]);

  if (authLoading) {
    return <div className="p-4">Verificando sesión...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  const kpis = inventoryService.getInventoryKPIs(overview);

  // Paginación del lado del cliente
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedOverview = overview.slice(startIndex, endIndex);
  const totalPages = Math.ceil(totalItems / pageSize);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
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
          <h1 className="text-3xl font-bold">Resumen de Inventario</h1>
        </div>

        <InventoryKPIs
          totalProducts={kpis.totalProducts}
          lowStockProducts={kpis.lowStockProducts}
          nearExpiryProducts={kpis.nearExpiryProducts}
          totalLots={kpis.totalLots}
          avgStockPercentage={kpis.avgStockPercentage}
          isLoading={isLoading}
        />

        <Card>
          <CardHeader>
            <CardTitle>Productos del Inventario</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="h-12 bg-muted rounded animate-pulse"
                  />
                ))}
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead>Categoría</TableHead>
                      <TableHead className="text-right">Stock Total</TableHead>
                      <TableHead className="text-right">Precio</TableHead>
                      <TableHead className="text-center">
                        % Stock Restante
                      </TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedOverview.map((product) => (
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
                        <TableCell>{getStockStatus(product)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* ✅ PAGINACIÓN CON TU COMPONENTE */}
                {totalPages > 0 && (
                  <DataPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    pageSize={pageSize}
                    totalItems={totalItems}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={(size) => {
                      setPageSize(size);
                      setCurrentPage(1);
                    }}
                  />
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
