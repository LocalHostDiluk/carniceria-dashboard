"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { TrendingDown, Minus, Plus } from "lucide-react";
import { lotService, type InventoryLot } from "@/services/lotService";
import { toast } from "sonner";

interface AdjustmentFormProps {
  lot: InventoryLot | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  adjustment_type: "increase" | "decrease";
  quantity: number;
  reason: string;
  custom_reason: string;
}

const PREDEFINED_REASONS = {
  decrease: [
    { value: "merma", label: "Merma (Deterioro)" },
    { value: "caducado", label: "Producto Caducado" },
    { value: "daño", label: "Daño/Rotura" },
  ],
  increase: [{ value: "ajuste manual", label: "Ajuste manual" }],
} as const;

export function AdjustmentForm({
  lot,
  isOpen,
  onClose,
  onSuccess,
}: AdjustmentFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      adjustment_type: "decrease",
      quantity: 1,
      reason: "merma",
      custom_reason: "",
    },
  });

  const adjustmentType = watch("adjustment_type") || "decrease"; // ✅ CORRECCIÓN: Default fallback
  const selectedReason = watch("reason");
  const quantity = watch("quantity") || 0; // ✅ CORRECCIÓN: Default fallback

  // Reset form cuando se abre
  useEffect(() => {
    if (isOpen) {
      reset({
        adjustment_type: "decrease",
        quantity: 1,
        reason: "merma",
        custom_reason: "",
      });
    }
  }, [isOpen, reset]);

  const onSubmit = async (data: FormData) => {
    if (!lot) return;

    setIsLoading(true);
    try {
      // Calcular cantidad con signo correcto
      const adjustmentQuantity =
        data.adjustment_type === "decrease"
          ? -Math.abs(data.quantity)
          : Math.abs(data.quantity);

      // Determinar la razón final
      const finalReason = data.reason;

      await lotService.adjustLot(lot.lot_id, adjustmentQuantity, finalReason);

      toast.success("Ajuste de inventario registrado exitosamente");
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Error al registrar el ajuste");
    } finally {
      setIsLoading(false);
    }
  };

  if (!lot) return null;

  const maxDecrease = lot.stock_quantity;
  const newStock =
    adjustmentType === "decrease"
      ? lot.stock_quantity - quantity
      : lot.stock_quantity + quantity;

  // ✅ CORRECCIÓN: Verificar que adjustmentType existe antes de hacer map
  const reasonOptions =
    PREDEFINED_REASONS[adjustmentType] || PREDEFINED_REASONS.decrease;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5" />
            Ajustar Inventario
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Lote: {lot.lot_id.slice(0, 8)}... - Stock actual:{" "}
            {lot.stock_quantity}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Tipo de ajuste */}
          <div className="space-y-2">
            <Label>Tipo de Ajuste</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={adjustmentType === "decrease" ? "default" : "outline"}
                onClick={() => {
                  setValue("adjustment_type", "decrease");
                  setValue("reason", "merma"); // Reset reason cuando cambia tipo
                }}
                className="gap-2"
              >
                <Minus className="h-4 w-4" />
                Reducir
              </Button>
              <Button
                type="button"
                variant={adjustmentType === "increase" ? "default" : "outline"}
                onClick={() => {
                  setValue("adjustment_type", "increase");
                  setValue("reason", "ajuste manual"); // Reset reason cuando cambia tipo
                }}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Aumentar
              </Button>
            </div>
          </div>

          {/* Cantidad */}
          <div className="space-y-2">
            <Label htmlFor="quantity">
              Cantidad{" "}
              {adjustmentType === "decrease" ? "a reducir" : "a agregar"} *
            </Label>
            <Input
              id="quantity"
              type="number"
              step="0.01"
              {...register("quantity", {
                required: "La cantidad es requerida",
                min: { value: 0.01, message: "La cantidad debe ser mayor a 0" },
                max:
                  adjustmentType === "decrease"
                    ? {
                        value: maxDecrease,
                        message: `No puedes reducir más de ${maxDecrease}`,
                      }
                    : undefined,
              })}
              disabled={isLoading}
            />
            {errors.quantity && (
              <p className="text-sm text-red-500">{errors.quantity.message}</p>
            )}

            {/* Preview del nuevo stock */}
            <div className="text-sm text-muted-foreground">
              Nuevo stock:{" "}
              <span className="font-medium">
                {newStock >= 0 ? newStock : 0}
              </span>
            </div>
          </div>

          {/* Razón */}
          <div className="space-y-2">
            <Label htmlFor="reason">Razón del Ajuste *</Label>
            <Select
              value={watch("reason") || reasonOptions[0]?.value}
              onValueChange={(value) => setValue("reason", value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar razón" />
              </SelectTrigger>
              <SelectContent>
                {reasonOptions.map((reason) => (
                  <SelectItem key={reason.value} value={reason.value}>
                    {reason.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Campo para razón personalizada */}
          {selectedReason === "custom" && (
            <div className="space-y-2">
              <Label htmlFor="custom_reason">Especificar Razón *</Label>
              <Textarea
                id="custom_reason"
                placeholder="Describe la razón del ajuste..."
                {...register("custom_reason", {
                  required:
                    selectedReason === "custom"
                      ? "La razón personalizada es requerida"
                      : false,
                })}
                disabled={isLoading}
              />
              {errors.custom_reason && (
                <p className="text-sm text-red-500">
                  {errors.custom_reason.message}
                </p>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              variant={
                adjustmentType === "decrease" ? "destructive" : "default"
              }
            >
              {isLoading
                ? "Procesando..."
                : adjustmentType === "decrease"
                ? "Reducir Stock"
                : "Aumentar Stock"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
