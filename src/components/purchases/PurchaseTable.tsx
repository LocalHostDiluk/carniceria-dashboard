"use client";

import { Calendar, User, Package, Eye } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { type Purchase } from "@/services/purchaseService";
import { Button } from "../ui/button";

interface PurchaseTableProps {
  purchases: Purchase[];
  isLoading: boolean;
  onViewDetails: (purchase: Purchase) => void;
}

export function PurchaseTable({
  purchases,
  isLoading,
  onViewDetails,
}: PurchaseTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-12 bg-muted rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (purchases.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No hay compras registradas</p>
      </div>
    );
  }

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(val);

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fecha</TableHead>
            <TableHead>Proveedor</TableHead>
            <TableHead>Items</TableHead>
            <TableHead>Registrado por</TableHead>
            <TableHead>Método</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {purchases.map((purchase) => (
            <TableRow
              key={purchase.purchase_id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => onViewDetails(purchase)}
            >
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  {new Date(purchase.purchase_date).toLocaleDateString("es-MX")}
                </div>
                <div className="text-xs text-muted-foreground pl-6">
                  {new Date(purchase.purchase_date).toLocaleTimeString(
                    "es-MX",
                    { hour: "2-digit", minute: "2-digit" }
                  )}
                </div>
              </TableCell>
              <TableCell className="font-medium">
                {purchase.supplier_name || "Desconocido"}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  {purchase.items_count} lotes
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4 text-muted-foreground" />
                  {purchase.user_name}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className="capitalize">
                  {purchase.payment_method}
                </Badge>
              </TableCell>
              <TableCell className="text-right font-bold text-green-600">
                {formatCurrency(purchase.total_cost)}
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
