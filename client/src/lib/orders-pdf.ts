import { jsPDF } from "jspdf";

export type OrderPdfRecord = {
  id: number;
  orderDate: string;
  name: string;
  origin: "DTEX" | "CLIENTE";
  quantity: number;
  amountCents: number;
};

export type OrderPdfFilters = {
  search?: string;
  origin?: string;
  fromDate?: string;
  toDate?: string;
};

const money = (cents: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })
    .format(cents / 100)
    .replace(/[\u00a0\u202f]/g, " ");

const formatDate = (value: string) => {
  if (!value) return "—";
  const [year, month, day] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })
    .format(new Date(year, month - 1, day));
};

/** Generates an A4 landscape PDF and returns bytes for a direct browser download. */
export async function buildOrdersPdf(orders: OrderPdfRecord[], filters: OrderPdfFilters = {}) {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4", compress: true });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const generatedAt = new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" }).format(new Date());
  const totalCents = orders.reduce((sum, order) => sum + order.amountCents, 0);
  const totalPieces = orders.reduce((sum, order) => sum + order.quantity, 0);
  const activeFilters: string[] = [];
  if (filters.search?.trim()) activeFilters.push(`Busca: ${filters.search.trim()}`);
  if (filters.origin && filters.origin !== "all") activeFilters.push(`Origem: ${filters.origin === "CLIENTE" ? "Cliente" : filters.origin}`);
  if (filters.fromDate) activeFilters.push(`De: ${formatDate(filters.fromDate)}`);
  if (filters.toDate) activeFilters.push(`Até: ${formatDate(filters.toDate)}`);
  const filterSummary = activeFilters.length ? activeFilters.join("  ·  ") : "Todos os pedidos";
  const columns = [
    { label: "Data", width: 30, align: "left" as const },
    { label: "Nome do pedido", width: 116, align: "left" as const },
    { label: "Origem", width: 40, align: "left" as const },
    { label: "Bordados", width: 34, align: "right" as const },
    { label: "Valor total", width: 49, align: "right" as const },
  ];
  const tableWidth = columns.reduce((sum, column) => sum + column.width, 0);
  const tableX = (pageWidth - tableWidth) / 2;
  let y = 0;

  const drawBrandMark = (x: number, top: number) => {
    doc.setDrawColor(198, 107, 61);
    doc.setLineWidth(0.35);
    doc.circle(x + 6, top + 6, 5.4);
    doc.line(x + 2.5, top + 2.5, x + 9.5, top + 9.5);
    doc.line(x + 9.5, top + 2.5, x + 2.5, top + 9.5);
    doc.setFillColor(198, 107, 61);
    doc.circle(x + 6, top + 6, 0.8, "F");
  };

  const drawTableHeader = () => {
    doc.setFillColor(247, 245, 240);
    doc.roundedRect(tableX, y, tableWidth, 9, 1.5, 1.5, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(105, 99, 88);
    let x = tableX;
    columns.forEach((column) => {
      const textX = column.align === "right" ? x + column.width - 4 : x + 4;
      doc.text(column.label, textX, y + 5.8, { align: column.align });
      x += column.width;
    });
    y += 10;
  };

  const drawNextPageHeader = () => {
    doc.addPage();
    doc.setFillColor(198, 107, 61);
    doc.rect(0, 0, pageWidth, 2.5, "F");
    drawBrandMark(margin, 7);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(48, 44, 38);
    doc.text("Registro Bordado", margin + 16, 13);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(135, 128, 116);
    doc.text("Histórico de pedidos · continuação", margin + 16, 18);
    y = 26;
    drawTableHeader();
  };

  // First-page title and period summary.
  doc.setFillColor(198, 107, 61);
  doc.rect(0, 0, pageWidth, 2.5, "F");
  drawBrandMark(margin, 8);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(17);
  doc.setTextColor(48, 44, 38);
  doc.text("Registro Bordado", margin + 16, 16);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(133, 126, 114);
  doc.text("HISTÓRICO DE PEDIDOS", margin + 16, 22);
  doc.setFontSize(8);
  doc.text(`Gerado em ${generatedAt}`, pageWidth - margin, 14, { align: "right" });

  y = 32;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(112, 105, 94);
  const filterLines = doc.splitTextToSize(`Filtros: ${filterSummary}`, pageWidth - margin * 2);
  doc.text(filterLines, margin, y);
  y += filterLines.length * 4 + 5;

  const gap = 5;
  const summaryWidth = (pageWidth - margin * 2 - gap * 2) / 3;
  const summaryCards = [
    { label: "PEDIDOS", value: String(orders.length) },
    { label: "BORDADOS", value: String(totalPieces) },
    { label: "VALOR TOTAL", value: money(totalCents) },
  ];
  summaryCards.forEach((card, index) => {
    const x = margin + index * (summaryWidth + gap);
    doc.setFillColor(index === 2 ? 249 : 250, index === 2 ? 242 : 248, index === 2 ? 231 : 242);
    doc.roundedRect(x, y, summaryWidth, 18, 2, 2, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(145, 136, 120);
    doc.text(card.label, x + 5, y + 6);
    doc.setFontSize(11);
    doc.setTextColor(index === 2 ? 163 : 57, index === 2 ? 103 : 53, index === 2 ? 49 : 44);
    doc.text(card.value, x + 5, y + 13.5);
  });

  y += 25;
  drawTableHeader();

  if (!orders.length) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(138, 132, 121);
    doc.text("Nenhum pedido corresponde aos filtros selecionados.", tableX + 4, y + 7);
    y += 14;
  } else {
    orders.forEach((order, index) => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      const nameLines = doc.splitTextToSize(order.name, columns[1].width - 8) as string[];
      const rowHeight = Math.max(9, nameLines.length * 4.2 + 3.8);
      if (y + rowHeight > pageHeight - 15) drawNextPageHeader();
      if (index % 2 === 1) {
        doc.setFillColor(252, 250, 246);
        doc.rect(tableX, y, tableWidth, rowHeight, "F");
      }
      doc.setDrawColor(237, 233, 225);
      doc.setLineWidth(0.15);
      doc.line(tableX, y + rowHeight, tableX + tableWidth, y + rowHeight);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(90, 85, 75);
      let x = tableX;
      doc.text(formatDate(order.orderDate), x + 4, y + 5.8);
      x += columns[0].width;
      doc.setFont("helvetica", "bold");
      doc.setTextColor(65, 61, 53);
      doc.text(nameLines, x + 4, y + 5.8);
      x += columns[1].width;
      doc.setFont("helvetica", "normal");
      doc.setTextColor(order.origin === "DTEX" ? 166 : 98, order.origin === "DTEX" ? 83 : 119, order.origin === "DTEX" ? 48 : 94);
      doc.text(order.origin === "DTEX" ? "DTEX" : "Cliente", x + 4, y + 5.8);
      x += columns[2].width;
      doc.setTextColor(90, 85, 75);
      doc.text(String(order.quantity), x + columns[3].width - 4, y + 5.8, { align: "right" });
      x += columns[3].width;
      doc.setFont("helvetica", "bold");
      doc.setTextColor(65, 61, 53);
      doc.text(money(order.amountCents), x + columns[4].width - 4, y + 5.8, { align: "right" });
      y += rowHeight;
    });
  }

  const pageCount = doc.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page);
    doc.setDrawColor(230, 225, 216);
    doc.setLineWidth(0.2);
    doc.line(margin, pageHeight - 9, pageWidth - margin, pageHeight - 9);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(153, 147, 136);
    doc.text("Registro Bordado · controle do ateliê", margin, pageHeight - 5);
    doc.text(`Página ${page} de ${pageCount}`, pageWidth - margin, pageHeight - 5, { align: "right" });
  }

  return doc.output("arraybuffer") as ArrayBuffer;
}
