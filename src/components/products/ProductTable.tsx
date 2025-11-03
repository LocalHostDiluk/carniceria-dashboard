"use client";

import { useState } from "react";
import { Edit, MoreHorizontal, Eye, EyeOff, Star, StarOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { productService, type Product } from "@/services/productService";
import { toast } from "sonner";
import { getImageFallback, getImageUrl } from "@/lib/imageUtils";
import { Package2, Plus } from "lucide-react";

interface ProductTableProps {
  products: Product[];
  isLoading: boolean;
  onEdit: (product: Product) => void;
  onViewLots: (product: Product) => void;
  onCreateLot: (product: Product) => void;
  onRefresh: () => void;
}

export function ProductTable({
  products,
  isLoading,
  onEdit,
  onViewLots,
  onCreateLot,
  onRefresh,
}: ProductTableProps) {
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount);
  };

  const handleToggleActive = async (product: Product) => {
    setActionLoading(`active-${product.product_id}`);
    try {
      await productService.toggleActive(product.product_id, !product.is_active);
      toast.success(
        product.is_active
          ? "Producto desactivado exitosamente"
          : "Producto activado exitosamente"
      );
      onRefresh();
    } catch (error: any) {
      toast.error(error.message || "Error al cambiar estado del producto");
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleFeatured = async (product: Product) => {
    setActionLoading(`featured-${product.product_id}`);
    try {
      await productService.toggleFeatured(
        product.product_id,
        !product.is_featured
      );
      toast.success(
        product.is_featured
          ? "Producto removido de destacados"
          : "Producto marcado como destacado"
      );
      onRefresh();
    } catch (error: any) {
      toast.error(error.message || "Error al cambiar estado destacado");
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="space-y-3">
          <div className="text-6xl">📦</div>
          <h3 className="text-lg font-semibold">No hay productos</h3>
          <p className="text-muted-foreground">
            Comienza agregando tu primer producto al catálogo
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16"></TableHead>
            <TableHead>Producto</TableHead>
            <TableHead>Categoría</TableHead>
            <TableHead>Precio</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="w-16"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.product_id}>
              {/* Imagen */}
              <TableCell>
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={
                      getImageUrl(product.image_url) ||
                      getImageFallback(product.name)
                    }
                    alt={product.name}
                    className="object-cover"
                    onError={(e) => {
                      // Fallback si la imagen falla al cargar
                      const target = e.target as HTMLImageElement;
                      target.src = getImageFallback(product.name);
                    }}
                  />
                  <AvatarFallback>
                    {product.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </TableCell>

              {/* Información del producto */}
              <TableCell>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{product.name}</span>
                    {product.is_featured && (
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {product.unit_of_measure}
                    {product.can_be_sold_by_weight && " • Se vende por peso"}
                  </div>
                  {product.supplier_name && (
                    <div className="text-xs text-muted-foreground">
                      Proveedor: {product.supplier_name}
                    </div>
                  )}
                </div>
              </TableCell>

              {/* Categoría */}
              <TableCell>
                <Badge variant="outline">
                  {product.category_name || "Sin categoría"}
                </Badge>
              </TableCell>

              {/* Precio */}
              <TableCell className="font-medium">
                {formatCurrency(product.sale_price)}
              </TableCell>

              {/* Stock */}
              <TableCell>
                <div className="space-y-1">
                  <div className="font-medium">
                    {product.total_stock || 0} {product.unit_of_measure}
                  </div>
                  {product.active_lots !== undefined && (
                    <div className="text-xs text-muted-foreground">
                      {product.active_lots} lote
                      {product.active_lots !== 1 ? "s" : ""}
                    </div>
                  )}
                </div>
              </TableCell>

              {/* Estado */}
              <TableCell>
                <div className="space-y-1">
                  <Badge variant={product.is_active ? "default" : "secondary"}>
                    {product.is_active ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
              </TableCell>

              {/* Acciones */}
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(product)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={() => onViewLots(product)}>
                      <Package2 className="h-4 w-4 mr-2" />
                      Ver Lotes
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={() => onCreateLot(product)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Nuevo Lote
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      onClick={() => handleToggleActive(product)}
                      disabled={
                        actionLoading === `active-${product.product_id}`
                      }
                    >
                      {product.is_active ? (
                        <>
                          <EyeOff className="h-4 w-4 mr-2" />
                          Desactivar
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4 mr-2" />
                          Activar
                        </>
                      )}
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() => handleToggleFeatured(product)}
                      disabled={
                        actionLoading === `featured-${product.product_id}`
                      }
                    >
                      {product.is_featured ? (
                        <>
                          <StarOff className="h-4 w-4 mr-2" />
                          Quitar destacado
                        </>
                      ) : (
                        <>
                          <Star className="h-4 w-4 mr-2" />
                          Marcar destacado
                        </>
                      )}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
