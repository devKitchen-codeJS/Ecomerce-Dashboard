import type { InsightContext, InsightReport } from "@/lib/insights";

const pageWidth = 595;
const pageHeight = 842;
const margin = 48;
const lineHeight = 15;
const maxChars = 86;

function escapePdfText(value: string) {
  return value.replaceAll("\\", "\\\\").replaceAll("(", "\\(").replaceAll(")", "\\)");
}

function wrapLine(value: string, maxLength = maxChars) {
  const words = value.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let currentLine = "";

  words.forEach((word) => {
    const nextLine = currentLine ? `${currentLine} ${word}` : word;

    if (nextLine.length > maxLength) {
      if (currentLine) {
        lines.push(currentLine);
      }
      currentLine = word;
    } else {
      currentLine = nextLine;
    }
  });

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines.length > 0 ? lines : [""];
}

function addWrapped(lines: string[], label: string, value?: string) {
  if (value === undefined) {
    lines.push(label);
    return;
  }

  wrapLine(`${label}: ${value}`).forEach((line) => lines.push(line));
}

function buildReportLines(report: InsightReport, context: InsightContext) {
  const lines: string[] = [];
  const generatedAt = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(context.generatedAt));

  lines.push(report.title);
  lines.push("");
  addWrapped(lines, "Generated", generatedAt);
  addWrapped(lines, "Period", `${context.period.label} (${context.period.from.slice(0, 10)} to ${context.period.to.slice(0, 10)})`);
  addWrapped(lines, "Sample size", `${context.sampleSize} events`);
  lines.push("");
  lines.push("Summary");
  wrapLine(report.summary).forEach((line) => lines.push(line));
  lines.push("");
  lines.push("Key metrics");
  context.kpis.forEach((metric) => addWrapped(lines, `- ${metric.label}`, `${metric.value} (${metric.trend})`));
  lines.push("");
  lines.push("Insights");
  report.insights.forEach((insight) => wrapLine(`- ${insight}`).forEach((line) => lines.push(line)));
  lines.push("");
  lines.push("Recommended actions");
  report.recommendedActions.forEach((action) => wrapLine(`- ${action}`).forEach((line) => lines.push(line)));
  lines.push("");
  lines.push("Anomalies");
  const anomalies = report.anomalies.length > 0 ? report.anomalies : ["No clear anomalies were detected in the provided metrics."];
  anomalies.forEach((anomaly) => wrapLine(`- ${anomaly}`).forEach((line) => lines.push(line)));
  lines.push("");
  lines.push("Top products");
  context.topProducts.forEach((product) => {
    addWrapped(lines, `- ${product.name}`, `${product.views} views, ${product.purchases} purchases, $${product.revenue}`);
  });

  return lines;
}

function buildContentStream(lines: string[]) {
  const chunks = ["BT", "/F1 11 Tf", "14 TL", `${margin} ${pageHeight - margin} Td`];

  lines.forEach((line, index) => {
    if (index > 0) {
      chunks.push("T*");
    }
    chunks.push(`(${escapePdfText(line)}) Tj`);
  });

  chunks.push("ET");
  return chunks.join("\n");
}

export function downloadInsightReportPdf(report: InsightReport, context: InsightContext) {
  const allLines = buildReportLines(report, context);
  const linesPerPage = Math.floor((pageHeight - margin * 2) / lineHeight);
  const pages: string[][] = [];

  for (let index = 0; index < allLines.length; index += linesPerPage) {
    pages.push(allLines.slice(index, index + linesPerPage));
  }

  const objects: string[] = [];
  const pageObjectIds: number[] = [];

  objects.push("<< /Type /Catalog /Pages 2 0 R >>");
  objects.push("");

  pages.forEach((pageLines, index) => {
    const pageObjectId = 3 + index * 2;
    const contentObjectId = pageObjectId + 1;
    const stream = buildContentStream(pageLines);
    pageObjectIds.push(pageObjectId);
    objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> /Contents ${contentObjectId} 0 R >>`);
    objects.push(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
  });

  objects[1] = `<< /Type /Pages /Kids [${pageObjectIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageObjectIds.length} >>`;

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [0];

  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  const blob = new Blob([pdf], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `ai-insights-report-${new Date().toISOString().slice(0, 10)}.pdf`;
  anchor.click();
  URL.revokeObjectURL(url);
}
