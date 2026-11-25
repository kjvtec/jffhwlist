import { notFound } from "next/navigation";
import { loadExportRows } from "@/lib/export-data";
import { GROUPS } from "@/lib/groups";
import PrintButton from "@/components/PrintButton";

export const dynamic = "force-dynamic";

// Chrome ใช้ชื่อหน้า (title) เป็นชื่อไฟล์ PDF ตอนบันทึก
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { branch } = await loadExportRows(id);
  return { title: branch ? `Hardware_${branch.code}_${branch.name}` : "Hardware" };
}

export default async function PrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { branch, rows } = await loadExportRows(id);
  if (!branch) notFound();
  const today = new Date().toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" });

  return (
    <main className="print-sheet mx-auto bg-white p-6 print:px-[10mm] print:py-0 my-4 print:my-0 shadow print:shadow-none">
      <div className="print:hidden flex items-center justify-between mb-4">
        <p className="text-sm text-slate-500">ตั้งค่าพิมพ์เป็น A4 → เลือก &quot;บันทึกเป็น PDF&quot; เพื่อได้ไฟล์ PDF</p>
        <PrintButton />
      </div>

      {/* ตัวเว้นขอบบน/ล่าง 10 มม. ทุกหน้า (thead/tfoot ซ้ำทุกหน้าตอนพิมพ์) เพราะตั้ง @page margin = 0 เพื่อซ่อน header/footer ของเบราว์เซอร์ */}
      <table className="w-full border-collapse">
        <thead><tr><td className="p-0"><div className="print:h-[10mm]" /></td></tr></thead>
        <tfoot><tr><td className="p-0"><div className="print:h-[10mm]" /></td></tr></tfoot>
        <tbody><tr><td className="p-0 align-top">
      <header className="border-b-2 border-[#0C2553] pb-2 mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logos/jiffy-print.png" alt="Jiffy" className="h-11 w-auto object-contain shrink-0" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logos/pttrm-print.jpg" alt="PTT RM" className="h-11 w-auto object-contain shrink-0" />
          <span className="h-9 w-px bg-slate-300 shrink-0" />
          <div className="min-w-0">
            <h1 className="text-base font-extrabold text-[#0C2553]">รายการอุปกรณ์ Hardware — สาขา {branch.code} {branch.name}</h1>
            <p className="text-[10px] text-slate-500">VTec Pos Retail • Jiffy Project</p>
          </div>
        </div>
        <p className="text-[10px] text-slate-500 shrink-0">พิมพ์เมื่อ {today}</p>
      </header>

      {GROUPS.map((g) => {
        const list = rows.filter((r) => r.group === g);
        return (
          <section key={g} className="mb-4 break-inside-avoid-page">
            <h2 className="bg-[#0C2553] text-white text-[11px] font-bold px-2 py-1">{g} ({list.length} รายการ)</h2>
            <table className="w-full text-[10px] border-collapse table-fixed">
              <colgroup>
                <col style={{ width: "5%" }} />
                <col style={{ width: "33%" }} />
                <col style={{ width: "14%" }} />
                <col style={{ width: "24%" }} />
                <col style={{ width: "24%" }} />
              </colgroup>
              <thead>
                <tr className="bg-[#EFF7FF] text-[#044492] text-left">
                  <th className="border border-[#B8DCFF] p-1">#</th>
                  <th className="border border-[#B8DCFF] p-1">ชนิดอุปกรณ์</th>
                  <th className="border border-[#B8DCFF] p-1">Owner</th>
                  <th className="border border-[#B8DCFF] p-1">ยี่ห้อ / รุ่น</th>
                  <th className="border border-[#B8DCFF] p-1">Serial</th>
                </tr>
              </thead>
              <tbody>
                {list.map((r, i) => (
                  <tr key={i} className="break-inside-avoid align-top">
                    <td className="border border-[#D8E9FF] p-1">{i + 1}</td>
                    <td className="border border-[#D8E9FF] p-1">{r.typeCode} {r.typeName}</td>
                    <td className="border border-[#D8E9FF] p-1">{r.owner}</td>
                    <td className="border border-[#D8E9FF] p-1">{r.brandModel || "-"}</td>
                    <td className="border border-[#D8E9FF] p-1 font-mono break-all">{r.serial || "-"}</td>
                  </tr>
                ))}
                {!list.length && (
                  <tr><td colSpan={5} className="border border-[#D8E9FF] p-2 text-center text-slate-400">ไม่มีรายการ</td></tr>
                )}
              </tbody>
            </table>
          </section>
        );
      })}
        </td></tr></tbody>
      </table>
    </main>
  );
}
