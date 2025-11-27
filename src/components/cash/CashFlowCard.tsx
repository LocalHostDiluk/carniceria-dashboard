"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import type { DailyCashFlow } from "@/types/models";

interface CashFlowCardProps {
  dailyFlow: DailyCashFlow;
}

export function CashFlowCard({ dailyFlow }: CashFlowCardProps) {
  const isPositive = dailyFlow.cash_flow.net >= 0;

  return (
    <Card
      className={`border-2 ${
        isPositive
          ? "border-green-300 bg-green-50/50"
          : "border-red-300 bg-red-50/50"
      }`}
    >
      <CardContent className="pt-8 pb-8">
        <div className="text-center space-y-4">
          <Label className="text-xl font-semibold text-muted-foreground">
            💰 Flujo Neto de Efectivo
          </Label>

          <div
            className={`text-5xl font-bold ${
              isPositive ? "text-green-600" : "text-red-600"
            }`}
          >
            {isPositive ? "+" : ""}${dailyFlow.cash_flow.net.toFixed(2)}
          </div>

          <div className="flex justify-center items-center gap-4 text-muted-foreground">
            <div className="text-center">
              <p className="text-sm font-medium">Entrada</p>
              <p className="text-lg font-bold text-green-600">
                +${dailyFlow.cash_flow.in.toFixed(2)}
              </p>
            </div>

            <div className="text-2xl font-bold text-muted-foreground">-</div>

            <div className="text-center">
              <p className="text-sm font-medium">Salida</p>
              <p className="text-lg font-bold text-red-600">
                ${dailyFlow.cash_flow.out.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
