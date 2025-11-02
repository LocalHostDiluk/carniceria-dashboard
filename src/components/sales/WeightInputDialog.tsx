// src/app/sales/components/WeightInputDialog.tsx
"use client";
import { useState } from "react";
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
import type { ProductWithCategory } from "@/services/productService";

interface WeightInputDialogProps {
  isOpen: boolean;
  onClose: () => void;
  product: ProductWithCategory | null;
  onConfirm: (
    productId: string,
    name: string,
    price: number,
    weight: number
  ) => void;
}

export const WeightInputDialog = ({
  isOpen,
  onClose,
  product,
  onConfirm,
}: WeightInputDialogProps) => {
  const [weight, setWeight] = useState("");

  const handleConfirm = () => {
    const numericWeight = parseFloat(weight);
    if (product && !isNaN(numericWeight) && numericWeight > 0) {
      onConfirm(
        product.product_id,
        product.name,
        product.sale_price,
        numericWeight
      );
      setWeight(""); // Limpia el input para la próxima vez
      onClose();
    }
  };

  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{product.name}</DialogTitle>
          <DialogDescription>
            Introduce el peso del producto en kilogramos (ej: 0.850).
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="weight" className="text-right">
              Peso (kg)
            </Label>
            <Input
              id="weight"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="col-span-3"
              type="number"
              step="0.001"
              placeholder="ej: 0.850"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" onClick={handleConfirm}>
            Confirmar Peso
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
