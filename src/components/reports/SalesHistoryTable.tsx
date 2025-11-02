"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronRight,
  ShoppingBag,
  User,
  Clock,
} from "lucide-react";
import type { SaleRecord } from "@/services/reportsService";

interface SalesHistoryTableProps {
  sales: SaleRecord[];
  isLoading?: boolean;
}

export function SalesHistoryTable({
  sales,
  isLoading,
}: SalesHistoryTableProps) {
  const [expandedSale, setExpandedSale] = useState<string | null>(null);

  const formatCurrency = (amount: number) =>
    `$${amount.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`;

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case "efectivo":
        return "bg-green-100 text-green-700";
      case "tarjeta":
        return "bg-blue-100 text-blue-700";
      case "transferencia":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const toggleExpand = (saleId: string) => {
    setExpandedSale(expandedSale === saleId ? null : saleId);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Historial de Ventas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="animate-pulse bg-muted h-16 rounded"
              ></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!sales || sales.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Historial de Ventas
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8 text-muted-foreground">
          No se encontraron ventas en el período seleccionado
        </CardContent>
      </Card>
    );
  }

  const totalSales = sales.reduce((sum, sale) => sum + sale.total_amount, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Historial de Ventas
          </span>
          <Badge variant="outline" className="text-sm">
            {sales.length} ventas • {formatCurrency(totalSales)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {sales.map((sale) => (
            <div key={sale.sale_id} className="border rounded-lg">
              {/* Resumen de la venta */}
              <div className="p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleExpand(sale.sale_id)}
                      className="p-1 h-6 w-6"
                    >
                      {expandedSale === sale.sale_id ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-muted-foreground">
                          {sale.date}
                        </span>
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {sale.time}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <User className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm font-medium">{sale.user}</span>
                        <span className="text-sm text-muted-foreground">
                          • {sale.items_count}{" "}
                          {sale.items_count === 1 ? "producto" : "productos"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      className={getPaymentMethodColor(sale.payment_method)}
                    >
                      {sale.payment_method}
                    </Badge>
                    <div className="text-right">
                      <div className="font-bold text-lg">
                        {formatCurrency(sale.total_amount)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detalle de productos */}
              {expandedSale === sale.sale_id && sale.products && (
                <div className="border-t bg-muted/20 p-4">
                  <h4 className="font-medium text-sm mb-3">
                    Productos vendidos:
                  </h4>
                  <div className="space-y-2">
                    {sale.products.map((product, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center py-2 px-3 bg-background rounded border"
                      >
                        <div>
                          <div className="font-medium text-sm">
                            {product.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {product.quantity} {product.unit} ×{" "}
                            {formatCurrency(product.price)}
                          </div>
                        </div>
                        <div className="font-medium">
                          {formatCurrency(product.subtotal)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
