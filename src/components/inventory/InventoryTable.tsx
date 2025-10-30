"use client";

import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import type { InventoryOverview } from "@/services/inventoryService";
import { Progress } from "../ui/progress";

type SortField =
  | "product_name"
  | "category_name"
  | "total_stock"
  | "sale_price"
  | "avg_percentage_remaining";
type SortDirection = "asc" | "desc";

interface InventoryTableProps {
  data: InventoryOverview[];
  isLoading?: boolean;
}

export function InventoryTable({
  data,
  isLoading = false,
}: InventoryTableProps) {
  const [sortField, setSortField] = useState<SortField>("product_name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      // Manejar valores string vs number
      if (typeof aValue === "string" && typeof bValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [data, sortField, sortDirection]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount);
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4" />;
    return sortDirection === "asc" ? (
      <ArrowUp className="h-4 w-4" />
    ) : (
      <ArrowDown className="h-4 w-4" />
    );
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

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-12 bg-muted rounded animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>
            <Button
              variant="ghost"
              onClick={() => handleSort("product_name")}
              className="h-auto p-0 font-semibold"
            >
              Producto {getSortIcon("product_name")}
            </Button>
          </TableHead>
          <TableHead>
            <Button
              variant="ghost"
              onClick={() => handleSort("category_name")}
              className="h-auto p-0 font-semibold"
            >
              Categoría {getSortIcon("category_name")}
            </Button>
          </TableHead>
          <TableHead className="text-right">
            <Button
              variant="ghost"
              onClick={() => handleSort("total_stock")}
              className="h-auto p-0 font-semibold"
            >
              Stock Total {getSortIcon("total_stock")}
            </Button>
          </TableHead>
          <TableHead className="text-right">
            <Button
              variant="ghost"
              onClick={() => handleSort("sale_price")}
              className="h-auto p-0 font-semibold"
            >
              Precio {getSortIcon("sale_price")}
            </Button>
          </TableHead>
          <TableHead className="text-center">
            <Button
              variant="ghost"
              onClick={() => handleSort("avg_percentage_remaining")}
              className="h-auto p-0 font-semibold"
            >
              % Stock Restante {getSortIcon("avg_percentage_remaining")}
            </Button>
          </TableHead>
          <TableHead>Estado</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedData.map((product) => (
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
  );
}
