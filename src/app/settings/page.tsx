"use client";

import { useEffect, useState } from "react";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataPagination } from "@/components/ui/data-pagination";
import { CategoryTable } from "@/components/categories/CategoryTable";
import {
  CategoryForm,
  type CategoryFormData,
} from "@/components/categories/CategoryForm";
import { SupplierTable } from "@/components/suppliers/SupplierTable";
import {
  SupplierForm,
  type SupplierFormData,
} from "@/components/suppliers/SupplierForm";
import { categoryService, type Category } from "@/services/categoryService";
import { supplierService, type Supplier } from "@/services/supplierService";
import { toast } from "sonner";
import { ErrorHandler } from "@/lib/errorHandler"; // ✅ IMPORTAR
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function SettingsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuthGuard();

  // Estados para categorías
  const [categories, setCategories] = useState<Category[]>([]);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
  const [isCategoryFormOpen, setIsCategoryFormOpen] = useState(false);
  const [isCategoryFormLoading, setIsCategoryFormLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
    null
  );

  const [categoriesPage, setCategoriesPage] = useState(1);
  const [categoriesPageSize, setCategoriesPageSize] = useState(20);
  const [categoriesTotalItems, setCategoriesTotalItems] = useState(0);
  const [categoriesTotalPages, setCategoriesTotalPages] = useState(0);

  // Estados para proveedores
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isSuppliersLoading, setIsSuppliersLoading] = useState(true);
  const [isSupplierFormOpen, setIsSupplierFormOpen] = useState(false);
  const [isSupplierFormLoading, setIsSupplierFormLoading] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(
    null
  );
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(
    null
  );

  const [suppliersPage, setSuppliersPage] = useState(1);
  const [suppliersPageSize, setSuppliersPageSize] = useState(20);
  const [suppliersTotalItems, setSuppliersTotalItems] = useState(0);
  const [suppliersTotalPages, setSuppliersTotalPages] = useState(0);

  const [isDeleting, setIsDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState("categories");

  // ========== CATEGORÍAS ==========
  const loadCategories = async () => {
    try {
      setIsCategoriesLoading(true);
      const result = await categoryService.getCategories(
        categoriesPage,
        categoriesPageSize
      );
      setCategories(result.data);
      setCategoriesTotalItems(result.total);
      setCategoriesTotalPages(result.totalPages);
    } catch (error) {
      ErrorHandler.handle(error, "Cargar categorías"); // ✅ CAMBIO
    } finally {
      setIsCategoriesLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadCategories();
    }
  }, [isAuthenticated, categoriesPage, categoriesPageSize]);

  const handleNewCategory = () => {
    setSelectedCategory(null);
    setIsCategoryFormOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setIsCategoryFormOpen(true);
  };

  const handleCategorySubmit = async (data: CategoryFormData) => {
    try {
      setIsCategoryFormLoading(true);

      if (selectedCategory) {
        await categoryService.updateCategory(
          selectedCategory.category_id,
          data
        );
        toast.success("Categoría actualizada exitosamente");
      } else {
        await categoryService.createCategory(data);
        toast.success("Categoría creada exitosamente");
      }

      setIsCategoryFormOpen(false);
      loadCategories();
    } catch (error) {
      ErrorHandler.handle(
        error,
        selectedCategory ? "Actualizar categoría" : "Crear categoría"
      ); // ✅ CAMBIO
    } finally {
      setIsCategoryFormLoading(false);
    }
  };

  const handleDeleteCategory = (category: Category) => {
    setCategoryToDelete(category);
  };

  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return;

    try {
      setIsDeleting(true);

      const inUse = await categoryService.isCategoryInUse(
        categoryToDelete.category_id
      );

      if (inUse) {
        toast.warning("No se puede eliminar", {
          description: "Esta categoría tiene productos asociados",
        });
        return;
      }

      await categoryService.deleteCategory(categoryToDelete.category_id);
      toast.success("Categoría eliminada exitosamente");
      loadCategories();
    } catch (error) {
      ErrorHandler.handle(error, "Eliminar categoría"); // ✅ CAMBIO
    } finally {
      setIsDeleting(false);
      setCategoryToDelete(null);
    }
  };

  // ========== PROVEEDORES ==========
  const loadSuppliers = async () => {
    try {
      setIsSuppliersLoading(true);
      const result = await supplierService.getSuppliers(
        suppliersPage,
        suppliersPageSize
      );
      setSuppliers(result.data);
      setSuppliersTotalItems(result.total);
      setSuppliersTotalPages(result.totalPages);
    } catch (error) {
      ErrorHandler.handle(error, "Cargar proveedores"); // ✅ CAMBIO
    } finally {
      setIsSuppliersLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadSuppliers();
    }
  }, [isAuthenticated, suppliersPage, suppliersPageSize]);

  const handleNewSupplier = () => {
    setSelectedSupplier(null);
    setIsSupplierFormOpen(true);
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsSupplierFormOpen(true);
  };

  const handleSupplierSubmit = async (data: SupplierFormData) => {
    try {
      setIsSupplierFormLoading(true);

      if (selectedSupplier) {
        await supplierService.updateSupplier(
          selectedSupplier.supplier_id,
          data
        );
        toast.success("Proveedor actualizado exitosamente");
      } else {
        await supplierService.createSupplier(data);
        toast.success("Proveedor creado exitosamente");
      }

      setIsSupplierFormOpen(false);
      loadSuppliers();
    } catch (error) {
      ErrorHandler.handle(
        error,
        selectedSupplier ? "Actualizar proveedor" : "Crear proveedor"
      ); // ✅ CAMBIO
    } finally {
      setIsSupplierFormLoading(false);
    }
  };

  const handleDeleteSupplier = (supplier: Supplier) => {
    setSupplierToDelete(supplier);
  };

  const confirmDeleteSupplier = async () => {
    if (!supplierToDelete) return;

    try {
      setIsDeleting(true);

      const inUse = await supplierService.isSupplierInUse(
        supplierToDelete.supplier_id
      );

      if (inUse) {
        toast.warning("No se puede eliminar", {
          description: "Este proveedor tiene compras asociadas",
        });
        return;
      }

      await supplierService.deleteSupplier(supplierToDelete.supplier_id);
      toast.success("Proveedor eliminado exitosamente");
      loadSuppliers();
    } catch (error) {
      ErrorHandler.handle(error, "Eliminar proveedor"); // ✅ CAMBIO
    } finally {
      setIsDeleting(false);
      setSupplierToDelete(null);
    }
  };

  if (authLoading) {
    return <div className="p-4">Verificando sesión...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Categorías y Proveedores</h1>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList>
            <TabsTrigger value="categories">Categorías</TabsTrigger>
            <TabsTrigger value="suppliers">Proveedores</TabsTrigger>
          </TabsList>

          <TabsContent value="categories" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Categorías de Productos</CardTitle>
                <Button onClick={handleNewCategory} size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Nueva Categoría
                </Button>
              </CardHeader>
              <CardContent>
                <CategoryTable
                  categories={categories}
                  isLoading={isCategoriesLoading}
                  onEdit={handleEditCategory}
                  onDelete={handleDeleteCategory}
                />

                {!isCategoriesLoading && categoriesTotalPages > 0 && (
                  <DataPagination
                    currentPage={categoriesPage}
                    totalPages={categoriesTotalPages}
                    pageSize={categoriesPageSize}
                    totalItems={categoriesTotalItems}
                    onPageChange={setCategoriesPage}
                    onPageSizeChange={(size) => {
                      setCategoriesPageSize(size);
                      setCategoriesPage(1);
                    }}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="suppliers" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Proveedores</CardTitle>
                <Button onClick={handleNewSupplier} size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Nuevo Proveedor
                </Button>
              </CardHeader>
              <CardContent>
                <SupplierTable
                  suppliers={suppliers}
                  isLoading={isSuppliersLoading}
                  onEdit={handleEditSupplier}
                  onDelete={handleDeleteSupplier}
                />

                {!isSuppliersLoading && suppliersTotalPages > 0 && (
                  <DataPagination
                    currentPage={suppliersPage}
                    totalPages={suppliersTotalPages}
                    pageSize={suppliersPageSize}
                    totalItems={suppliersTotalItems}
                    onPageChange={setSuppliersPage}
                    onPageSizeChange={(size) => {
                      setSuppliersPageSize(size);
                      setSuppliersPage(1);
                    }}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <CategoryForm
          category={selectedCategory}
          isOpen={isCategoryFormOpen}
          onClose={() => setIsCategoryFormOpen(false)}
          onSubmit={handleCategorySubmit}
          isLoading={isCategoryFormLoading}
        />

        <SupplierForm
          supplier={selectedSupplier}
          isOpen={isSupplierFormOpen}
          onClose={() => setIsSupplierFormOpen(false)}
          onSubmit={handleSupplierSubmit}
          isLoading={isSupplierFormLoading}
        />

        <AlertDialog
          open={!!categoryToDelete}
          onOpenChange={() => setCategoryToDelete(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar categoría?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. La categoría{" "}
                <span className="font-semibold">{categoryToDelete?.name}</span>{" "}
                será eliminada permanentemente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDeleteCategory}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeleting ? "Eliminando..." : "Eliminar"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog
          open={!!supplierToDelete}
          onOpenChange={() => setSupplierToDelete(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar proveedor?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. El proveedor{" "}
                <span className="font-semibold">{supplierToDelete?.name}</span>{" "}
                será eliminado permanentemente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDeleteSupplier}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeleting ? "Eliminando..." : "Eliminar"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}
