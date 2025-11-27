"use client";

import { useState, useEffect, useCallback } from "react";
import { Package, TrendingDown, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { lotService } from "@/services/lotService";
import type { InventoryLot, Product } from "@/types/models";
import { toast } from "sonner";

interface ProductLotsModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onCreateLot: (product: Product) => void;
  onAdjustLot: (lot: InventoryLot) => void;
  refreshKey: number;
}

export function ProductLotsModal({
  product,
  isOpen,
  onClose,
  onCreateLot,
  onAdjustLot,
  refreshKey,
}: ProductLotsModalProps) {
  const [lots, setLots] = useState<InventoryLot[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadLots = useCallback(async () => {
    if (!product) return;

    try {
      setIsLoading(true);
      const data = await lotService.getProductLots(product.product_id);
      setLots(data);
    } catch (error) {
      toast.error("Error al cargar lotes: " + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [product]);

  // Cargar lotes cuando se abre el modal
  useEffect(() => {
    if (isOpen && product) {
      loadLots();
    }
  }, [isOpen, product, refreshKey, loadLots]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Sin fecha";
    return new Intl.DateTimeFormat("es-MX").format(new Date(dateString));
  };

  const getStatusBadge = (
    status: InventoryLot["status"],
    daysUntilExpiry: number | null
  ) => {
    switch (status) {
      case "caducado":
        return <Badge variant="destructive">Caducado</Badge>;
      case "próximo_a_caducar":
        return (
          <Badge variant="secondary" className="bg-orange-100 text-orange-800">
            {daysUntilExpiry} días
          </Badge>
        );
      case "stock_bajo":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            Stock Bajo
          </Badge>
        );
      case "agotado":
        return <Badge variant="outline">Agotado</Badge>;
      default:
        return <Badge variant="default">Normal</Badge>;
    }
  };

  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Lotes de Inventario - {product.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Header con stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
              <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                {lots.length}
              </div>
              <div className="text-sm text-blue-600 dark:text-blue-400">
                Lotes activos
              </div>
            </div>
            <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg">
              <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                {lots.reduce((sum, lot) => sum + lot.stock_quantity, 0)}
              </div>
              <div className="text-sm text-green-600 dark:text-green-400">
                {product.unit_of_measure} en stock
              </div>
            </div>
            <div className="bg-orange-50 dark:bg-orange-950 p-3 rounded-lg">
              <div className="text-lg font-semibold text-orange-600 dark:text-orange-400">
                {lots.filter((l) => l.status === "próximo_a_caducar").length}
              </div>
              <div className="text-sm text-orange-600 dark:text-orange-400">
                Próximos a caducar
              </div>
            </div>
            <div className="bg-red-50 dark:bg-red-950 p-3 rounded-lg">
              <div className="text-lg font-semibold text-red-600 dark:text-red-400">
                {lots.filter((l) => l.status === "stock_bajo").length}
              </div>
              <div className="text-sm text-red-600 dark:text-red-400">
                Stock bajo
              </div>
            </div>
          </div>

          {/* Tabla de lotes */}
          {isLoading ? (
            <div className="text-center py-8">Cargando lotes...</div>
          ) : lots.length === 0 ? (
            <div className="text-center py-12">
              <div className="space-y-3">
                <Package className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="text-lg font-semibold">No hay lotes</h3>
                <p className="text-muted-foreground">
                  Este producto no tiene lotes de inventario
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Lote</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>% Restante</TableHead>
                    <TableHead>Caducidad</TableHead>
                    <TableHead>Proveedor</TableHead>
                    <TableHead>Precio Compra</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lots.map((lot) => (
                    <TableRow key={lot.lot_id}>
                      <TableCell className="font-medium">
                        <div className="space-y-1">
                          <div>{lot.lot_id.slice(0, 8)}...</div>
                          <div className="text-xs text-muted-foreground">
                            {formatDate(lot.created_at)}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">
                            {lot.stock_quantity} {product.unit_of_measure}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            de {lot.initial_quantity}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-2">
                          <Progress
                            value={lot.percentage_remaining}
                            className="w-16"
                          />
                          <div className="text-xs text-center">
                            {lot.percentage_remaining}%
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-1">
                          <div>{formatDate(lot.expiration_date)}</div>
                          {lot.days_until_expiry !== null && (
                            <div
                              className={`text-xs ${
                                lot.days_until_expiry <= 3
                                  ? "text-red-600"
                                  : lot.days_until_expiry <= 7
                                  ? "text-orange-600"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {lot.days_until_expiry >= 0
                                ? `${lot.days_until_expiry} días`
                                : `${Math.abs(
                                    lot.days_until_expiry
                                  )} días vencido`}
                            </div>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-1">
                          <div>{lot.supplier_name || "Sin proveedor"}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatDate(lot.purchase_date)}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="font-medium">
                        {formatCurrency(lot.purchase_price)}
                      </TableCell>

                      <TableCell>
                        {getStatusBadge(lot.status, lot.days_until_expiry)}
                      </TableCell>

                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onAdjustLot(lot)}
                          >
                            <TrendingDown className="h-4 w-4 mr-1" />
                            Ajustar
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
          <Button onClick={() => onCreateLot(product)} className="gap-2">
            <Plus className="h-4 w-4" />
            Nuevo Lote
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
