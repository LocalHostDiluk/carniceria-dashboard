"use client";

import { useEffect, useState } from "react";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InventoryKPIs } from "@/components/inventory/InventoryKPIs";
import { DataPagination } from "@/components/ui/data-pagination";
import { InventoryFiltersBar } from "@/components/inventory/InventoryFiltersBar";
import {
  inventoryService,
  type InventoryFilters,
} from "@/services/inventoryService";
import { ErrorHandler } from "@/lib/errorHandler";
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
import { InventoryOverview } from "@/types/models";

export default function InventoryPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuthGuard();
  const [overview, setOverview] = useState<InventoryOverview[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // ✅ NUEVO: Estado de Filtros
  const [filters, setFilters] = useState<InventoryFilters>({
    status: "all",
    search: "",
  });

  // Cargar datos
  const loadInventoryData = async () => {
    try {
      setIsLoading(true);
      // ✅ AHORA PASAMOS LOS FILTROS AL SERVICIO
      const result = await inventoryService.getInventoryOverview(
        currentPage,
        pageSize,
        filters
      );

      setOverview(result.data);
      setTotalItems(result.total);
      setTotalPages(result.totalPages);
    } catch (error) {
      ErrorHandler.handle(error, "Cargar inventario");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadInventoryData();
    }
  }, [isAuthenticated, currentPage, pageSize, filters]); // ✅ Recargar si cambian filtros

  // Handler cuando el usuario cambia los filtros en la barra
  const handleFilterChange = (newFilters: InventoryFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Resetear a página 1 al filtrar
  };

  if (authLoading) return <div className="p-4">Verificando sesión...</div>;
  if (!isAuthenticated) return null;

  // Calcular KPIs (puedes optimizar esto para que venga del backend si son muchos datos)
  const kpis = inventoryService.getInventoryKPIs(overview);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount);

  const getStockStatus = (product: InventoryOverview) => {
    if (product.has_near_expiry)
      return <Badge variant="destructive">Por Caducar</Badge>;
    if (product.has_low_stock)
      return (
        <Badge className="bg-amber-500 hover:bg-amber-600">Stock Bajo</Badge>
      );
    return (
      <Badge
        variant="outline"
        className="text-green-600 border-green-200 bg-green-50"
      >
        Normal
      </Badge>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Inventario</h1>

        {/* KPIs Generales */}
        <InventoryKPIs
          totalProducts={kpis.totalProducts} // Nota: Estos KPIs podrían necesitar ajuste si quieres que reflejen el filtro o el total global
          lowStockProducts={kpis.lowStockProducts}
          nearExpiryProducts={kpis.nearExpiryProducts}
          totalLots={kpis.totalLots}
          avgStockPercentage={kpis.avgStockPercentage}
          isLoading={isLoading}
        />

        <Card>
          <CardHeader>
            <CardTitle>Productos</CardTitle>
          </CardHeader>
          <CardContent>
            {/* ✅ BARRA DE FILTROS */}
            <InventoryFiltersBar onFilterChange={handleFilterChange} />

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
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Producto</TableHead>
                        <TableHead>Categoría</TableHead>
                        <TableHead className="text-right">Stock</TableHead>
                        <TableHead className="text-right">Precio</TableHead>
                        <TableHead className="text-center w-[200px]">
                          Disponibilidad
                        </TableHead>
                        <TableHead>Estado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {overview.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={6}
                            className="text-center py-8 text-muted-foreground"
                          >
                            No se encontraron productos con estos filtros.
                          </TableCell>
                        </TableRow>
                      ) : (
                        overview.map((product) => (
                          <TableRow key={product.product_id}>
                            <TableCell className="font-medium">
                              {product.product_name}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="secondary"
                                className="font-normal"
                              >
                                {product.category_name || "Sin categoría"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right font-mono">
                              {product.total_stock} {product.unit_of_measure}
                            </TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(product.sale_price)}
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="space-y-1.5">
                                <Progress
                                  value={product.avg_percentage_remaining}
                                  className="h-2"
                                  // Puedes agregar clases condicionales de color aquí si quieres
                                />
                                <p className="text-xs text-muted-foreground text-right">
                                  {Math.round(product.avg_percentage_remaining)}
                                  % vida útil
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>{getStockStatus(product)}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

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
