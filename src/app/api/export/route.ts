import ExcelJS from "exceljs";
import { loadExportRows } from "@/lib/export-data";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const branchId = new URL(req.url).searchParams.get("branch") ?? undefined;
  const { branch, rows } = await loadExportRows(branchId);
  if (branchId && !branch) return new Response("ไม่พบสาขา", { status: 404 });

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("อุปกรณ์", {
    pageSetup: {
      paperSize: 9, // A4
      orientation: "landscape",
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      margins: { left: 0.4, right: 0.4, top: 0.5, bottom: 0.5, header: 0.2, footer: 0.2 },
    },
    views: [{ state: "frozen", ySplit: 1 }],
  });
  ws.columns = [
    { header: "รหัสสาขา", key: "branchCode", width: 11 },
    { header: "ชื่อสาขา", key: "branchName", width: 24 },
    { header: "Group", key: "group", width: 22 },
    { header: "รหัส", key: "typeCode", width: 7 },
    { header: "ชนิดอุปกรณ์", key: "typeName", width: 28 },
    { header: "Owner", key: "owner", width: 11 },
    { header: "ยี่ห้อ / รุ่น", key: "brandModel", width: 22 },
    { header: "Serial", key: "serial", width: 22 },
    { header: "รายละเอียด", key: "detail", width: 40 },
  ];
  rows.forEach((r) => ws.addRow(r));

  const head = ws.getRow(1);
  head.font = { bold: true, color: { argb: "FFFFFFFF" } };
  head.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0C2553" } };
  head.alignment = { vertical: "middle" };
  ws.eachRow((row, i) => {
    row.alignment = { vertical: "top", wrapText: true };
    row.eachCell((c) => {
      c.border = { bottom: { style: "thin", color: { argb: "FFD8E9FF" } } };
      if (i > 1) c.font = { size: 10 };
    });
  });
  ws.autoFilter = { from: "A1", to: "I1" };
  ws.pageSetup.printTitlesRow = "1:1";

  const buf = await wb.xlsx.writeBuffer();
  const name = `hardware-${branch?.code ?? "all-branches"}.xlsx`;
  return new Response(buf as ArrayBuffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${encodeURIComponent(name)}"; filename*=UTF-8''${encodeURIComponent(name)}`,
    },
  });
}
