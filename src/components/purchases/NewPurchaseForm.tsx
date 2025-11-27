"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
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
import { Plus, Trash2, Calculator } from "lucide-react";
import { productService } from "@/services/productService";
import { supplierService } from "@/services/supplierService";
import { type Product } from "@/types/models"; // Asegúrate que Product tenga las interfaces correctas
import { type Supplier } from "@/services/supplierService";
import { Separator } from "@/components/ui/separator";

interface NewPurchaseFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  isLoading: boolean;
}

export function NewPurchaseForm({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: NewPurchaseFormProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  const { register, control, handleSubmit, watch, reset, setValue } = useForm({
    defaultValues: {
      supplier_id: "",
      payment_method: "efectivo",
      items: [
        { product_id: "", quantity: 1, unit_cost: 0, expiration_date: "" },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  // Cargar catálogos al abrir
  useEffect(() => {
    if (isOpen) {
      const loadData = async () => {
        const [prods, supps] = await Promise.all([
          productService.getProducts(), // Idealmente usar getAllProducts sin paginación si tienes muchos
          supplierService.getAllSuppliers(),
        ]);
        setProducts(prods);
        setSuppliers(supps);
      };
      loadData();
      reset(); // Resetear formulario
    }
  }, [isOpen]);

  const watchedItems = watch("items");

  // Calcular total en tiempo real
  const totalAmount = watchedItems.reduce((sum, item) => {
    return sum + Number(item.quantity || 0) * Number(item.unit_cost || 0);
  }, 0);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(val);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar Nueva Compra</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Cabecera de Compra */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Proveedor *</Label>
              <Select
                onValueChange={(val) => setValue("supplier_id", val)}
                defaultValue={watch("supplier_id")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar proveedor" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((s) => (
                    <SelectItem key={s.supplier_id} value={s.supplier_id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Método de Pago</Label>
              <Select
                onValueChange={(val) => setValue("payment_method", val as any)}
                defaultValue="efectivo"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar método" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="efectivo">Efectivo</SelectItem>
                  <SelectItem value="tarjeta">Tarjeta</SelectItem>
                  <SelectItem value="transferencia">Transferencia</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Lista de Productos */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Productos a ingresar</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  append({
                    product_id: "",
                    quantity: 1,
                    unit_cost: 0,
                    expiration_date: "",
                  })
                }
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Producto
              </Button>
            </div>

            {fields.map((field, index) => (
              <div
                key={field.id}
                className="grid grid-cols-12 gap-2 items-end border p-3 rounded-md bg-muted/10"
              >
                <div className="col-span-12 md:col-span-4 space-y-1">
                  <Label className="text-xs">Producto</Label>
                  <Select
                    onValueChange={(val) =>
                      setValue(`items.${index}.product_id`, val)
                    }
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Producto..." />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((p) => (
                        <SelectItem key={p.product_id} value={p.product_id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-4 md:col-span-2 space-y-1">
                  <Label className="text-xs">Cantidad</Label>
                  <Input
                    type="number"
                    step="0.01"
                    className="h-8"
                    {...register(`items.${index}.quantity`, {
                      required: true,
                      min: 0.01,
                    })}
                  />
                </div>

                <div className="col-span-4 md:col-span-2 space-y-1">
                  <Label className="text-xs">Costo Unit.</Label>
                  <Input
                    type="number"
                    step="0.01"
                    className="h-8"
                    {...register(`items.${index}.unit_cost`, {
                      required: true,
                      min: 0,
                    })}
                  />
                </div>

                <div className="col-span-11 md:col-span-3 space-y-1">
                  <Label className="text-xs">Caducidad (Opcional)</Label>
                  <Input
                    type="date"
                    className="h-8"
                    {...register(`items.${index}.expiration_date`)}
                  />
                </div>

                <div className="col-span-1 text-right">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            {fields.length === 0 && (
              <div className="text-center py-4 text-muted-foreground text-sm">
                No hay productos agregados a la compra.
              </div>
            )}
          </div>

          <Separator />

          {/* Footer con Totales */}
          <div className="flex justify-end items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total Estimado</p>
              <p className="text-2xl font-bold text-primary">
                {formatCurrency(totalAmount)}
              </p>
            </div>
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
            <Button type="submit" disabled={isLoading || totalAmount <= 0}>
              {isLoading ? "Registrando..." : "Confirmar Compra"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
