"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Receipt,
} from "lucide-react";
import type { FinancialSummary } from "@/types/reports";

interface FinancialKPICardsProps {
  summary: FinancialSummary | null;
  isLoading?: boolean;
}

export function FinancialKPICards({
  summary,
  isLoading,
}: FinancialKPICardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-16 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!summary) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          Selecciona un período para ver el resumen financiero
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (amount: number) =>
    `$${amount.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Ventas Totales */}
      <Card className="border-blue-200">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-sm font-medium text-blue-700">
            <span>Ventas Totales</span>
            <DollarSign className="h-4 w-4" />
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-2xl font-bold text-blue-600">
            {formatCurrency(summary.sales.total)}
          </div>
          <p className="text-xs text-muted-foreground">
            Promedio: {formatCurrency(summary.sales.average_daily)}/día
          </p>
        </CardContent>
      </Card>

      {/* Gastos Totales */}
      <Card className="border-red-200">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-sm font-medium text-red-700">
            <span>Gastos Totales</span>
            <Receipt className="h-4 w-4" />
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-2xl font-bold text-red-600">
            {formatCurrency(summary.costs.total)}
          </div>
          <p className="text-xs text-muted-foreground">
            Compras: {formatCurrency(summary.costs.purchases)} | Operativos:{" "}
            {formatCurrency(summary.costs.expenses)}
          </p>
        </CardContent>
      </Card>

      {/* Utilidad Neta */}
      <Card
        className={`border-${summary.profit.net >= 0 ? "green" : "red"}-200`}
      >
        <CardHeader className="pb-2">
          <CardTitle
            className={`flex items-center justify-between text-sm font-medium text-${
              summary.profit.net >= 0 ? "green" : "red"
            }-700`}
          >
            <span>Utilidad Neta</span>
            {summary.profit.net >= 0 ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div
            className={`text-2xl font-bold text-${
              summary.profit.net >= 0 ? "green" : "red"
            }-600`}
          >
            {formatCurrency(summary.profit.net)}
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant={
                summary.profit.margin_percentage >= 20 ? "default" : "secondary"
              }
              className="text-xs"
            >
              {summary.profit.margin_percentage.toFixed(1)}% margen
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Período */}
      <Card className="border-purple-200">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-sm font-medium text-purple-700">
            <span>Período</span>
            <ShoppingCart className="h-4 w-4" />
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-2xl font-bold text-purple-600">
            {summary.period.days}
          </div>
          <p className="text-xs text-muted-foreground">
            {new Date(summary.period.start_date).toLocaleDateString("es-MX")} -{" "}
            {new Date(summary.period.end_date).toLocaleDateString("es-MX")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
