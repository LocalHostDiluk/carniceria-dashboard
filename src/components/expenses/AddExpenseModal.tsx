"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

import { expenseService } from "@/services/expenseService";
import type {
  ExpenseRequest,
  ExpenseCategory,
  PaymentMethod,
} from "@/services/expenseService";
import {
  expenseCategories,
  paymentMethodLabels,
} from "@/services/expenseService";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

interface AddExpenseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AddExpenseModal({
  open,
  onOpenChange,
  onSuccess,
}: AddExpenseModalProps) {
  // Estados del formulario
  const [amount, setAmount] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [category, setCategory] = useState<ExpenseCategory | "">("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "">("");
  const [isLoading, setIsLoading] = useState(false);

  const resetForm = () => {
    setAmount("");
    setDescription("");
    setCategory("");
    setPaymentMethod("");
  };

  const handleSubmit = async () => {
    // Validaciones
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error("Ingresa un monto válido mayor a 0");
      return;
    }

    if (!description.trim()) {
      toast.error("Ingresa una descripción del gasto");
      return;
    }

    if (!category) {
      toast.error("Selecciona una categoría");
      return;
    }

    if (!paymentMethod) {
      toast.error("Selecciona un método de pago");
      return;
    }

    setIsLoading(true);

    const request: ExpenseRequest = {
      amount: amountNum,
      description: description.trim(),
      category,
      payment_method: paymentMethod,
    };

    try {
      await expenseService.createExpense(request);

      toast.success("💰 Gasto registrado exitosamente", {
        description: `${
          expenseCategories[category].icon
        } ${description} - $${amountNum.toFixed(2)}`,
      });

      resetForm();
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating expense:", error);
      toast.error("Error al registrar el gasto");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>💸 Registrar Gasto</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Monto */}
          <div className="space-y-2">
            <Label htmlFor="amount">Monto ($)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="text-lg font-mono"
            />
          </div>

          {/* Categoría */}
          <div className="space-y-2">
            <Label htmlFor="category">Categoría</Label>
            <Select
              value={category}
              onValueChange={(value) => setCategory(value as ExpenseCategory)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona categoría..." />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(expenseCategories).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <span>{config.icon}</span>
                      <div>
                        <div className="font-medium">{config.label}</div>
                        <div className="text-xs text-muted-foreground">
                          {config.description}
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Método de pago */}
          <div className="space-y-2">
            <Label htmlFor="payment-method">Método de Pago</Label>
            <Select
              value={paymentMethod}
              onValueChange={(value) =>
                setPaymentMethod(value as PaymentMethod)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona método..." />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(paymentMethodLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej: Gasolina para camión de entregas..."
              rows={3}
            />
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={isLoading}
            >
              Cancelar
            </Button>

            <Button
              onClick={handleSubmit}
              disabled={
                isLoading ||
                !amount ||
                !description.trim() ||
                !category ||
                !paymentMethod
              }
              className="flex-1"
            >
              {isLoading ? "Guardando..." : "Registrar Gasto"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
