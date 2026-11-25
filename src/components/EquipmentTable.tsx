"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { deleteEquipment, saveEquipment } from "@/app/actions";

export type EqType = { id: number; code: string; name: string; qty_per_branch: number; sort_order: number };
export type Equipment = {
  id: string;
  type_id: number;
  serial_no: string;
  brand: string | null;
  model: string | null;
  status: "in_use" | "spare" | "repair" | "lost";
  installed_at: string | null;
  note: string | null;
};

const STATUS: Record<Equipment["status"], { label: string; cls: string }> = {
  in_use: { label: "ใช้งาน", cls: "bg-green-100 text-green-800" },
  spare: { label: "สำรอง", cls: "bg-blue-100 text-blue-800" },
  repair: { label: "ซ่อม", cls: "bg-amber-100 text-amber-800" },
  lost: { label: "สูญหาย", cls: "bg-red-100 text-red-800" },
};

type SortKey = "type" | "serial_no" | "brand" | "status" | "installed_at";

export default function EquipmentTable({
  branchId,
  types,
  items,
}: {
  branchId: string;
  types: EqType[];
  items: Equipment[];
}) {
  const typeMap = useMemo(() => new Map(types.map((t) => [t.id, t])), [types]);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sort, setSort] = useState<{ key: SortKey; desc: boolean }>({ key: "type", desc: false });
  const [editing, setEditing] = useState<Equipment | "new" | null>(null);

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    const f = items.filter(
      (r) =>
        (!statusFilter || r.status === statusFilter) &&
        (!s ||
          [r.serial_no, r.brand, r.model, r.note, typeMap.get(r.type_id)?.name]
            .join(" ")
            .toLowerCase()
            .includes(s)),
    );
    const val = (r: Equipment) =>
      sort.key === "type"
        ? (typeMap.get(r.type_id)?.sort_order ?? 0)
        : (r[sort.key] ?? "");
    return f.sort((a, b) => {
      const x = val(a);
      const y = val(b);
      const c = typeof x === "number" && typeof y === "number" ? x - y : String(x).localeCompare(String(y), "th", { numeric: true });
      return (c || a.serial_no.localeCompare(b.serial_no, undefined, { numeric: true })) * (sort.desc ? -1 : 1);
    });
  }, [items, q, statusFilter, sort, typeMap]);

  const counts = useMemo(() => {
    const m = new Map<number, number>();
    items.forEach((i) => i.status !== "lost" && m.set(i.type_id, (m.get(i.type_id) ?? 0) + 1));
    return m;
  }, [items]);

  const th = (key: SortKey, label: string) => (
    <th
      className="p-3 cursor-pointer select-none whitespace-nowrap"
      onClick={() => setSort((s) => ({ key, desc: s.key === key ? !s.desc : false }))}
    >
      {label} {sort.key === key ? (sort.desc ? "▼" : "▲") : ""}
    </th>
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
        {types.map((t) => {
          const have = counts.get(t.id) ?? 0;
          const ok = have >= t.qty_per_branch;
          return (
            <div key={t.id} className={`rounded-lg border p-2 text-sm ${ok ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200"}`}>
              <div className="text-slate-600">{t.name}</div>
              <div className="font-semibold">{have}/{t.qty_per_branch}</div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ค้นหา Serial / ยี่ห้อ / รุ่น" className="border rounded-lg px-3 py-2 w-full sm:w-72" />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border rounded-lg px-3 py-2">
          <option value="">ทุกสถานะ</option>
          {Object.entries(STATUS).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
        <button onClick={() => setEditing("new")} className="ml-auto bg-slate-900 text-white rounded-lg px-4 py-2 text-sm">
          + เพิ่มอุปกรณ์
        </button>
      </div>

      <div className="overflow-x-auto bg-white rounded-xl shadow">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-left">
            <tr>
              <th className="p-3">#</th>
              {th("type", "ชนิดอุปกรณ์")}
              {th("brand", "ยี่ห้อ / รุ่น")}
              {th("serial_no", "Serial")}
              {th("status", "สถานะ")}
              {th("installed_at", "วันที่ติดตั้ง")}
              <th className="p-3">หมายเหตุ</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.id} className="border-t hover:bg-slate-50">
                <td className="p-3 text-slate-500">{i + 1}</td>
                <td className="p-3">{typeMap.get(r.type_id)?.code} {typeMap.get(r.type_id)?.name}</td>
                <td className="p-3">{[r.brand, r.model].filter(Boolean).join(" ") || "-"}</td>
                <td className="p-3 font-mono">{r.serial_no}</td>
                <td className="p-3"><span className={`px-2 py-0.5 rounded-full text-xs ${STATUS[r.status].cls}`}>{STATUS[r.status].label}</span></td>
                <td className="p-3">{r.installed_at ?? "-"}</td>
                <td className="p-3 text-slate-600">{r.note ?? ""}</td>
                <td className="p-3 whitespace-nowrap text-right">
                  <button onClick={() => setEditing(r)} className="text-blue-700 mr-3">แก้ไข</button>
                  <button
                    onClick={() => {
                      if (confirm(`ลบ ${r.serial_no} ?`)) deleteEquipment(r.id, branchId);
                    }}
                    className="text-red-600"
                  >
                    ลบ
                  </button>
                </td>
              </tr>
            ))}
            {!rows.length && (
              <tr><td colSpan={8} className="p-6 text-center text-slate-500">ยังไม่มีอุปกรณ์</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <EquipmentForm
          branchId={branchId}
          types={types}
          item={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}

function EquipmentForm({
  branchId,
  types,
  item,
  onClose,
}: {
  branchId: string;
  types: EqType[];
  item: Equipment | null;
  onClose: () => void;
}) {
  const [state, action, pending] = useActionState(saveEquipment, null);
  useEffect(() => {
    if (state && "ok" in state) onClose();
  }, [state, onClose]);
  const field = "w-full border rounded-lg px-3 py-2";
  return (
    <div className="fixed inset-0 bg-black/40 grid place-items-center p-4 z-10" onClick={onClose}>
      <form action={action} onClick={(e) => e.stopPropagation()} className="bg-white rounded-xl p-5 w-full max-w-md space-y-3 max-h-[90vh] overflow-y-auto">
        <h2 className="font-semibold">{item ? "แก้ไขอุปกรณ์" : "เพิ่มอุปกรณ์"}</h2>
        <input type="hidden" name="id" defaultValue={item?.id ?? ""} />
        <input type="hidden" name="branch_id" value={branchId} />
        <label className="block text-sm">ชนิดอุปกรณ์
          <select name="type_id" defaultValue={item?.type_id ?? types[0]?.id} className={field}>
            {types.map((t) => <option key={t.id} value={t.id}>{t.code} {t.name}</option>)}
          </select>
        </label>
        <label className="block text-sm">Serial
          <input name="serial_no" required defaultValue={item?.serial_no} className={field} />
        </label>
        <div className="grid grid-cols-2 gap-2">
          <label className="block text-sm">ยี่ห้อ<input name="brand" defaultValue={item?.brand ?? ""} className={field} /></label>
          <label className="block text-sm">รุ่น<input name="model" defaultValue={item?.model ?? ""} className={field} /></label>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <label className="block text-sm">สถานะ
            <select name="status" defaultValue={item?.status ?? "in_use"} className={field}>
              {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </label>
          <label className="block text-sm">วันที่ติดตั้ง
            <input type="date" name="installed_at" defaultValue={item?.installed_at ?? ""} className={field} />
          </label>
        </div>
        <label className="block text-sm">หมายเหตุ<textarea name="note" rows={2} defaultValue={item?.note ?? ""} className={field} /></label>
        {state && "error" in state && <p className="text-sm text-red-600">{state.error}</p>}
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm">ยกเลิก</button>
          <button disabled={pending} className="bg-slate-900 text-white rounded-lg px-4 py-2 text-sm disabled:opacity-50">
            {pending ? "กำลังบันทึก..." : "บันทึก"}
          </button>
        </div>
      </form>
    </div>
  );
}
