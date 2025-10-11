// src/app/inventory/page.tsx
"use client";
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { TableSkeleton } from "@/components/dashboard/TableSkeleton";
import {
  getInventory,
  InventoryLotRow,
  ProductWithLots,
} from "@/services/productService";

export default function InventoryPage() {
  const [inventory, setInventory] = useState<ProductWithLots[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadInventory = async () => {
      try {
        const data = await getInventory();
        setInventory(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    loadInventory();
  }, []);

  // Función para calcular el stock total de un producto sumando sus lotes
  const calculateTotalStock = (product: ProductWithLots): number => {
    if (!product.inventory_lots) {
      return 0;
    }
    // 👇 Añadimos los tipos a 'sum' y 'lot'
    return product.inventory_lots.reduce(
      (sum: number, lot: InventoryLotRow) => {
        return sum + lot.stock_quantity;
      },
      0
    );
  };

  return (
    <DashboardLayout>
      <Card>
        <CardHeader>
          <CardTitle>Inventario de Productos</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead className="text-right">Stock Total</TableHead>
                  <TableHead>Unidad</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventory.map((product) => {
                  const totalStock = calculateTotalStock(product);
                  return (
                    <TableRow key={product.product_id}>
                      <TableCell className="font-medium">
                        {product.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {product.categories?.name || "N/A"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{totalStock}</TableCell>
                      <TableCell>{product.unit_of_measure}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
