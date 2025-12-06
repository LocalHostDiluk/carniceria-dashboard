import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export class ExportService {
  // 🟢 EXPORTAR A EXCEL
  exportToExcel(data: any[], filename: string, sheetName: string = "Datos") {
    // 1. Crear libro de trabajo
    const wb = XLSX.utils.book_new();

    // 2. Convertir JSON a Hoja
    const ws = XLSX.utils.json_to_sheet(data);

    // 3. Agregar hoja al libro
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    // 4. Descargar archivo
    XLSX.writeFile(
      wb,
      `${filename}_${new Date().toISOString().split("T")[0]}.xlsx`
    );
  }

  // 🔴 EXPORTAR A PDF (Tabla Genérica)
  exportToPDF(
    title: string,
    columns: string[],
    data: any[][],
    filename: string
  ) {
    const doc = new jsPDF();

    // Título
    doc.setFontSize(18);
    doc.text(title, 14, 22);

    // Fecha
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generado el: ${new Date().toLocaleDateString("es-MX")}`, 14, 30);

    // Tabla
    autoTable(doc, {
      head: [columns],
      body: data,
      startY: 35,
      theme: "grid",
      headStyles: { fillColor: [41, 128, 185] }, // Color azul corporativo (puedes cambiarlo)
      styles: { fontSize: 10 },
    });

    doc.save(`${filename}.pdf`);
  }

  // 🧾 EXPORTAR DETALLE DE COMPRA (Tipo Ticket/Factura)
  exportPurchaseTicket(purchase: any, items: any[]) {
    const doc = new jsPDF();
    const margin = 15;

    // --- ENCABEZADO ---
    doc.setFontSize(20);
    doc.text("COMPROBANTE DE COMPRA", margin, 20);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`ID: ${purchase.purchase_id}`, margin, 28);

    // --- DATOS GENERALES ---
    doc.setTextColor(0);
    doc.setFontSize(12);

    doc.text(`Proveedor: ${purchase.supplier_name}`, margin, 40);
    doc.text(
      `Fecha: ${new Date(purchase.purchase_date).toLocaleDateString("es-MX")}`,
      margin,
      46
    );
    doc.text(`Método de Pago: ${purchase.payment_method}`, margin, 52);

    // Total destacado
    doc.setFontSize(14);
    doc.text(
      `TOTAL PAGADO: $${purchase.total_cost.toLocaleString("es-MX")}`,
      margin,
      65
    );

    // --- TABLA DE PRODUCTOS ---
    const tableData = items.map((item) => [
      item.product_name,
      `${item.quantity} ${item.unit}`,
      `$${item.unit_price}`,
      `$${item.total}`,
    ]);

    autoTable(doc, {
      startY: 75,
      head: [["Producto", "Cantidad", "Costo Unit.", "Subtotal"]],
      body: tableData,
      theme: "striped",
      headStyles: { fillColor: [22, 163, 74] }, // Color verde (success)
    });

    // Footer
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text(
      "Documento generado automáticamente por el sistema.",
      margin,
      finalY
    );

    doc.save(`Compra_${purchase.purchase_id.slice(0, 8)}.pdf`);
  }
}

export const exportService = new ExportService();
