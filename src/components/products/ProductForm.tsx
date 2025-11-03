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
import { Switch } from "@/components/ui/switch";
import { ImageUpload } from "./ImageUpload";
import {
  productService,
  type Product,
  type Category,
  type Supplier,
} from "@/services/productService";
import { toast } from "sonner";

interface ProductFormProps {
  product?: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  name: string;
  category_id: string;
  sale_price: number;
  unit_of_measure: "kg" | "pieza" | "rueda" | "bote" | "paquete";
  supplier_id: string;
  can_be_sold_by_weight: boolean;
  is_featured: boolean;
}

export function ProductForm({
  product,
  isOpen,
  onClose,
  onSuccess,
}: ProductFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [removeImage, setRemoveImage] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>();

  const isEditing = !!product;

  // Cargar categorías y proveedores
  useEffect(() => {
    const loadData = async () => {
      try {
        const [categoriesData, suppliersData] = await Promise.all([
          productService.getCategories(),
          productService.getSuppliers(),
        ]);
        setCategories(categoriesData);
        setSuppliers(suppliersData);
      } catch (error) {
        toast.error("Error al cargar datos");
      }
    };

    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  // Resetear form cuando cambia el producto o se abre/cierra
  useEffect(() => {
    if (isOpen) {
      if (product) {
        reset({
          name: product.name,
          category_id: product.category_id,
          sale_price: product.sale_price,
          unit_of_measure: product.unit_of_measure as any,
          supplier_id: product.supplier_id || "",
          can_be_sold_by_weight: product.can_be_sold_by_weight,
          is_featured: product.is_featured,
        });
      } else {
        reset({
          name: "",
          category_id: "",
          sale_price: 0,
          unit_of_measure: "kg",
          supplier_id: "",
          can_be_sold_by_weight: false,
          is_featured: false,
        });
      }
      setImageFile(null);
      setRemoveImage(false);
    }
  }, [product, isOpen, reset]);

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      if (isEditing && product) {
        // Actualizar producto
        await productService.updateProduct(product.product_id, {
          ...data,
          supplier_id: data.supplier_id || undefined,
          image_file: imageFile || undefined,
          remove_image: removeImage,
        });
        toast.success("Producto actualizado exitosamente");
      } else {
        // Crear producto
        await productService.createProduct({
          ...data,
          supplier_id: data.supplier_id || undefined,
          image_file: imageFile || undefined,
        });
        toast.success("Producto creado exitosamente");
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Error al guardar el producto");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (file: File | null) => {
    setImageFile(file);
    setRemoveImage(false);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setRemoveImage(true);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Producto" : "Nuevo Producto"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Imagen del producto */}
          <div className="space-y-2">
            <Label>Imagen del Producto</Label>
            <ImageUpload
              currentImageUrl={product?.image_url}
              onImageChange={handleImageChange}
              onRemoveImage={handleRemoveImage}
              disabled={isLoading}
            />
          </div>

          {/* Información básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del Producto *</Label>
              <Input
                id="name"
                {...register("name", { required: "El nombre es requerido" })}
                disabled={isLoading}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category_id">Categoría *</Label>
              <Select
                value={watch("category_id")}
                onValueChange={(value) => setValue("category_id", value)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem
                      key={category.category_id}
                      value={category.category_id}
                    >
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category_id && (
                <p className="text-sm text-red-500">
                  La categoría es requerida
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sale_price">Precio de Venta *</Label>
              <Input
                id="sale_price"
                type="number"
                step="0.01"
                {...register("sale_price", {
                  required: "El precio es requerido",
                  min: { value: 0, message: "El precio debe ser mayor a 0" },
                })}
                disabled={isLoading}
              />
              {errors.sale_price && (
                <p className="text-sm text-red-500">
                  {errors.sale_price.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit_of_measure">Unidad de Medida *</Label>
              <Select
                value={watch("unit_of_measure")}
                onValueChange={(value) =>
                  setValue("unit_of_measure", value as any)
                }
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar unidad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">Kilogramo (kg)</SelectItem>
                  <SelectItem value="pieza">Pieza</SelectItem>
                  <SelectItem value="rueda">Rueda</SelectItem>
                  <SelectItem value="bote">Bote</SelectItem>
                  <SelectItem value="paquete">Paquete</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="supplier_id">Proveedor (Opcional)</Label>
            <Select
              value={watch("supplier_id")}
              onValueChange={(value) => setValue("supplier_id", value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar proveedor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Sin proveedor</SelectItem>
                {suppliers.map((supplier) => (
                  <SelectItem
                    key={supplier.supplier_id}
                    value={supplier.supplier_id}
                  >
                    {supplier.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Opciones */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="can_be_sold_by_weight">Se vende por peso</Label>
                <p className="text-sm text-muted-foreground">
                  El cliente puede especificar la cantidad exacta en kg
                </p>
              </div>
              <Switch
                id="can_be_sold_by_weight"
                checked={watch("can_be_sold_by_weight")}
                onCheckedChange={(checked) =>
                  setValue("can_be_sold_by_weight", checked)
                }
                disabled={isLoading}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="is_featured">Producto Destacado</Label>
                <p className="text-sm text-muted-foreground">
                  Aparecerá en la sección de productos destacados
                </p>
              </div>
              <Switch
                id="is_featured"
                checked={watch("is_featured")}
                onCheckedChange={(checked) => setValue("is_featured", checked)}
                disabled={isLoading}
              />
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
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Guardando..." : isEditing ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
