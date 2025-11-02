"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  CheckCircle,
  CreditCard,
  Smartphone,
  Banknote,
  Loader2,
} from "lucide-react";
import type { CartItem } from "@/components/sales/TicketItem";

interface SaleConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  total: number;
  onConfirmSale: (
    paymentMethod: "efectivo" | "tarjeta" | "transferencia"
  ) => Promise<void>;
}

export function SaleConfirmationModal({
  isOpen,
  onClose,
  cartItems,
  total,
  onConfirmSale,
}: SaleConfirmationModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<
    "efectivo" | "tarjeta" | "transferencia"
  >("efectivo");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirm = async () => {
    try {
      setIsProcessing(true);
      await onConfirmSale(paymentMethod);
      // El modal se cierra desde el componente padre después del éxito
    } catch (error) {
      // El error se maneja en el componente padre
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Confirmar Venta
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Resumen de productos */}
          <div className="space-y-3">
            <h3 className="font-medium text-sm">Resumen de productos:</h3>
            <div className="bg-muted rounded-lg p-3 max-h-32 overflow-y-auto">
              {cartItems.map((item, index) => (
                <div key={index} className="flex justify-between text-sm py-1">
                  <span>{item.name}</span>
                  <span>
                    {item.quantity} × {formatCurrency(item.price)}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Total:</span>
              <span className="text-green-700">{formatCurrency(total)}</span>
            </div>
          </div>

          {/* Método de pago */}
          <div className="space-y-3">
            <Label className="font-medium">Método de pago:</Label>
            <RadioGroup
              value={paymentMethod}
              onValueChange={(value) => setPaymentMethod(value as any)}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2 p-2 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="efectivo" id="efectivo" />
                <Label
                  htmlFor="efectivo"
                  className="flex items-center gap-2 cursor-pointer flex-1"
                >
                  <Banknote className="h-4 w-4" />
                  Efectivo
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-2 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="tarjeta" id="tarjeta" />
                <Label
                  htmlFor="tarjeta"
                  className="flex items-center gap-2 cursor-pointer flex-1"
                >
                  <CreditCard className="h-4 w-4" />
                  Tarjeta (Débito/Crédito)
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-2 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="transferencia" id="transferencia" />
                <Label
                  htmlFor="transferencia"
                  className="flex items-center gap-2 cursor-pointer flex-1"
                >
                  <Smartphone className="h-4 w-4" />
                  Transferencia
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isProcessing}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isProcessing}
            className="min-w-24"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Procesando...
              </>
            ) : (
              `Confirmar ${formatCurrency(total)}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
