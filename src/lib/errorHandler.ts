// Tipos para errores de Supabase
interface SupabaseError {
  code?: string;
  message?: string;
  details?: unknown;
  hint?: string;
}

// Tipos para errores de red/fetch
interface NetworkError extends Error {
  cause?: unknown;
  status?: number;
}

// Union type para todos los posibles errores
type UnknownError = SupabaseError | NetworkError | Error | unknown;

export enum ErrorType {
  NETWORK = "NETWORK",
  AUTHENTICATION = "AUTHENTICATION",
  VALIDATION = "VALIDATION",
  DATABASE = "DATABASE",
  UNKNOWN = "UNKNOWN",
}

export interface AppError {
  type: ErrorType;
  message: string;
  code?: string;
  details?: unknown;
  timestamp: Date;
  retryable: boolean;
}

export class ErrorHandler {
  private static logError(error: AppError) {
    console.group(`🚨 [${error.type}] ${error.message}`);
    console.log("Timestamp:", error.timestamp.toISOString());
    console.log("Code:", error.code);
    console.log("Retryable:", error.retryable);
    if (error.details) {
      console.log("Details:", error.details);
    }
    console.groupEnd();
  }

  static createError(
    type: ErrorType,
    message: string,
    code?: string,
    details?: unknown,
    retryable: boolean = false
  ): AppError {
    const error: AppError = {
      type,
      message,
      code,
      details,
      timestamp: new Date(),
      retryable,
    };

    this.logError(error);
    return error;
  }

  // ✅ SIN any - usando union types específicos
  static fromSupabaseError(error: UnknownError): AppError {
    // Type guards para diferentes tipos de error
    const isSupabaseError = (err: unknown): err is SupabaseError => {
      return (
        typeof err === "object" &&
        err !== null &&
        ("code" in err || "message" in err)
      );
    };

    const isNetworkError = (err: unknown): err is NetworkError => {
      return (
        err instanceof Error &&
        ("status" in err || err.message.includes("fetch"))
      );
    };

    const isError = (err: unknown): err is Error => {
      return err instanceof Error;
    };

    // Manejo específico para errores de Supabase
    if (isSupabaseError(error)) {
      if (error.code === "PGRST116") {
        return this.createError(
          ErrorType.DATABASE,
          "No se encontraron registros",
          error.code,
          error,
          false
        );
      }

      if (error.code === "23505") {
        return this.createError(
          ErrorType.VALIDATION,
          "Ya existe un registro con estos datos",
          error.code,
          error,
          false
        );
      }

      if (error.code === "23503") {
        return this.createError(
          ErrorType.DATABASE,
          "Error de referencia en la base de datos",
          error.code,
          error,
          false
        );
      }

      if (error.message?.includes("JWT")) {
        return this.createError(
          ErrorType.AUTHENTICATION,
          "Tu sesión ha expirado. Por favor inicia sesión nuevamente",
          "JWT_EXPIRED",
          error,
          false
        );
      }
    }

    // Manejo para errores de red
    if (isNetworkError(error)) {
      return this.createError(
        ErrorType.NETWORK,
        "Error de conexión. Verifica tu conexión a internet",
        "FETCH_ERROR",
        error,
        true
      );
    }

    // Manejo para errores estándar de JavaScript
    if (isError(error)) {
      if (
        error.message.includes("fetch") ||
        error.message.includes("network")
      ) {
        return this.createError(
          ErrorType.NETWORK,
          "Error de conexión. Verifica tu conexión a internet",
          "NETWORK_ERROR",
          error,
          true
        );
      }

      return this.createError(
        ErrorType.UNKNOWN,
        error.message,
        "JS_ERROR",
        error,
        true
      );
    }

    // Fallback para errores completamente desconocidos
    return this.createError(
      ErrorType.UNKNOWN,
      "Error desconocido",
      "UNKNOWN_ERROR",
      error,
      true
    );
  }

  static getUserFriendlyMessage(error: AppError): string {
    const messages: Record<ErrorType, string> = {
      [ErrorType.NETWORK]:
        "🌐 Problema de conexión. Verifica tu internet y vuelve a intentar.",
      [ErrorType.AUTHENTICATION]:
        "🔐 Tu sesión ha expirado. Por favor inicia sesión nuevamente.",
      [ErrorType.VALIDATION]:
        "📝 Los datos ingresados no son válidos. Revisa la información.",
      [ErrorType.DATABASE]:
        "💾 Error en la base de datos. Contacta al administrador.",
      [ErrorType.UNKNOWN]:
        "❓ Ha ocurrido un error inesperado. Vuelve a intentar.",
    };

    return error.message || messages[error.type];
  }
}

// ✅ Hook también sin any
export const useErrorHandler = () => {
  const handleError = (error: UnknownError, context?: string) => {
    const appError = ErrorHandler.fromSupabaseError(error);

    if (context) {
      console.log(`📍 Error Context: ${context}`);
    }

    return appError;
  };

  return { handleError };
};
