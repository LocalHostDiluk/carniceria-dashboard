"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { DollarSign, Lock } from "lucide-react";

import { cashService } from "@/services/cashService";
import { expenseService } from "@/services/expenseService";
import { useUser } from "@/hooks/useUser";
import { AddExpenseModal } from "@/components/expenses/AddExpenseModal";
import { DailySummaryCard } from "./DailySummaryCard";
import { CashFlowCard } from "./CashFlowCard";
import { CashCalculationCard } from "./CashCalculationCard";

import type {
  CashClosureRequest,
  CashClosureResult,
} from "@/services/cashService";
import type { DailyCashFlow, Expense } from "@/services/expenseService";

interface CashClosureModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (result: CashClosureResult) => void;
}

export function CashClosureModal({
  open,
  onOpenChange,
  onSuccess,
}: CashClosureModalProps) {
  const { validateManager } = useUser();

  // Estados principales
  const [dailyFlow, setDailyFlow] = useState<DailyCashFlow | null>(null);
  const [dailyExpenses, setDailyExpenses] = useState<Expense[]>([]);
  const [startingCash, setStartingCash] = useState<string>("");
  const [endingCash, setEndingCash] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  // Estados de validación
  const [managerEmail, setManagerEmail] = useState<string>("");
  const [managerPassword, setManagerPassword] = useState<string>("");
  const [isValidatingManager, setIsValidatingManager] = useState(false);
  const [managerValidated, setManagerValidated] = useState(false);

  // Estados UI
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showExpenseDetails, setShowExpenseDetails] = useState(false);

  // Cargar datos del día
  useEffect(() => {
    if (open) {
      loadDailyData();
      resetForm();
    }
  }, [open]);

  const loadDailyData = async () => {
    setLoadingData(true);
    try {
      const [flowData, expensesData] = await Promise.all([
        expenseService.getDailyCashFlow(),
        expenseService.getDailyExpenses(),
      ]);

      setDailyFlow(flowData);
      setDailyExpenses(expensesData);

      if (flowData.closure.is_closed) {
        toast.error("La caja ya fue cerrada hoy", {
          description: "No se puede cerrar la caja más de una vez por día",
        });
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Error loading daily data:", error);
      toast.error("Error al cargar datos del día");
    } finally {
      setLoadingData(false);
    }
  };

  const resetForm = () => {
    setStartingCash("");
    setEndingCash("");
    setNotes("");
    setManagerEmail("");
    setManagerPassword("");
    setManagerValidated(false);
    setShowExpenseDetails(false);
  };

  const handleValidateManager = async () => {
    if (!managerEmail || !managerPassword) {
      toast.error("Ingresa email y contraseña del encargado");
      return;
    }

    setIsValidatingManager(true);
    try {
      const isValid = await validateManager(managerEmail, managerPassword);

      if (isValid) {
        setManagerValidated(true);
        toast.success("Encargado validado correctamente");
      } else {
        toast.error("Credenciales de encargado inválidas");
      }
    } catch (error) {
      toast.error("Error al validar encargado");
      console.error("Error validating manager:", error);
    } finally {
      setIsValidatingManager(false);
    }
  };

  const handleCloseCash = async () => {
    if (!dailyFlow || !managerValidated) return;

    const startingAmount = parseFloat(startingCash);
    const endingAmount = parseFloat(endingCash);

    if (isNaN(startingAmount) || startingAmount < 0) {
      toast.error("Ingresa un monto inicial válido");
      return;
    }

    if (isNaN(endingAmount) || endingAmount < 0) {
      toast.error("Ingresa un monto final válido");
      return;
    }

    setIsLoading(true);

    const request: CashClosureRequest = {
      starting_cash: startingAmount,
      ending_cash: endingAmount,
      notes: notes.trim() || undefined,
    };

    try {
      const result = await cashService.closeCashDrawer(request);

      if (result.success) {
        toast.success(result.message, {
          description: getDifferenceMessage(
            result.difference_type,
            result.cash_flow.difference
          ),
        });

        onSuccess?.(result);
        onOpenChange(false);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Error al cerrar caja");
      console.error("Error closing cash drawer:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDifferenceMessage = (type: string, amount: number): string => {
    const absAmount = Math.abs(amount);
    switch (type) {
      case "surplus":
        return `Sobrante de $${absAmount.toFixed(2)}`;
      case "deficit":
        return `Faltante de $${absAmount.toFixed(2)}`;
      case "exact":
        return "Caja cuadrada perfectamente";
      default:
        return "";
    }
  };

  const handleExpenseAdded = () => {
    loadDailyData();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto">
          <DialogHeader className="pb-4">
            <DialogTitle className="flex items-center gap-3 text-2xl">
              <DollarSign className="h-6 w-6" />
              Cierre de Caja
            </DialogTitle>
          </DialogHeader>

          {loadingData ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Resumen del día */}
              {dailyFlow && (
                <DailySummaryCard
                  dailyFlow={dailyFlow}
                  dailyExpenses={dailyExpenses}
                  showExpenseDetails={showExpenseDetails}
                  onToggleExpenseDetails={() =>
                    setShowExpenseDetails(!showExpenseDetails)
                  }
                  onAddExpense={() => setShowAddExpense(true)}
                />
              )}

              {/* Flujo neto */}
              {dailyFlow && <CashFlowCard dailyFlow={dailyFlow} />}

              {/* Validación de encargado */}
              {!managerValidated ? (
                <Card className="border-amber-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-amber-700">
                      <Lock className="h-5 w-5" />
                      Validación de Encargado
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label
                          htmlFor="manager-email"
                          className="text-sm font-semibold"
                        >
                          Email del Encargado
                        </Label>
                        <Input
                          id="manager-email"
                          type="email"
                          value={managerEmail}
                          onChange={(e) => setManagerEmail(e.target.value)}
                          placeholder="encargado@carniceria.com"
                          className="h-11"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label
                          htmlFor="manager-password"
                          className="text-sm font-semibold"
                        >
                          Contraseña
                        </Label>
                        <Input
                          id="manager-password"
                          type="password"
                          value={managerPassword}
                          onChange={(e) => setManagerPassword(e.target.value)}
                          placeholder="••••••••"
                          className="h-11"
                        />
                      </div>
                    </div>

                    <Button
                      onClick={handleValidateManager}
                      disabled={
                        isValidatingManager || !managerEmail || !managerPassword
                      }
                      className="w-full h-11"
                      size="lg"
                    >
                      {isValidatingManager
                        ? "Validando..."
                        : "Validar Encargado"}
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Cálculo de efectivo */}
                  {dailyFlow && (
                    <CashCalculationCard
                      dailyFlow={dailyFlow}
                      startingCash={startingCash}
                      endingCash={endingCash}
                      notes={notes}
                      onStartingCashChange={setStartingCash}
                      onEndingCashChange={setEndingCash}
                      onNotesChange={setNotes}
                    />
                  )}

                  {/* Botones de acción */}
                  <div className="flex gap-4 pt-6">
                    <Button
                      variant="outline"
                      onClick={() => onOpenChange(false)}
                      className="flex-1 h-12"
                      disabled={isLoading}
                      size="lg"
                    >
                      Cancelar
                    </Button>

                    <Button
                      onClick={handleCloseCash}
                      disabled={isLoading || !startingCash || !endingCash}
                      className="flex-1 h-12"
                      size="lg"
                    >
                      {isLoading ? "Cerrando Caja..." : "Cerrar Caja"}
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal para agregar gastos */}
      <AddExpenseModal
        open={showAddExpense}
        onOpenChange={setShowAddExpense}
        onSuccess={handleExpenseAdded}
      />
    </>
  );
}
