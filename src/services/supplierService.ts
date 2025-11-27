import { supabase } from "@/lib/supabaseClient";
import { ErrorHandler } from "@/lib/errorHandler";

export interface Supplier {
  supplier_id: string;
  name: string;
  contact_info: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateSupplierData {
  name: string;
  contact_info?: string;
}

export interface UpdateSupplierData {
  name: string;
  contact_info?: string;
}

export class SupplierService {
  // Obtener todos los proveedores con paginación
  async getSuppliers(page = 1, limit = 20) {
    try {
      const offset = (page - 1) * limit;

      const { data, error, count } = await supabase
        .from("suppliers")
        .select("*", { count: "exact" })
        .order("name", { ascending: true })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return {
        data: (data || []) as Supplier[],
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
      };
    } catch (error) {
      const appError = ErrorHandler.fromSupabaseError(error);
      console.error("Error getting suppliers:", appError);
      throw appError;
    }
  }

  // Obtener todos los proveedores sin paginación (para selects)
  async getAllSuppliers(): Promise<Supplier[]> {
    try {
      const { data, error } = await supabase
        .from("suppliers")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;

      return (data || []) as Supplier[];
    } catch (error) {
      const appError = ErrorHandler.fromSupabaseError(error);
      console.error("Error getting all suppliers:", appError);
      throw appError;
    }
  }

  // Crear proveedor
  async createSupplier(supplierData: CreateSupplierData): Promise<Supplier> {
    try {
      const { data, error } = await supabase
        .from("suppliers")
        .insert({
          name: supplierData.name.trim(),
          contact_info: supplierData.contact_info?.trim() || null,
        })
        .select()
        .single();

      if (error) throw error;

      return data as Supplier;
    } catch (error) {
      const appError = ErrorHandler.fromSupabaseError(error);
      console.error("Error creating supplier:", appError);
      throw appError;
    }
  }

  // Actualizar proveedor
  async updateSupplier(
    supplierId: string,
    supplierData: UpdateSupplierData
  ): Promise<Supplier> {
    try {
      const { data, error } = await supabase
        .from("suppliers")
        .update({
          name: supplierData.name.trim(),
          contact_info: supplierData.contact_info?.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq("supplier_id", supplierId)
        .select()
        .single();

      if (error) throw error;

      return data as Supplier;
    } catch (error) {
      const appError = ErrorHandler.fromSupabaseError(error);
      console.error("Error updating supplier:", appError);
      throw appError;
    }
  }

  // Eliminar proveedor
  async deleteSupplier(supplierId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("suppliers")
        .delete()
        .eq("supplier_id", supplierId);

      if (error) throw error;
    } catch (error) {
      const appError = ErrorHandler.fromSupabaseError(error);
      console.error("Error deleting supplier:", appError);
      throw appError;
    }
  }

  // Verificar si un proveedor está en uso
  async isSupplierInUse(supplierId: string): Promise<boolean> {
    try {
      const { count, error } = await supabase
        .from("purchases")
        .select("*", { count: "exact", head: true })
        .eq("supplier_id", supplierId);

      if (error) throw error;

      return (count || 0) > 0;
    } catch (error) {
      const appError = ErrorHandler.fromSupabaseError(error);
      console.error("Error checking supplier usage:", appError);
      throw appError;
    }
  }
}

export const supplierService = new SupplierService();
