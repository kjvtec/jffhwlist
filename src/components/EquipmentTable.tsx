"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { deleteEquipment, saveEquipment } from "@/app/actions";
import { GROUPS, OWNERS, belongs, expectedIn } from "@/lib/groups";

export type EqType = {
  id: number;
  code: string;
  name: string;
  qty_per_branch: number;
  sort_order: number;
  grp: string;
};
export type Equipment = {
  id: string;
  type_id: number;
  grp: string | null;
  owner: string;
  serial_no: string | null;
  brand: string | null;
  model: string | null;
  note: string | null;
};

type SortKey = "type" | "serial_no" | "brand" | "owner";

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
  const [ownerFilter, setOwnerFilter] = useState("");
  const [sort, setSort] = useState<{ key: SortKey; desc: boolean }>({ key: "type", desc: false });
  const [editing, setEditing] = useState<{ item: Equipment | null; grp: string } | null>(null);
  const [viewing, setViewing] = useState<Equipment | null>(null);

  // อุปกรณ์เดิมที่ยังไม่มี group: ใช้ group ของชนิด (POS → POS 1)
  const groupOf = (r: Equipment) => {
    if (r.grp) return r.grp;
    const t = typeMap.get(r.type_id);
    return !t || t.grp === "POS" ? "POS 1" : t.grp;
  };

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    const val = (r: Equipment) =>
      sort.key === "type" ? (typeMap.get(r.type_id)?.sort_order ?? 0) : (r[sort.key] ?? "");
    return items
      .filter(
        (r) =>
          (!ownerFilter || r.owner === ownerFilter) &&
          (!s ||
            [r.serial_no, r.brand, r.model, r.note, typeMap.get(r.type_id)?.name]
              .join(" ")
              .toLowerCase()
              .includes(s)),
      )
      .sort((a, b) => {
        const x = val(a);
        const y = val(b);
        const c =
          typeof x === "number" && typeof y === "number"
            ? x - y
            : String(x).localeCompare(String(y), "th", { numeric: true });
        return (c || (a.serial_no ?? "").localeCompare(b.serial_no ?? "", undefined, { numeric: true })) * (sort.desc ? -1 : 1);
      });
  }, [items, q, ownerFilter, sort, typeMap]);

  const th = (key: SortKey, label: string) => (
    <th
      className="p-3 cursor-pointer select-none whitespace-nowrap"
      onClick={() => setSort((s) => ({ key, desc: s.key === key ? !s.desc : false }))}
    >
      {label} {sort.key === key ? (sort.desc ? "▼" : "▲") : ""}
    </th>
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2 items-center">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="ค้นหา Serial / ยี่ห้อ / รุ่น"
          className="border border-[#B8DCFF] rounded-xl px-3 py-2 w-full sm:w-72 bg-white"
        />
        <select value={ownerFilter} onChange={(e) => setOwnerFilter(e.target.value)} className="border border-[#B8DCFF] rounded-xl px-3 py-2 bg-white">
          <option value="">ทุก Owner</option>
          {OWNERS.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>

      {GROUPS.map((g) => {
        const gTypes = types.filter((t) => belongs(t, g));
        const gAll = items.filter((r) => groupOf(r) === g);
        const rows = filtered.filter((r) => groupOf(r) === g);
        const expectedTotal = gTypes.reduce((s, t) => s + expectedIn(t, g), 0);
        const have = gAll.filter((r) => true).length;
        return (
          <section key={g} className="space-y-3">
            <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-br from-[#081A3A] via-[#0C2553] to-[#044492] text-white px-4 py-3">
              <h2 className="font-extrabold flex-1">{g}</h2>
              <span className="text-sm text-[#B8DCFF]">{have}/{expectedTotal} ชิ้น</span>
              <button
                onClick={() => setEditing({ item: null, grp: g })}
                className="bg-[#FFCB06] hover:bg-[#F5C000] text-[#0C2553] font-extrabold border border-[#E5B300] rounded-xl px-3 py-1.5 text-sm"
              >
                + เพิ่ม
              </button>
            </div>

            <div className="overflow-x-auto bg-white rounded-2xl border border-[#B8DCFF] shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-[#EFF7FF] text-[#044492] text-left">
                  <tr>
                    <th className="p-3">#</th>
                    {th("type", "ชนิดอุปกรณ์")}
                    {th("owner", "Owner")}
                    {th("brand", "ยี่ห้อ / รุ่น")}
                    {th("serial_no", "Serial")}
                    <th className="p-3 text-center">รายละเอียด</th>
                    <th className="p-3" />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={r.id} className="border-t border-[#D8E9FF] hover:bg-[#F4F9FF]">
                      <td className="p-3 text-slate-500">{i + 1}</td>
                      <td className="p-3">{typeMap.get(r.type_id)?.code} {typeMap.get(r.type_id)?.name}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${r.owner === "VTEC" ? "bg-[#EFF7FF] text-[#044492]" : "bg-[#FFFBEB] text-[#8A6500]"}`}>{r.owner}</span>
                      </td>
                      <td className="p-3">{[r.brand, r.model].filter(Boolean).join(" ") || "-"}</td>
                      <td className="p-3 font-mono text-[#0C2553]">{r.serial_no ?? "-"}</td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => setViewing(r)}
                          title={r.note ? "ดูรายละเอียด" : "ยังไม่มีรายละเอียด"}
                          className={r.note ? "text-[#0086FF] hover:text-[#044492]" : "text-slate-300 hover:text-slate-400"}
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h6"/></svg>
                        </button>
                      </td>
                      <td className="p-3 whitespace-nowrap text-right">
                        <button onClick={() => setEditing({ item: r, grp: g })} className="text-[#0086FF] mr-3">แก้ไข</button>
                        <button
                          onClick={() => {
                            if (confirm(`ลบ ${typeMap.get(r.type_id)?.name} ${r.serial_no ?? ""} ?`)) deleteEquipment(r.id, branchId);
                          }}
                          className="text-red-600"
                        >
                          ลบ
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!rows.length && (
                    <tr><td colSpan={7} className="p-6 text-center text-slate-500">ยังไม่มีอุปกรณ์ใน {g}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        );
      })}

      {viewing && (
        <div className="fixed inset-0 bg-black/40 grid place-items-center p-4 z-40" onClick={() => setViewing(null)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl p-5 w-full max-w-md space-y-3 max-h-[90vh] overflow-y-auto">
            <h2 className="font-extrabold text-[#0C2553]">รายละเอียดอุปกรณ์</h2>
            <dl className="text-sm grid grid-cols-[6rem_1fr] gap-y-1">
              <dt className="text-slate-500">ชนิด</dt><dd>{typeMap.get(viewing.type_id)?.code} {typeMap.get(viewing.type_id)?.name}</dd>
              <dt className="text-slate-500">Owner</dt><dd>{viewing.owner}</dd>
              <dt className="text-slate-500">ยี่ห้อ / รุ่น</dt><dd>{[viewing.brand, viewing.model].filter(Boolean).join(" ") || "-"}</dd>
              <dt className="text-slate-500">Serial</dt><dd className="font-mono">{viewing.serial_no ?? "-"}</dd>
            </dl>
            <div className="rounded-xl bg-[#F4F9FF] border border-[#D8E9FF] p-3 text-sm whitespace-pre-wrap min-h-16">
              {viewing.note || <span className="text-slate-400">ยังไม่มีรายละเอียด</span>}
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => { const it = viewing; setViewing(null); setEditing({ item: it, grp: it.grp ?? "" }); }} className="text-[#0086FF] px-3 py-2 text-sm">แก้ไข</button>
              <button onClick={() => setViewing(null)} className="bg-[#FFCB06] text-[#0C2553] font-extrabold border border-[#E5B300] rounded-xl px-4 py-2 text-sm">ปิด</button>
            </div>
          </div>
        </div>
      )}

      {editing && (
        <EquipmentForm
          branchId={branchId}
          types={types}
          item={editing.item}
          initialGroup={editing.grp}
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
  initialGroup,
  onClose,
}: {
  branchId: string;
  types: EqType[];
  item: Equipment | null;
  initialGroup: string;
  onClose: () => void;
}) {
  const [state, action, pending] = useActionState(saveEquipment, null);
  const [grp, setGrp] = useState(initialGroup);
  useEffect(() => {
    if (state && "ok" in state) onClose();
  }, [state, onClose]);
  const options = types.filter((t) => belongs(t, grp));
  const field = "w-full border border-[#B8DCFF] rounded-xl px-3 py-2";
  return (
    <div className="fixed inset-0 bg-black/40 grid place-items-center p-4 z-40" onClick={onClose}>
      <form action={action} onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl p-5 w-full max-w-md space-y-3 max-h-[90vh] overflow-y-auto">
        <h2 className="font-extrabold text-[#0C2553]">{item ? "แก้ไขอุปกรณ์" : "เพิ่มอุปกรณ์"}</h2>
        <input type="hidden" name="id" defaultValue={item?.id ?? ""} />
        <input type="hidden" name="branch_id" value={branchId} />
        <div className="grid grid-cols-2 gap-2">
          <label className="block text-sm">Group
            <select name="grp" value={grp} onChange={(e) => setGrp(e.target.value)} className={field}>
              {GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </label>
          <label className="block text-sm">Owner
            <select name="owner" defaultValue={item?.owner ?? "VTEC"} className={field}>
              {OWNERS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </label>
        </div>
        <label className="block text-sm">ชนิดอุปกรณ์
          <select
            key={grp}
            name="type_id"
            defaultValue={options.some((t) => t.id === item?.type_id) ? item?.type_id : options[0]?.id}
            className={field}
          >
            {options.map((t) => <option key={t.id} value={t.id}>{t.code} {t.name}</option>)}
          </select>
        </label>
        <label className="block text-sm">Serial (ไม่บังคับ)
          <input name="serial_no" defaultValue={item?.serial_no ?? ""} className={field} />
        </label>
        <div className="grid grid-cols-2 gap-2">
          <label className="block text-sm">ยี่ห้อ<input name="brand" defaultValue={item?.brand ?? ""} className={field} /></label>
          <label className="block text-sm">รุ่น<input name="model" defaultValue={item?.model ?? ""} className={field} /></label>
        </div>
        <label className="block text-sm">รายละเอียดอุปกรณ์<textarea name="note" rows={5} placeholder="สเปก, ตำแหน่งติดตั้ง, หมายเหตุอื่น ๆ" defaultValue={item?.note ?? ""} className={field} /></label>
        {state && "error" in state && <p className="text-sm text-red-600">{state.error}</p>}
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm">ยกเลิก</button>
          <button disabled={pending} className="bg-[#FFCB06] hover:bg-[#F5C000] text-[#0C2553] font-extrabold border border-[#E5B300] shadow-sm rounded-xl px-4 py-2 text-sm disabled:opacity-50">
            {pending ? "กำลังบันทึก..." : "บันทึก"}
          </button>
        </div>
      </form>
    </div>
  );
}
