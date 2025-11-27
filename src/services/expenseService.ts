import { supabase } from "@/lib/supabaseClient";
import { ErrorHandler } from "@/lib/errorHandler";
import type {
  ExpenseCategory,
  PaymentMethod,
  ExpenseRequest,
  Expense,
  DailyCashFlow,
} from "@/types/models";

class ExpenseService {
  // 💰 CREAR NUEVO GASTO - CORREGIDO
  async createExpense(request: ExpenseRequest): Promise<Expense> {
    try {
      // ✅ OBTENER USER ID
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("Usuario no autenticado");
      }

      const { data, error } = await supabase
        .from("daily_expenses")
        .insert({
          amount: request.amount,
          description: request.description,
          category: request.category,
          payment_method: request.payment_method,
          expense_date:
            request.expense_date || new Date().toISOString().split("T")[0],
          user_id: user.id, // ✅ AGREGADO: user_id
        })
        .select(
          `
          expense_id,
          amount,
          description,
          category,
          payment_method,
          expense_date,
          user_id,
          created_at,
          updated_at,
          user_profiles (
            username
          )
        `
        )
        .single();

      if (error) throw error;
      if (!data) throw new Error("No se pudo crear el gasto");

      return data as unknown as Expense;
    } catch (error) {
      const appError = ErrorHandler.fromSupabaseError(error);
      console.error("Error creating expense:", appError);
      throw appError;
    }
  }

  // 📋 OBTENER GASTOS DEL DÍA
  async getDailyExpenses(date?: string): Promise<Expense[]> {
    try {
      const targetDate = date || new Date().toISOString().split("T")[0];

      const { data, error } = await supabase
        .from("daily_expenses")
        .select(
          `
          expense_id,
          amount,
          description,
          category,
          payment_method,
          expense_date,
          user_id,
          created_at,
          updated_at,
          user_profiles (
            username
          )
        `
        )
        .eq("expense_date", targetDate)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return (data || []) as unknown as Expense[];
    } catch (error) {
      const appError = ErrorHandler.fromSupabaseError(error);
      console.error("Error getting daily expenses:", appError);
      return [];
    }
  }

  // 🏦 OBTENER FLUJO DE CAJA DIARIO COMPLETO
  async getDailyCashFlow(date?: string): Promise<DailyCashFlow> {
    try {
      const targetDate = date || new Date().toISOString().split("T")[0];

      const { data, error } = await supabase.rpc("get_daily_cash_flow", {
        target_date: targetDate,
      });

      if (error) throw error;
      if (!data) throw new Error("No se pudo obtener flujo de caja");

      return data as DailyCashFlow;
    } catch (error) {
      const appError = ErrorHandler.fromSupabaseError(error);
      console.error("Error getting daily cash flow:", appError);
      throw appError;
    }
  }

  // 🗑️ ELIMINAR GASTO
  async deleteExpense(expenseId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("daily_expenses")
        .delete()
        .eq("expense_id", expenseId);

      if (error) throw error;
    } catch (error) {
      const appError = ErrorHandler.fromSupabaseError(error);
      console.error("Error deleting expense:", appError);
      throw appError;
    }
  }

  // ✏️ ACTUALIZAR GASTO
  async updateExpense(
    expenseId: string,
    request: Partial<ExpenseRequest>
  ): Promise<Expense> {
    try {
      const updateData: Partial<ExpenseRequest> & { updated_at?: string } = {};

      if (request.amount !== undefined) updateData.amount = request.amount;
      if (request.description !== undefined)
        updateData.description = request.description;
      if (request.category !== undefined)
        updateData.category = request.category;
      if (request.payment_method !== undefined)
        updateData.payment_method = request.payment_method;
      if (request.expense_date !== undefined)
        updateData.expense_date = request.expense_date;

      updateData.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from("daily_expenses")
        .update(updateData)
        .eq("expense_id", expenseId)
        .select(
          `
          expense_id,
          amount,
          description,
          category,
          payment_method,
          expense_date,
          user_id,
          created_at,
          updated_at,
          user_profiles (
            username
          )
        `
        )
        .single();

      if (error) throw error;
      if (!data) throw new Error("Gasto no encontrado");

      return data as unknown as Expense;
    } catch (error) {
      const appError = ErrorHandler.fromSupabaseError(error);
      console.error("Error updating expense:", appError);
      throw appError;
    }
  }

  // 📊 RESUMEN DE GASTOS
  async getExpensesSummary(days: number = 7): Promise<{
    total_amount: number;
    total_count: number;
    by_category: Record<ExpenseCategory, number>;
    by_payment_method: Record<PaymentMethod, number>;
    daily_average: number;
  }> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from("daily_expenses")
        .select("amount, category, payment_method")
        .gte("expense_date", startDate.toISOString().split("T")[0]);

      if (error) throw error;

      const expenses = data || [];
      const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);

      const byCategory = expenses.reduce((acc, exp) => {
        acc[exp.category as ExpenseCategory] =
          (acc[exp.category as ExpenseCategory] || 0) + exp.amount;
        return acc;
      }, {} as Record<ExpenseCategory, number>);

      const byPaymentMethod = expenses.reduce((acc, exp) => {
        acc[exp.payment_method as PaymentMethod] =
          (acc[exp.payment_method as PaymentMethod] || 0) + exp.amount;
        return acc;
      }, {} as Record<PaymentMethod, number>);

      return {
        total_amount: totalAmount,
        total_count: expenses.length,
        by_category: byCategory,
        by_payment_method: byPaymentMethod,
        daily_average: totalAmount / days,
      };
    } catch (error) {
      const appError = ErrorHandler.fromSupabaseError(error);
      console.error("Error getting expense summary:", appError);
      return {
        total_amount: 0,
        total_count: 0,
        by_category: {} as Record<ExpenseCategory, number>,
        by_payment_method: {} as Record<PaymentMethod, number>,
        daily_average: 0,
      };
    }
  }
}

export const expenseService = new ExpenseService();

// 🎨 UTILIDADES PARA UI
export const expenseCategories: Record<
  ExpenseCategory,
  { label: string; icon: string; description: string }
> = {
  combustible: {
    label: "Combustible",
    icon: "⛽",
    description: "Gasolina, diesel para camión, moto",
  },
  servicios: {
    label: "Servicios",
    icon: "💡",
    description: "Luz, gas, internet, teléfono",
  },
  mantenimiento: {
    label: "Mantenimiento",
    icon: "🔧",
    description: "Reparación frigorífico, báscula, equipo",
  },
  compras_menores: {
    label: "Compras Menores",
    icon: "🛒",
    description: "Bolsas, hielo, papelería, guantes",
  },
};

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  efectivo: "Efectivo",
  tarjeta: "Tarjeta",
  transferencia: "Transferencia",
};
