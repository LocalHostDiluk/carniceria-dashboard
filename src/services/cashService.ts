import { supabase } from "@/lib/supabaseClient";
import { ErrorHandler } from "@/lib/errorHandler";
import { expenseService } from "./expenseService";
import type { DailyCashFlow } from "@/types/models";
import type {
  CashClosureRequest,
  CashClosureResult,
  CashSession,
} from "@/types/api";

class CashService {
  // 📊 OBTENER FLUJO DE CAJA DEL DÍA
  async getDailyCashFlow(date?: string): Promise<DailyCashFlow> {
    return expenseService.getDailyCashFlow(date);
  }

  // 💰 CERRAR CAJA CON LÓGICA CORRECTA
  async closeCashDrawer(
    request: CashClosureRequest
  ): Promise<CashClosureResult> {
    try {
      const { data, error } = await supabase.rpc("close_cash_drawer_session", {
        starting_cash: request.starting_cash,
        ending_cash: request.ending_cash,
        closure_notes: request.notes || null,
      });

      if (error) throw error;

      return {
        success: true,
        session_id: data.session_id,
        date: data.date,
        cash_flow: data.cash_flow,
        breakdown: data.breakdown,
        difference_type: data.difference_type,
        message: data.message,
      };
    } catch (error) {
      const appError = ErrorHandler.fromSupabaseError(error);
      console.error("💥 Error closing cash drawer:", appError);

      return {
        success: false,
        session_id: undefined,
        date: new Date().toISOString().split("T")[0],
        cash_flow: {
          starting_cash: request.starting_cash,
          cash_in: 0,
          cash_out: 0,
          expected_ending: request.starting_cash,
          actual_ending: request.ending_cash,
          difference: 0,
        },
        breakdown: {
          sales_cash: 0,
          purchases_cash: 0,
          expenses_cash: 0,
        },
        difference_type: "exact",
        message: ErrorHandler.getUserFriendlyMessage(appError),
      };
    }
  }

  // 📋 OBTENER HISTORIAL DE CIERRES
  async getCashSessions(limit: number = 10): Promise<CashSession[]> {
    try {
      const { data, error } = await supabase
        .from("cash_drawer_sessions")
        .select(
          `
          session_id,
          user_id,
          start_time,
          end_time,
          starting_cash,
          ending_cash,
          calculated_sales,
          difference,
          notes,
          session_date,
          user_profiles (
            username
          )
        `
        )
        .order("start_time", { ascending: false })
        .limit(limit);

      if (error) throw error;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sessions = (data || []).map((session: any) => ({
        ...session,
        user_profiles: Array.isArray(session.user_profiles)
          ? session.user_profiles[0]
          : session.user_profiles,
      }));

      return sessions as CashSession[];
    } catch (error) {
      const appError = ErrorHandler.fromSupabaseError(error);
      console.error("💥 Error getting cash sessions:", appError);
      return [];
    }
  }

  // 🔐 VERIFICAR PERMISOS
  async canCloseCash(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("role")
        .eq("id", userId)
        .single();

      if (error || !data) return false;
      return data.role === "encargado";
    } catch {
      return false;
    }
  }

  // ✅ VERIFICAR SI YA ESTÁ CERRADO
  async isCashAlreadyClosed(date?: string): Promise<boolean> {
    try {
      const targetDate = date || new Date().toISOString().split("T")[0];

      const { data, error } = await supabase
        .from("cash_drawer_sessions")
        .select("session_id")
        .eq("session_date", targetDate)
        .not("end_time", "is", null)
        .limit(1);

      if (error) return false;
      return Boolean(data && data.length > 0);
    } catch {
      return false;
    }
  }
}

export const cashService = new CashService();
