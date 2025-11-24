"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus } from "lucide-react";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { ProductTable } from "@/components/products/ProductTable";
import { ProductForm } from "@/components/products/ProductForm";
import { productService, type Product } from "@/services/productService";
import { toast } from "sonner";
import { ProductFilters } from "@/components/products/ProductFilters";
import { InventoryLot } from "@/services/lotService";
import { AdjustmentForm } from "@/components/products/AdjustmentForm";
import { LotForm } from "@/components/products/LotForm";
import { ProductLotsModal } from "@/components/products/ProductLotsModal";

export default function ProductsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuthGuard();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<ProductFilters>({
    search: "",
    category_id: "",
    is_active: "",
    is_featured: "",
    has_stock: "",
  });
  const [isLotsModalOpen, setIsLotsModalOpen] = useState(false);
  const [selectedProductForLots, setSelectedProductForLots] =
    useState<Product | null>(null);
  const [isLotFormOpen, setIsLotFormOpen] = useState(false);
  const [selectedProductForNewLot, setSelectedProductForNewLot] =
    useState<Product | null>(null);
  const [isAdjustmentFormOpen, setIsAdjustmentFormOpen] = useState(false);
  const [selectedLotForAdjustment, setSelectedLotForAdjustment] =
    useState<InventoryLot | null>(null);
  const [lotsRefreshKey, setLotsRefreshKey] = useState(0);


  // Estado del formulario
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Cargar productos
  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const data = await productService.getProducts();
      setProducts(data);
    } catch (error: any) {
      toast.error(error.message || "Error al cargar productos");
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar productos al montar
  useEffect(() => {
    if (isAuthenticated) {
      loadProducts();
    }
  }, [isAuthenticated]);

  // Filtrar productos
  const applyFilters = useMemo(() => {
    let filtered = [...products];

    // Filtro por búsqueda
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchLower) ||
          product.category_name?.toLowerCase().includes(searchLower) ||
          product.supplier_name?.toLowerCase().includes(searchLower)
      );
    }

    // Filtro por categoría
    if (filters.category_id && filters.category_id !== "all") {
      filtered = filtered.filter(
        (product) => product.category_id === filters.category_id
      );
    }

    // Filtro por estado activo
    if (filters.is_active && filters.is_active !== "all") {
      const isActive = filters.is_active === "true";
      filtered = filtered.filter((product) => product.is_active === isActive);
    }

    // Filtro por destacado
    if (filters.is_featured && filters.is_featured !== "all") {
      const isFeatured = filters.is_featured === "true";
      filtered = filtered.filter(
        (product) => product.is_featured === isFeatured
      );
    }

    // Filtro por stock
    if (filters.has_stock && filters.has_stock !== "all") {
      const hasStock = filters.has_stock === "true";
      filtered = filtered.filter((product) =>
        hasStock
          ? (product.total_stock || 0) > 0
          : (product.total_stock || 0) === 0
      );
    }

    return filtered;
  }, [products, filters]);

  useEffect(() => {
    setFilteredProducts(applyFilters);
  }, [applyFilters]);

  // Handlers
  const handleCreateProduct = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleFormSuccess = () => {
    loadProducts();
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingProduct(null);
  };

  const handleFiltersChange = (newFilters: ProductFilters) => {
    setFilters(newFilters);
  };

  const handleViewLots = (product: Product) => {
    setSelectedProductForLots(product);
    setIsLotsModalOpen(true);
  };

  const handleCreateLot = (product: Product) => {
    setSelectedProductForNewLot(product);
    setIsLotFormOpen(true);
  };

  const handleAdjustLot = (lot: InventoryLot) => {
    setSelectedLotForAdjustment(lot);
    setIsAdjustmentFormOpen(true);
  };

  const handleLotFormSuccess = () => {
  // Actualiza totales de producto (cards y tabla principal)
  loadProducts();

  // Si el modal de lotes está abierto, recarga los lotes internos
  if (isLotsModalOpen) {
    setLotsRefreshKey((prev) => prev + 1);
  }
};

const handleAdjustmentSuccess = () => {
  // Actualiza totales de producto
  loadProducts();

  // Recarga la tabla de lotes del modal
  if (isLotsModalOpen) {
    setLotsRefreshKey((prev) => prev + 1);
  }
};


  // Loading states
  if (authLoading) {
    return <div className="p-4">Verificando sesión...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">🏷️ Productos</h1>
            <p className="text-muted-foreground">
              Gestiona tu catálogo de productos
            </p>
          </div>
          <Button onClick={handleCreateProduct} className="gap-2">
            <Plus className="h-4 w-4" />
            Nuevo Producto
          </Button>
        </div>

        {/* Filtros */}
        <ProductFilters onFiltersChange={handleFiltersChange} />

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {products.length}
            </div>
            <div className="text-sm text-blue-600 dark:text-blue-400">
              Total productos
            </div>
          </div>
          <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {products.filter((p) => p.is_active).length}
            </div>
            <div className="text-sm text-green-600 dark:text-green-400">
              Productos activos
            </div>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-950 p-4 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {products.filter((p) => p.is_featured).length}
            </div>
            <div className="text-sm text-yellow-600 dark:text-yellow-400">
              Productos destacados
            </div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-950 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {products.filter((p) => (p.total_stock || 0) > 0).length}
            </div>
            <div className="text-sm text-purple-600 dark:text-purple-400">
              Con stock disponible
            </div>
          </div>
        </div>

        {/* Tabla de productos */}
        <ProductTable
          products={filteredProducts}
          isLoading={isLoading}
          onEdit={handleEditProduct}
          onViewLots={handleViewLots}
          onCreateLot={handleCreateLot}
          onRefresh={loadProducts}
        />

        {/* Modales y Formulario */}
        <ProductForm
          product={editingProduct}
          isOpen={isFormOpen}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />

        <ProductLotsModal
          product={selectedProductForLots}
          isOpen={isLotsModalOpen}
          onClose={() => setIsLotsModalOpen(false)}
          onCreateLot={handleCreateLot}
          onAdjustLot={handleAdjustLot}
          refreshKey={lotsRefreshKey}   

        />

        {/* Formulario nuevo lote */}
        <LotForm
          product={selectedProductForNewLot}
          isOpen={isLotFormOpen}
          onClose={() => setIsLotFormOpen(false)}
          onSuccess={handleLotFormSuccess}
        />

        {/* Formulario ajuste */}
        <AdjustmentForm
          lot={selectedLotForAdjustment}
          isOpen={isAdjustmentFormOpen}
          onClose={() => setIsAdjustmentFormOpen(false)}
          onSuccess={handleAdjustmentSuccess}
        />
      </div>
    </DashboardLayout>
  );
}
