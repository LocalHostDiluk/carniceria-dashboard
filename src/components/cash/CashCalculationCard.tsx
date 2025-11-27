"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { DailyCashFlow } from "@/types/models";

interface CashCalculationCardProps {
  dailyFlow: DailyCashFlow;
  startingCash: string;
  endingCash: string;
  notes: string;
  onStartingCashChange: (value: string) => void;
  onEndingCashChange: (value: string) => void;
  onNotesChange: (value: string) => void;
}

export function CashCalculationCard({
  dailyFlow,
  startingCash,
  endingCash,
  notes,
  onStartingCashChange,
  onEndingCashChange,
  onNotesChange,
}: CashCalculationCardProps) {
  const calculateExpectedCash = (): number => {
    if (!startingCash) return 0;
    const starting = parseFloat(startingCash) || 0;
    return starting + dailyFlow.cash_flow.net;
  };

  const calculateDifference = (): number | null => {
    if (!endingCash) return null;
    const ending = parseFloat(endingCash);
    const expected = calculateExpectedCash();
    if (isNaN(ending)) return null;
    return ending - expected;
  };

  const expectedCash = calculateExpectedCash();
  const potentialDiff = calculateDifference();

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-xl">💰 Cálculo de Efectivo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Campos de entrada */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <Label htmlFor="starting-cash" className="text-sm font-semibold">
              Efectivo Inicial ($)
            </Label>
            <Input
              id="starting-cash"
              type="number"
              step="0.01"
              min="0"
              value={startingCash}
              onChange={(e) => onStartingCashChange(e.target.value)}
              placeholder="0.00"
              className="text-xl font-mono h-12"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-semibold text-muted-foreground">
              Efectivo Esperado ($)
            </Label>
            <div className="h-12 px-4 py-3 bg-muted/50 rounded-md flex items-center border">
              <span className="text-xl font-mono font-bold">
                ${expectedCash.toFixed(2)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Inicial + Flujo neto
            </p>
          </div>

          <div className="space-y-3">
            <Label htmlFor="ending-cash" className="text-sm font-semibold">
              Efectivo Real ($)
            </Label>
            <Input
              id="ending-cash"
              type="number"
              step="0.01"
              min="0"
              value={endingCash}
              onChange={(e) => onEndingCashChange(e.target.value)}
              placeholder="0.00"
              className="text-xl font-mono h-12"
            />
          </div>
        </div>

        {/* Mostrar diferencia en tiempo real */}
        {potentialDiff !== null && (
          <div
            className={`p-6 rounded-lg border-2 ${
              potentialDiff > 0
                ? "border-green-200 bg-green-50"
                : potentialDiff < 0
                ? "border-red-200 bg-red-50"
                : "border-blue-200 bg-blue-50"
            }`}
          >
            <div className="flex items-center gap-4">
              {potentialDiff > 0 ? (
                <TrendingUp className="h-8 w-8 text-green-600" />
              ) : potentialDiff < 0 ? (
                <TrendingDown className="h-8 w-8 text-red-600" />
              ) : (
                <Minus className="h-8 w-8 text-blue-600" />
              )}
              <div className="flex-1">
                <p className="font-bold text-2xl">
                  {potentialDiff > 0 &&
                    `🎉 Sobrante: $${potentialDiff.toFixed(2)}`}
                  {potentialDiff < 0 &&
                    `⚠️ Faltante: $${Math.abs(potentialDiff).toFixed(2)}`}
                  {potentialDiff === 0 && "✅ Caja Cuadrada Perfectamente"}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Diferencia: Real ${endingCash} - Esperado $
                  {expectedCash.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Advertencia si hay diferencia grande */}
        {potentialDiff !== null && Math.abs(potentialDiff) > 100 && (
          <div className="p-4 rounded-lg border-2 border-amber-200 bg-amber-50">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-amber-800">
                  Diferencia Importante Detectada
                </p>
                <p className="text-sm text-amber-700 mt-1">
                  Hay una diferencia de ${Math.abs(potentialDiff).toFixed(2)}.
                  Verifica los montos y gastos antes de continuar.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Notas */}
        <div className="space-y-3">
          <Label htmlFor="notes" className="text-sm font-semibold">
            Notas del Cierre (Opcional)
          </Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="Notas adicionales sobre el cierre de caja..."
            rows={4}
            className="resize-none"
          />
        </div>
      </CardContent>
    </Card>
  );
}
