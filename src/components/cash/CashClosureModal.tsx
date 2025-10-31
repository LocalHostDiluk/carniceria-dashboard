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
import {
  AlertTriangle,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Minus,
  Lock,
} from "lucide-react";

import { cashService } from "@/services/cashService";
import { useUser } from "@/hooks/useUser";
import type {
  DailySummary,
  CashClosureRequest,
  CashClosureResult,
} from "@/services/cashService";
import { Separator } from "../ui/separator";
import { Textarea } from "../ui/textarea";

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
  const { user, profile, validateManager } = useUser();

  // Estados
  const [dailySummary, setDailySummary] = useState<DailySummary | null>(null);
  const [startingCash, setStartingCash] = useState<string>("");
  const [endingCash, setEndingCash] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(false);

  // Validación de encargado
  const [managerEmail, setManagerEmail] = useState<string>("");
  const [managerPassword, setManagerPassword] = useState<string>("");
  const [isValidatingManager, setIsValidatingManager] = useState(false);
  const [managerValidated, setManagerValidated] = useState(false);

  // Cargar resumen del día
  useEffect(() => {
    if (open) {
      loadDailySummary();
      resetForm();
    }
  }, [open]);

  const loadDailySummary = async () => {
    setLoadingSummary(true);
    try {
      const summary = await cashService.getDailySummary();
      setDailySummary(summary);

      if (summary.is_closed) {
        toast.error("La caja ya fue cerrada hoy", {
          description: "No se puede cerrar la caja más de una vez por día",
        });
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Error loading daily summary:", error);
      toast.error("Error al cargar resumen del día");
    } finally {
      setLoadingSummary(false);
    }
  };

  const resetForm = () => {
    setStartingCash("");
    setEndingCash("");
    setNotes("");
    setManagerEmail("");
    setManagerPassword("");
    setManagerValidated(false);
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
    } finally {
      setIsValidatingManager(false);
    }
  };

  const handleCloseCash = async () => {
    if (!dailySummary || !managerValidated) return;

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
            result.difference
          ),
        });

        onSuccess?.(result);
        onOpenChange(false);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Error al cerrar caja");
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

  const calculatePotentialDifference = (): number | null => {
    if (!dailySummary || !startingCash || !endingCash) return null;

    const starting = parseFloat(startingCash);
    const ending = parseFloat(endingCash);

    if (isNaN(starting) || isNaN(ending)) return null;

    return ending - dailySummary.cash_sales - starting;
  };

  const potentialDiff = calculatePotentialDifference();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Cierre de Caja
          </DialogTitle>
        </DialogHeader>

        {loadingSummary ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Resumen del día */}
            {dailySummary && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Resumen del Día</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-muted-foreground">
                        Total Ventas
                      </Label>
                      <p className="text-2xl font-bold">
                        ${dailySummary.total_sales.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">
                        Número de Ventas
                      </Label>
                      <p className="text-2xl font-bold">
                        {dailySummary.sales_count}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm text-muted-foreground">
                        Efectivo
                      </Label>
                      <p className="text-xl font-semibold text-green-600">
                        ${dailySummary.cash_sales.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">
                        Tarjeta
                      </Label>
                      <p className="text-xl font-semibold text-blue-600">
                        ${dailySummary.card_sales.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">
                        Transferencia
                      </Label>
                      <p className="text-xl font-semibold text-purple-600">
                        ${dailySummary.transfer_sales.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Validación de encargado */}
            {!managerValidated ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-amber-600">
                    <Lock className="h-5 w-5" />
                    Validación de Encargado
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="manager-email">Email del Encargado</Label>
                    <Input
                      id="manager-email"
                      type="email"
                      value={managerEmail}
                      onChange={(e) => setManagerEmail(e.target.value)}
                      placeholder="encargado@carniceria.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="manager-password">Contraseña</Label>
                    <Input
                      id="manager-password"
                      type="password"
                      value={managerPassword}
                      onChange={(e) => setManagerPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                  </div>

                  <Button
                    onClick={handleValidateManager}
                    disabled={
                      isValidatingManager || !managerEmail || !managerPassword
                    }
                    className="w-full"
                  >
                    {isValidatingManager ? "Validando..." : "Validar Encargado"}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Formulario de cierre */}
                <Card>
                  <CardHeader>
                    <CardTitle>Efectivo en Caja</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="starting-cash">
                          Efectivo Inicial ($)
                        </Label>
                        <Input
                          id="starting-cash"
                          type="number"
                          step="0.01"
                          min="0"
                          value={startingCash}
                          onChange={(e) => setStartingCash(e.target.value)}
                          placeholder="0.00"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="ending-cash">Efectivo Final ($)</Label>
                        <Input
                          id="ending-cash"
                          type="number"
                          step="0.01"
                          min="0"
                          value={endingCash}
                          onChange={(e) => setEndingCash(e.target.value)}
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    {/* Mostrar diferencia potencial */}
                    {potentialDiff !== null && (
                      <div
                        className={`p-3 rounded-lg border-2 ${
                          potentialDiff > 0
                            ? "border-green-200 bg-green-50"
                            : potentialDiff < 0
                            ? "border-red-200 bg-red-50"
                            : "border-blue-200 bg-blue-50"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {potentialDiff > 0 ? (
                            <TrendingUp className="h-5 w-5 text-green-600" />
                          ) : potentialDiff < 0 ? (
                            <TrendingDown className="h-5 w-5 text-red-600" />
                          ) : (
                            <Minus className="h-5 w-5 text-blue-600" />
                          )}
                          <div>
                            <p className="font-semibold">
                              {potentialDiff > 0 &&
                                `Sobrante: $${potentialDiff.toFixed(2)}`}
                              {potentialDiff < 0 &&
                                `Faltante: $${Math.abs(potentialDiff).toFixed(
                                  2
                                )}`}
                              {potentialDiff === 0 &&
                                "Caja Cuadrada Perfectamente"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Diferencia calculada automáticamente
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="notes">Notas del Cierre (Opcional)</Label>
                      <Textarea
                        id="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Notas adicionales sobre el cierre de caja..."
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Botones de acción */}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    className="flex-1"
                    disabled={isLoading}
                  >
                    Cancelar
                  </Button>

                  <Button
                    onClick={handleCloseCash}
                    disabled={isLoading || !startingCash || !endingCash}
                    className="flex-1"
                  >
                    {isLoading ? "Cerrando Caja..." : "Cerrar Caja"}
                  </Button>
                </div>

                {/* Advertencia si hay diferencia grande */}
                {potentialDiff !== null && Math.abs(potentialDiff) > 100 && (
                  <Card className="border-amber-200 bg-amber-50">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                        <div>
                          <p className="font-semibold text-amber-800">
                            Diferencia Importante Detectada
                          </p>
                          <p className="text-sm text-amber-700">
                            Hay una diferencia de $
                            {Math.abs(potentialDiff).toFixed(2)}. Verifica los
                            montos antes de continuar.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
