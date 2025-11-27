"use client";

import { useEffect, useState } from "react";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ShoppingCart } from "lucide-react";
import { PurchaseTable } from "@/components/purchases/PurchaseTable";
import { NewPurchaseForm } from "@/components/purchases/NewPurchaseForm";
import { DataPagination } from "@/components/ui/data-pagination";
import { purchaseService, type Purchase } from "@/services/purchaseService";
import { toast } from "sonner";
import { ErrorHandler } from "@/lib/errorHandler";
import { PurchaseDetailsSheet } from "@/components/purchases/PurchaseDetailsSheet";

export default function PurchasesPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuthGuard();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Detalles de compra
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(
    null
  );
  const [purchaseDetails, setPurchaseDetails] = useState<any[]>([]);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Formulario
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isFormLoading, setIsFormLoading] = useState(false);

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const loadPurchases = async () => {
    try {
      setIsLoading(true);
      const result = await purchaseService.getPurchases(currentPage, pageSize);
      setPurchases(result.data);
      setTotalItems(result.total);
      setTotalPages(result.totalPages);
    } catch (error) {
      ErrorHandler.handle(error, "Cargar historial de compras");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadPurchases();
    }
  }, [isAuthenticated, currentPage, pageSize]);

  const handleSubmit = async (data: any) => {
    if (!data.supplier_id) {
      toast.error("Selecciona un proveedor");
      return;
    }
    if (data.items.length === 0) {
      toast.error("Agrega al menos un producto");
      return;
    }

    try {
      setIsFormLoading(true);
      await purchaseService.createPurchase(data);
      toast.success("Compra registrada exitosamente");
      setIsFormOpen(false);
      loadPurchases(); // Recargar tabla
    } catch (error) {
      ErrorHandler.handle(error, "Registrar compra");
    } finally {
      setIsFormLoading(false);
    }
  };

  const handleViewDetails = async (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    setIsDetailsOpen(true);
    setIsDetailsLoading(true);

    try {
      const details = await purchaseService.getPurchaseDetails(
        purchase.purchase_id
      );
      setPurchaseDetails(details);
    } catch (error) {
      ErrorHandler.handle(error, "Cargar detalles de compra");
      setIsDetailsOpen(false); // Cerrar si falla
    } finally {
      setIsDetailsLoading(false);
    }
  };

  if (authLoading) return <div className="p-4">Verificando sesión...</div>;
  if (!isAuthenticated) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Compras</h1>
            <p className="text-muted-foreground">
              Registra entradas de mercancía y gestiona proveedores
            </p>
          </div>
          <Button onClick={() => setIsFormOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Nueva Compra
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Historial de Compras
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PurchaseTable
              purchases={purchases}
              isLoading={isLoading}
              onViewDetails={handleViewDetails}
            />

            {!isLoading && totalPages > 0 && (
              <DataPagination
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                totalItems={totalItems}
                onPageChange={setCurrentPage}
                onPageSizeChange={(size) => {
                  setPageSize(size);
                  setCurrentPage(1);
                }}
              />
            )}
          </CardContent>
        </Card>

        <NewPurchaseForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleSubmit}
          isLoading={isFormLoading}
        />
      </div>
      <PurchaseDetailsSheet
        purchase={selectedPurchase}
        details={purchaseDetails}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        isLoading={isDetailsLoading}
      />
    </DashboardLayout>
  );
}
