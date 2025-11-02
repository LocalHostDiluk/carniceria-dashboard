// src/app/sales/components/PaymentDialog.tsx
"use client";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
  onConfirm: (paymentMethod: "efectivo" | "tarjeta") => void;
}

export const PaymentDialog = ({
  isOpen,
  onClose,
  totalAmount,
  onConfirm,
}: PaymentDialogProps) => {
  const [paymentMethod, setPaymentMethod] = useState<"efectivo" | "tarjeta">(
    "efectivo"
  );
  const [amountReceived, setAmountReceived] = useState("");

  const change = useMemo(() => {
    const received = parseFloat(amountReceived);
    if (
      paymentMethod === "efectivo" &&
      !isNaN(received) &&
      received >= totalAmount
    ) {
      return received - totalAmount;
    }
    return 0;
  }, [amountReceived, totalAmount, paymentMethod]);

  const handleConfirm = () => {
    onConfirm(paymentMethod);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Finalizar Venta</DialogTitle>
          <DialogDescription>
            Selecciona el método de pago e ingresa el monto recibido.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="text-center mb-4">
            <p className="text-sm text-muted-foreground">Total a Pagar</p>
            <p className="text-4xl font-bold">${totalAmount.toFixed(2)}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant={paymentMethod === "efectivo" ? "default" : "outline"}
              onClick={() => setPaymentMethod("efectivo")}
            >
              Efectivo
            </Button>
            <Button
              variant={paymentMethod === "tarjeta" ? "default" : "outline"}
              onClick={() => setPaymentMethod("tarjeta")}
            >
              Tarjeta
            </Button>
          </div>
          {paymentMethod === "efectivo" && (
            <div className="grid gap-2">
              <Label htmlFor="amount-received">Monto Recibido</Label>
              <Input
                id="amount-received"
                type="number"
                placeholder="Ej: 500"
                value={amountReceived}
                onChange={(e) => setAmountReceived(e.target.value)}
              />
              <div className="text-right font-medium">
                <span className="text-muted-foreground">Cambio: </span>
                <span>${change.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            type="button"
            onClick={handleConfirm}
            size="lg"
            className="w-full"
          >
            Confirmar Venta
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
