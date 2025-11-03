"use client";

import { useState, useEffect } from "react";
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
import { CalendarDays, Package } from "lucide-react";
import { lotService } from "@/services/lotService";
import { toast } from "sonner";

interface LotFormProps {
  product: { product_id: string; name: string; unit_of_measure: string } | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  stock_quantity: number;
  purchase_price: number;
  purchase_id: string;
  expiration_date: string;
}

export function LotForm({ product, isOpen, onClose, onSuccess }: LotFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [purchases, setPurchases] = useState<
    Array<{
      purchase_id: string;
      supplier_name: string;
      purchase_date: string;
      total_cost: number;
    }>
  >([]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>();

  // Cargar lista de compras
  useEffect(() => {
    const loadPurchases = async () => {
      try {
        const data = await lotService.getPurchases();
        setPurchases(data);
      } catch (error) {
        toast.error("Error al cargar compras");
      }
    };

    if (isOpen) {
      loadPurchases();
    }
  }, [isOpen]);

  // Reset form cuando se abre/cierra
  useEffect(() => {
    if (isOpen) {
      reset({
        stock_quantity: 0,
        purchase_price: 0,
        purchase_id: "",
        expiration_date: "",
      });
    }
  }, [isOpen, reset]);

  const onSubmit = async (data: FormData) => {
    if (!product) return;

    setIsLoading(true);
    try {
      await lotService.createLot({
        product_id: product.product_id,
        stock_quantity: data.stock_quantity,
        purchase_price: data.purchase_price,
        purchase_id: data.purchase_id,
        expiration_date: data.expiration_date || undefined,
      });

      toast.success("Lote creado exitosamente");
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Error al crear el lote");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("es-MX").format(new Date(dateString));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount);
  };

  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Nuevo Lote - {product.name}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stock_quantity">
                Cantidad Inicial * ({product.unit_of_measure})
              </Label>
              <Input
                id="stock_quantity"
                type="number"
                step="0.01"
                {...register("stock_quantity", {
                  required: "La cantidad es requerida",
                  min: {
                    value: 0.01,
                    message: "La cantidad debe ser mayor a 0",
                  },
                })}
                disabled={isLoading}
              />
              {errors.stock_quantity && (
                <p className="text-sm text-red-500">
                  {errors.stock_quantity.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="purchase_price">Precio de Compra *</Label>
              <Input
                id="purchase_price"
                type="number"
                step="0.01"
                {...register("purchase_price", {
                  required: "El precio de compra es requerido",
                  min: {
                    value: 0,
                    message: "El precio debe ser mayor o igual a 0",
                  },
                })}
                disabled={isLoading}
              />
              {errors.purchase_price && (
                <p className="text-sm text-red-500">
                  {errors.purchase_price.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="purchase_id">Compra Asociada *</Label>
            <Select
              value={watch("purchase_id")}
              onValueChange={(value) => setValue("purchase_id", value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar compra" />
              </SelectTrigger>
              <SelectContent>
                {purchases.map((purchase) => (
                  <SelectItem
                    key={purchase.purchase_id}
                    value={purchase.purchase_id}
                  >
                    <div className="flex flex-col">
                      <span>{purchase.supplier_name}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(purchase.purchase_date)} -{" "}
                        {formatCurrency(purchase.total_cost)}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.purchase_id && (
              <p className="text-sm text-red-500">La compra es requerida</p>
            )}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="expiration_date"
              className="flex items-center gap-2"
            >
              <CalendarDays className="h-4 w-4" />
              Fecha de Caducidad (Opcional)
            </Label>
            <Input
              id="expiration_date"
              type="date"
              {...register("expiration_date")}
              disabled={isLoading}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creando..." : "Crear Lote"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
