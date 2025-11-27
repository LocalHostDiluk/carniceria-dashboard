"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { reportsService } from "@/services/reportsService";
import type { SaleRecord, ExpenseRecord } from "@/types/reports";

interface ExportButtonProps {
  data: SaleRecord[] | ExpenseRecord[] | null;
  filename: string;
  label: string;
  disabled?: boolean;
}

export function ExportButton({
  data,
  filename,
  label,
  disabled,
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!data || data.length === 0) {
      toast.error("No hay datos para exportar");
      return;
    }

    setIsExporting(true);

    try {
      // Transformar datos para CSV
      const csvData = data.map((item) => {
        if ("products" in item) {
          // Es una venta
          const sale = item as SaleRecord;
          return {
            fecha: sale.date,
            hora: sale.time,
            total: sale.total_amount,
            metodo_pago: sale.payment_method,
            usuario: sale.user,
            productos: sale.items_count,
            detalle:
              sale.products
                ?.map((p) => `${p.name} (${p.quantity} ${p.unit})`)
                .join("; ") || "",
          };
        } else {
          // Es un gasto
          const expense = item as ExpenseRecord;
          return {
            fecha: expense.date,
            hora: expense.time,
            monto: expense.amount,
            descripcion: expense.description,
            categoria: expense.category,
            metodo_pago: expense.payment_method,
            usuario: expense.user,
          };
        }
      });

      reportsService.exportToCSV(csvData, filename);

      toast.success(`${label} exportado correctamente`, {
        description: `Archivo: ${filename}_${
          new Date().toISOString().split("T")[0]
        }.csv`,
      });
    } catch (error) {
      console.error("Error exporting:", error);
      toast.error("Error al exportar datos");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={disabled || isExporting || !data || data.length === 0}
      className="flex items-center gap-2"
    >
      <Download className="h-4 w-4" />
      {isExporting ? "Exportando..." : `Exportar ${label}`}
    </Button>
  );
}
