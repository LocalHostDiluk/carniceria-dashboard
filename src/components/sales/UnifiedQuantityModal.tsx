"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calculator, Package, Scale } from "lucide-react";
import type { ProductWithCategory } from "@/services/productService";

interface UnifiedQuantityModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ProductWithCategory | null;
  onConfirm: (
    productId: string,
    name: string,
    price: number,
    quantity: number
  ) => void;
}

export function UnifiedQuantityModal({
  isOpen,
  onClose,
  product,
  onConfirm,
}: UnifiedQuantityModalProps) {
  const [quantity, setQuantity] = useState("");
  const [error, setError] = useState("");

  // Resetear cuando se abre/cierra el modal
  useEffect(() => {
    if (isOpen) {
      setQuantity("");
      setError("");
    }
  }, [isOpen]);

  if (!product) return null;

  const isWeightProduct = product.unit_of_measure === "kg";
  const modalTitle = isWeightProduct
    ? "Ingrese el Peso"
    : "Ingrese la Cantidad";
  const inputLabel = isWeightProduct ? "Peso (kg)" : "Cantidad";
  const inputPlaceholder = isWeightProduct ? "Ej: 2.5" : "Ej: 10";
  const Icon = isWeightProduct ? Scale : Package;

  // Calcular precio total
  const numericQuantity = parseFloat(quantity) || 0;
  const totalPrice = numericQuantity * product.sale_price;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    if (!quantity.trim()) {
      setError(
        `Por favor ingrese ${isWeightProduct ? "el peso" : "la cantidad"}`
      );
      return;
    }

    const numericValue = parseFloat(quantity);

    if (isNaN(numericValue) || numericValue <= 0) {
      setError(
        `Por favor ingrese ${
          isWeightProduct ? "un peso" : "una cantidad"
        } válida mayor a 0`
      );
      return;
    }

    if (isWeightProduct && numericValue > 50) {
      setError("El peso no puede ser mayor a 50 kg");
      return;
    }

    if (!isWeightProduct && numericValue > 1000) {
      setError("La cantidad no puede ser mayor a 1000");
      return;
    }

    if (!isWeightProduct && numericValue % 1 !== 0) {
      setError("La cantidad debe ser un número entero");
      return;
    }

    // Todo válido, confirmar
    onConfirm(
      product.product_id,
      product.name,
      product.sale_price,
      numericValue
    );
    onClose();
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
            <Icon className="h-5 w-5" />
            {modalTitle}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Información del producto */}
          <div className="rounded-lg bg-muted p-3">
            <h3 className="font-medium text-sm">{product.name}</h3>
            <p className="text-sm text-muted-foreground">
              {formatCurrency(product.sale_price)} por {product.unit_of_measure}
            </p>
          </div>

          {/* Input de cantidad/peso */}
          <div className="space-y-2">
            <Label htmlFor="quantity">{inputLabel}</Label>
            <Input
              id="quantity"
              type="number"
              step={isWeightProduct ? "0.01" : "1"}
              min="0"
              placeholder={inputPlaceholder}
              value={quantity}
              onChange={(e) => {
                setQuantity(e.target.value);
                setError("");
              }}
              autoFocus
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>

          {/* Cálculo en tiempo real */}
          {numericQuantity > 0 && (
            <div className="rounded-lg bg-green-50 border border-green-200 p-3">
              <div className="flex items-center gap-2 text-green-800">
                <Calculator className="h-4 w-4" />
                <span className="font-medium">Precio Total</span>
              </div>
              <div className="mt-1">
                <span className="text-lg font-bold text-green-900">
                  {formatCurrency(totalPrice)}
                </span>
                <span className="text-sm text-green-700 ml-2">
                  ({numericQuantity} {product.unit_of_measure} ×{" "}
                  {formatCurrency(product.sale_price)})
                </span>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!quantity || numericQuantity <= 0}>
              Agregar al Ticket
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
