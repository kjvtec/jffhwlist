"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export type BranchRow = { id: string; code: string; name: string; total: number };

export default function BranchList({ rows, expected }: { rows: BranchRow[]; expected: number }) {
  const [q, setQ] = useState("");
  const [desc, setDesc] = useState(false);
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    const f = rows.filter((r) => !s || r.code.toLowerCase().includes(s) || r.name.toLowerCase().includes(s));
    return f.sort((a, b) => a.code.localeCompare(b.code, "th", { numeric: true }) * (desc ? -1 : 1));
  }, [rows, q, desc]);

  return (
    <div className="space-y-3">
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ค้นหารหัสหรือชื่อสาขา" className="w-full sm:w-80 border rounded-lg px-3 py-2" />
      <div className="overflow-x-auto bg-white rounded-xl shadow">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-left">
            <tr>
              <th className="p-3 cursor-pointer" onClick={() => setDesc(!desc)}>รหัส {desc ? "▼" : "▲"}</th>
              <th className="p-3">ชื่อสาขา</th>
              <th className="p-3">อุปกรณ์ (มี/ควรมี)</th>
              <th className="p-3">สถานะ</th>
            </tr>
          </thead>
          <tbody>
            {list.map((r) => (
              <tr key={r.id} className="border-t hover:bg-slate-50">
                <td className="p-3 font-mono"><Link href={`/branches/${r.id}`} className="text-blue-700 underline">{r.code}</Link></td>
                <td className="p-3">{r.name}</td>
                <td className="p-3">{r.total}/{expected}</td>
                <td className="p-3">
                  {r.total >= expected
                    ? <span className="text-green-700">ครบ</span>
                    : <span className="text-amber-700">ขาด {expected - r.total}</span>}
                </td>
              </tr>
            ))}
            {!list.length && <tr><td colSpan={4} className="p-6 text-center text-slate-500">ไม่พบสาขา</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
