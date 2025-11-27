"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { type Supplier } from "@/services/supplierService";

interface SupplierFormProps {
  supplier: Supplier | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SupplierFormData) => Promise<void>;
  isLoading: boolean;
}

export interface SupplierFormData {
  name: string;
  contact_info: string;
}

export function SupplierForm({
  supplier,
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: SupplierFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SupplierFormData>();

  useEffect(() => {
    if (isOpen) {
      reset({
        name: supplier?.name || "",
        contact_info: supplier?.contact_info || "",
      });
    }
  }, [isOpen, supplier, reset]);

  const handleFormSubmit = async (data: SupplierFormData) => {
    await onSubmit(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {supplier ? "Editar Proveedor" : "Nuevo Proveedor"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre del Proveedor *</Label>
            <Input
              id="name"
              {...register("name", {
                required: "El nombre es requerido",
                minLength: {
                  value: 2,
                  message: "El nombre debe tener al menos 2 caracteres",
                },
                maxLength: {
                  value: 100,
                  message: "El nombre no puede exceder 100 caracteres",
                },
              })}
              placeholder="Ej: Carnes Premium S.A."
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact_info">Información de Contacto</Label>
            <Textarea
              id="contact_info"
              {...register("contact_info", {
                maxLength: {
                  value: 500,
                  message:
                    "La información de contacto no puede exceder 500 caracteres",
                },
              })}
              placeholder="Tel: 123-456-7890&#10;Email: contacto@ejemplo.com&#10;Dirección: Calle 123, Ciudad"
              rows={4}
              disabled={isLoading}
            />
            {errors.contact_info && (
              <p className="text-sm text-red-500">
                {errors.contact_info.message}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Puedes incluir teléfono, email, dirección, etc.
            </p>
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
              {isLoading ? "Guardando..." : supplier ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
