"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  User,
  CreditCard,
  Receipt,
  Package,
  Clock,
  Store,
} from "lucide-react";
import { type Purchase } from "@/services/purchaseService";

interface PurchaseDetailItem {
  lot_id: string;
  product_name: string;
  unit: string;
  quantity: number;
  unit_price: number;
  total: number;
  expiration: string | null;
}

interface PurchaseDetailsSheetProps {
  purchase: Purchase | null;
  details: PurchaseDetailItem[];
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
}

export function PurchaseDetailsSheet({
  purchase,
  details,
  isOpen,
  onClose,
  isLoading,
}: PurchaseDetailsSheetProps) {
  if (!purchase) return null;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(val);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      {/* sm:max-w-xl hace el panel más ancho para que quepa bien la info */}
      <SheetContent className="w-full sm:max-w-xl flex flex-col p-0 gap-0">
        {/* HEADER FIJO */}
        <div className="p-6 border-b bg-muted/10">
          <SheetHeader className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <SheetTitle className="text-xl flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-muted-foreground" />
                  Detalle de Compra
                </SheetTitle>
                <SheetDescription>
                  ID:{" "}
                  <span className="font-mono text-xs">
                    {purchase.purchase_id.split("-")[0]}...
                  </span>
                </SheetDescription>
              </div>
              <div className="text-right">
                <Badge
                  variant={
                    purchase.payment_method === "efectivo"
                      ? "default"
                      : "secondary"
                  }
                  className="capitalize mb-1"
                >
                  {purchase.payment_method}
                </Badge>
              </div>
            </div>

            <div className="flex items-baseline justify-between pt-2">
              <span className="text-sm text-muted-foreground">Monto Total</span>
              <span className="text-3xl font-bold text-primary">
                {formatCurrency(purchase.total_cost)}
              </span>
            </div>
          </SheetHeader>
        </div>

        {/* CONTENIDO CON SCROLL NATURALEZA */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Sección de Información General */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Store className="h-3.5 w-3.5" /> PROVEEDOR
              </span>
              <p className="font-medium text-sm">{purchase.supplier_name}</p>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" /> FECHA
              </span>
              <p className="font-medium text-sm">
                {new Date(purchase.purchase_date).toLocaleDateString("es-MX")}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(purchase.purchase_date).toLocaleTimeString("es-MX", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>

            <div className="space-y-1 col-span-2">
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" /> REGISTRADO POR
              </span>
              <p className="font-medium text-sm">
                {purchase.user_name || "Sistema"}
              </p>
            </div>
          </div>

          <Separator />

          {/* Lista de Productos */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
              <Package className="h-4 w-4" />
              PRODUCTOS INGRESADOS ({details.length})
            </h3>

            {isLoading ? (
              <div className="py-10 text-center text-muted-foreground animate-pulse">
                Cargando detalles...
              </div>
            ) : (
              <div className="space-y-3">
                {details.map((item) => (
                  <div
                    key={item.lot_id}
                    className="flex flex-col p-4 rounded-lg border bg-card hover:shadow-sm transition-all"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-semibold text-sm">
                        {item.product_name}
                      </span>
                      <span className="font-bold text-sm">
                        {formatCurrency(item.total)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-normal">
                          {item.quantity} {item.unit}
                        </Badge>
                        <span>x {formatCurrency(item.unit_price)} c/u</span>
                      </div>

                      {item.expiration && (
                        <span
                          className={`flex items-center gap-1 ${
                            new Date(item.expiration) < new Date()
                              ? "text-red-600 font-medium"
                              : "text-amber-600"
                          }`}
                        >
                          <Clock className="h-3 w-3" />
                          {formatDate(item.expiration)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
