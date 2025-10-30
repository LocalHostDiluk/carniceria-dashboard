import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, AlertTriangle, Calendar, BarChart3 } from "lucide-react";

interface InventoryKPIsProps {
  totalProducts: number;
  lowStockProducts: number;
  nearExpiryProducts: number;
  totalLots: number;
  avgStockPercentage: number;
  isLoading?: boolean;
}

export function InventoryKPIs({
  totalProducts,
  lowStockProducts,
  nearExpiryProducts,
  totalLots,
  avgStockPercentage,
  isLoading = false,
}: InventoryKPIsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-16 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Productos Activos
          </CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalProducts}</div>
          <p className="text-xs text-muted-foreground">
            {totalLots} lotes activos
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Bajo Stock</CardTitle>
          <AlertTriangle className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">
            {lowStockProducts}
          </div>
          <p className="text-xs text-muted-foreground">
            productos requieren atención
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Próximo a Caducar
          </CardTitle>
          <Calendar className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {nearExpiryProducts}
          </div>
          <p className="text-xs text-muted-foreground">
            productos próximos a vencer
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Stock Promedio</CardTitle>
          <BarChart3 className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {avgStockPercentage}%
          </div>
          <p className="text-xs text-muted-foreground">
            de stock restante promedio
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
