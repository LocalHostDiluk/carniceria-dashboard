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
import { lotService } from "@/services/lotService";
import type { InventoryLot } from "@/types/models";
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

// Razones SOLO para DISMINUIR
const DECREASE_REASONS = [
  { value: "merma", label: "Merma (Deterioro)" },
  { value: "caducado", label: "Producto Caducado" },
  { value: "daño", label: "Daño/Rotura" },
  { value: "ajuste manual", label: "Ajuste manual" },
  { value: "custom", label: "Personalizada (escribir motivo)" },
] as const;

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

  const adjustmentType = watch("adjustment_type") || "decrease";
  const selectedReason = watch("reason");
  const quantity = watch("quantity") || 0;

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

    // Validar cantidad
    if (!data.quantity || data.quantity <= 0) {
      toast.error("La cantidad debe ser mayor a 0.");
      return;
    }

    const roundedQty = Number(data.quantity.toFixed(2));

    // No reducir más del stock disponible
    if (
      data.adjustment_type === "decrease" &&
      roundedQty > lot.stock_quantity
    ) {
      toast.error(
        `No puedes reducir más del stock disponible. Stock actual: ${lot.stock_quantity}`
      );
      return;
    }

    // Determinar razón final
    let finalReason = "";

    if (data.adjustment_type === "increase") {
      // AUMENTAR → sólo texto manual
      if (!data.custom_reason || data.custom_reason.trim() === "") {
        toast.error("Debes escribir la razón del aumento de stock.");
        return;
      }
      finalReason = data.custom_reason.trim();
    } else {
      // DISMINUIR → select + opcional personalizada
      if (!data.reason) {
        toast.error("Debes seleccionar una razón para el ajuste.");
        return;
      }

      if (data.reason === "custom") {
        if (!data.custom_reason || data.custom_reason.trim() === "") {
          toast.error("Debes especificar la razón personalizada.");
          return;
        }
        finalReason = data.custom_reason.trim();
      } else {
        finalReason = data.reason;
      }
    }

    setIsLoading(true);
    try {
      const adjustmentQuantity =
        data.adjustment_type === "decrease" ? -roundedQty : roundedQty;

      await lotService.adjustLot(lot.lot_id, adjustmentQuantity, finalReason);

      toast.success("Ajuste de inventario registrado exitosamente");
      onSuccess();
      onClose();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error?.message || "Error al registrar el ajuste");
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
                  setValue("reason", "merma");
                  setValue("custom_reason", "");
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
                  // Para aumentar ignoramos el select, sólo usamos custom_reason
                  setValue("reason", "");
                  setValue("custom_reason", "");
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
                valueAsNumber: true,
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

          {/* Razón para DISMINUIR: select + opcional personalizada */}
          {adjustmentType === "decrease" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="reason">Razón del Ajuste *</Label>
                <Select
                  value={selectedReason || DECREASE_REASONS[0].value}
                  onValueChange={(value) => setValue("reason", value)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar razón" />
                  </SelectTrigger>
                  <SelectContent>
                    {DECREASE_REASONS.map((reason) => (
                      <SelectItem key={reason.value} value={reason.value}>
                        {reason.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedReason === "custom" && (
                <div className="space-y-2">
                  <Label htmlFor="custom_reason">Especificar Razón *</Label>
                  <Textarea
                    id="custom_reason"
                    placeholder="Describe la razón del ajuste..."
                    {...register("custom_reason")}
                    disabled={isLoading}
                  />
                </div>
              )}
            </>
          )}

          {/* Razón para AUMENTAR: sólo texto */}
          {adjustmentType === "increase" && (
            <div className="space-y-2">
              <Label htmlFor="custom_reason">Razón del Aumento *</Label>
              <Textarea
                id="custom_reason"
                placeholder="Escribe la razón por la que deseas aumentar el stock..."
                {...register("custom_reason")}
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
