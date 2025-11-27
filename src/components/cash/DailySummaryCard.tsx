"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Plus, Eye, EyeOff } from "lucide-react";
import type { DailyCashFlow, Expense } from "@/types/models";
import {
  expenseCategories,
  paymentMethodLabels,
} from "@/services/expenseService";

interface DailySummaryCardProps {
  dailyFlow: DailyCashFlow;
  dailyExpenses: Expense[];
  showExpenseDetails: boolean;
  onToggleExpenseDetails: () => void;
  onAddExpense: () => void;
}

export function DailySummaryCard({
  dailyFlow,
  dailyExpenses,
  showExpenseDetails,
  onToggleExpenseDetails,
  onAddExpense,
}: DailySummaryCardProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* INGRESOS */}
      <Card className="border-green-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl flex items-center gap-3 text-green-700">
            📈 Ingresos del Día
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="text-sm font-medium text-muted-foreground">
              Total Ventas
            </Label>
            <p className="text-3xl font-bold text-green-600 mt-2">
              ${dailyFlow.sales.total.toFixed(2)}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {dailyFlow.sales.count}{" "}
              {dailyFlow.sales.count === 1 ? "venta" : "ventas"}
            </p>
          </div>

          <Separator />

          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-100">
              <p className="text-xl font-bold text-green-700">
                ${dailyFlow.sales.cash.toFixed(2)}
              </p>
              <p className="text-sm text-green-600 mt-1">Efectivo</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-xl font-bold text-blue-700">
                ${dailyFlow.sales.card.toFixed(2)}
              </p>
              <p className="text-sm text-blue-600 mt-1">Tarjeta</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-100">
              <p className="text-xl font-bold text-purple-700">
                ${dailyFlow.sales.transfer.toFixed(2)}
              </p>
              <p className="text-sm text-purple-600 mt-1">Transferencia</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* EGRESOS */}
      <Card className="border-red-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl flex items-center justify-between text-red-700">
            <span className="flex items-center gap-3">📉 Egresos del Día</span>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleExpenseDetails}
                className="h-8 w-8 p-0"
                title="Ver detalles"
              >
                {showExpenseDetails ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onAddExpense}
                className="h-8 px-3"
                title="Agregar gasto"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">Compras a Proveedores:</span>
              <span className="text-lg font-bold text-orange-600">
                ${dailyFlow.expenses.purchases.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="font-medium">Gastos Operativos:</span>
              <span className="text-lg font-bold text-red-600">
                ${dailyFlow.expenses.operations.toFixed(2)}
              </span>
            </div>

            <Separator />

            <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-100">
              <span className="text-lg font-bold">Total Egresos:</span>
              <span className="text-2xl font-bold text-red-600">
                ${dailyFlow.expenses.total.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Detalle de gastos operativos */}
          {showExpenseDetails && dailyExpenses.length > 0 && (
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-muted-foreground">
                Detalle de Gastos Operativos:
              </Label>
              <div className="max-h-40 overflow-y-auto space-y-2 pr-2">
                {dailyExpenses.map((expense) => (
                  <div
                    key={expense.expense_id}
                    className="flex justify-between items-center p-3 bg-muted/30 rounded-md border"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">
                        {expenseCategories[expense.category].icon}
                      </span>
                      <div>
                        <p className="font-medium text-sm">
                          {expense.description}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {expenseCategories[expense.category].label}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {paymentMethodLabels[expense.payment_method]}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <span className="font-bold text-red-600">
                      ${expense.amount.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {showExpenseDetails && dailyExpenses.length === 0 && (
            <div className="text-center py-6 text-muted-foreground">
              <p className="text-sm">
                No hay gastos operativos registrados hoy
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
