import { createClient } from "@/lib/supabase/server";
import { GROUPS } from "@/lib/groups";

export type ExportRow = {
  branchCode: string;
  branchName: string;
  group: string;
  typeCode: string;
  typeName: string;
  owner: string;
  brandModel: string;
  serial: string;
  detail: string;
};

/** อุปกรณ์ทั้งหมด (หรือเฉพาะสาขา) เรียงตามสาขา > Group > ชนิด > Serial */
export async function loadExportRows(branchId?: string) {
  const supabase = await createClient();
  let bq = supabase.from("branches").select("id,code,name").order("code");
  if (branchId) bq = bq.eq("id", branchId);
  const [{ data: branches }, { data: types }] = await Promise.all([
    bq.limit(1000),
    supabase.from("equipment_types").select("id,code,name,grp,sort_order"),
  ]);
  const bMap = new Map((branches ?? []).map((b) => [b.id, b]));
  const tMap = new Map((types ?? []).map((t) => [t.id, t]));

  const items: {
    branch_id: string; type_id: number; grp: string | null; owner: string;
    serial_no: string | null; brand: string | null; model: string | null; note: string | null;
  }[] = [];
  for (let from = 0; ; from += 1000) {
    let q = supabase
      .from("equipment")
      .select("branch_id,type_id,grp,owner,serial_no,brand,model,note")
      .order("id")
      .range(from, from + 999);
    if (branchId) q = q.eq("branch_id", branchId);
    const { data } = await q;
    items.push(...(data ?? []));
    if ((data?.length ?? 0) < 1000) break;
  }

  const rows = items
    .map((e) => {
      const b = bMap.get(e.branch_id);
      const t = tMap.get(e.type_id);
      if (!b || !t) return null;
      const group = e.grp ?? (t.grp === "POS" ? "POS 1" : t.grp);
      return {
        sort: [b.code, GROUPS.indexOf(group as (typeof GROUPS)[number]), t.sort_order, e.serial_no ?? ""] as const,
        row: {
          branchCode: b.code,
          branchName: b.name,
          group,
          typeCode: t.code,
          typeName: t.name,
          owner: e.owner,
          brandModel: [e.brand, e.model].filter(Boolean).join(" "),
          serial: e.serial_no ?? "",
          detail: e.note ?? "",
        } satisfies ExportRow,
      };
    })
    .filter((x) => x !== null)
    .sort((a, b) =>
      a.sort[0].localeCompare(b.sort[0], "th", { numeric: true }) ||
      a.sort[1] - b.sort[1] ||
      a.sort[2] - b.sort[2] ||
      a.sort[3].localeCompare(b.sort[3], undefined, { numeric: true }),
    )
    .map((x) => x.row);

  return { branch: branchId ? (branches ?? [])[0] ?? null : null, rows };
}
