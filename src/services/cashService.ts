import { supabase } from "@/lib/supabaseClient";
import { ErrorHandler } from "@/lib/errorHandler";

export interface DailySummary {
  date: string;
  total_sales: number;
  cash_sales: number;
  card_sales: number;
  transfer_sales: number;
  sales_count: number;
  is_closed: boolean;
}

export interface CashClosureRequest {
  starting_cash: number;
  ending_cash: number;
  notes?: string;
}

export interface CashClosureResult {
  success: boolean;
  session_id?: string;
  date: string;
  starting_cash: number;
  ending_cash: number;
  calculated_sales: number;
  difference: number;
  difference_type: "surplus" | "deficit" | "exact";
  message: string;
}

export interface CashSession {
  session_id: string;
  user_id: string;
  start_time: string;
  end_time?: string | null;
  starting_cash: number;
  ending_cash?: number | null;
  calculated_sales?: number | null;
  difference?: number | null;
  notes?: string | null;
  session_date: string;
  user_profiles: {
    username: string;
  }[] | null;
}

class CashService {
  async getDailySummary(date?: string): Promise<DailySummary> {
    try {
      const targetDate = date || new Date().toISOString().split("T")[0];

      const { data, error } = await supabase.rpc("get_daily_cash_summary", {
        target_date: targetDate,
      });

      if (error) {
        throw error;
      }

      return data as DailySummary;
    } catch (error) {
      const appError = ErrorHandler.fromSupabaseError(error);
      console.error("💥 Error getting daily summary:", appError);
      throw appError;
    }
  }

  async closeCashDrawer(
    request: CashClosureRequest
  ): Promise<CashClosureResult> {
    try {
      const { data, error } = await supabase.rpc("close_cash_drawer_session", {
        starting_cash: request.starting_cash,
        ending_cash: request.ending_cash,
        closure_notes: request.notes || null,
      });

      if (error) {
        throw error;
      }

      return {
        success: true,
        session_id: data.session_id,
        date: data.date,
        starting_cash: data.starting_cash,
        ending_cash: data.ending_cash,
        calculated_sales: data.calculated_sales,
        difference: data.difference,
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
        starting_cash: request.starting_cash,
        ending_cash: request.ending_cash,
        calculated_sales: 0,
        difference: 0,
        difference_type: "exact",
        message: ErrorHandler.getUserFriendlyMessage(appError),
      };
    }
  }

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

      if (error) {
        throw error;
      }

      return (data || []) as CashSession[];
    } catch (error) {
      const appError = ErrorHandler.fromSupabaseError(error);
      console.error("💥 Error getting cash sessions:", appError);
      return [];
    }
  }

  async canCloseCash(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("role")
        .eq("id", userId)
        .single();

      if (error || !data) {
        return false;
      }

      return data.role === "encargado";
    } catch {
      return false;
    }
  }

  async isCashAlreadyClosed(date?: string): Promise<boolean> {
    try {
      const targetDate = date || new Date().toISOString().split("T")[0];

      const { data, error } = await supabase
        .from("cash_drawer_sessions")
        .select("session_id")
        .eq("session_date", targetDate)
        .not("end_time", "is", null)
        .limit(1);

      if (error) {
        return false;
      }

      return Boolean(data && data.length > 0);
    } catch {
      return false;
    }
  }
}

export const cashService = new CashService();
