"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Receipt, User, Clock } from "lucide-react";
import type { ExpenseRecord } from "@/services/reportsService";
import {
  expenseCategories,
  paymentMethodLabels,
} from "@/services/expenseService";

interface ExpensesHistoryTableProps {
  expenses: ExpenseRecord[];
  isLoading?: boolean;
}

export function ExpensesHistoryTable({
  expenses,
  isLoading,
}: ExpensesHistoryTableProps) {
  const formatCurrency = (amount: number) =>
    `$${amount.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`;

  const getCategoryConfig = (category: string) => {
    return (
      expenseCategories[category as keyof typeof expenseCategories] || {
        icon: "💸",
        label: category,
      }
    );
  };

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

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Historial de Gastos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
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

  if (!expenses || expenses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Historial de Gastos
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8 text-muted-foreground">
          No se encontraron gastos en el período seleccionado
        </CardContent>
      </Card>
    );
  }

  const totalExpenses = expenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Historial de Gastos
          </span>
          <Badge variant="outline" className="text-sm">
            {expenses.length} gastos • {formatCurrency(totalExpenses)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {expenses.map((expense) => {
            const categoryConfig = getCategoryConfig(expense.category);

            return (
              <div
                key={expense.expense_id}
                className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{categoryConfig.icon}</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-muted-foreground">
                          {expense.date}
                        </span>
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {expense.time}
                        </span>
                      </div>
                      <div className="font-medium">{expense.description}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <User className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {expense.user}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {categoryConfig.label}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      className={getPaymentMethodColor(expense.payment_method)}
                    >
                      {
                        paymentMethodLabels[
                          expense.payment_method as keyof typeof paymentMethodLabels
                        ]
                      }
                    </Badge>
                    <div className="text-right">
                      <div className="font-bold text-lg text-red-600">
                        {formatCurrency(expense.amount)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
