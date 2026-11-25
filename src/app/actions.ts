"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { GROUPS, belongs, expectedIn } from "@/lib/groups";

// เพิ่มสาขาหลายรายการ: บรรทัดละ "รหัส,ชื่อสาขา"
export async function addBranches(_: unknown, fd: FormData) {
  const rows = String(fd.get("lines") ?? "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const [code, ...rest] = l.split(",");
      return { code: code.trim(), name: rest.join(",").trim() || code.trim() };
    });
  if (!rows.length) return { error: "กรอกอย่างน้อย 1 บรรทัด" };
  const supabase = await createClient();
  const { data, error } = await supabase.from("branches").insert(rows).select("id");
  if (error) return { error: error.message.includes("duplicate") ? "รหัสสาขาซ้ำ" : error.message };
  const made = await fillTemplate((data ?? []).map((b) => b.id));
  revalidatePath("/");
  return { ok: `เพิ่ม ${rows.length} สาขา และสร้างรายการอุปกรณ์ ${made} รายการแล้ว` };
}

export async function deleteBranch(id: string) {
  const supabase = await createClient();
  await supabase.from("branches").delete().eq("id", id);
  revalidatePath("/");
  redirect("/");
}

export async function saveEquipment(_: unknown, fd: FormData) {
  const id = String(fd.get("id") ?? "");
  const branchId = String(fd.get("branch_id"));
  const row = {
    branch_id: branchId,
    type_id: Number(fd.get("type_id")),
    grp: String(fd.get("grp") ?? "") || null,
    owner: String(fd.get("owner") ?? "VTEC"),
    serial_no: String(fd.get("serial_no") ?? "").trim() || null,
    brand: String(fd.get("brand") ?? "").trim() || null,
    model: String(fd.get("model") ?? "").trim() || null,
    note: String(fd.get("note") ?? "").trim() || null,
    updated_at: new Date().toISOString(),
  };
  const supabase = await createClient();
  const { error } = id
    ? await supabase.from("equipment").update(row).eq("id", id)
    : await supabase.from("equipment").insert(row);
  if (error) return { error: error.message.includes("duplicate") ? "Serial นี้มีอยู่ในระบบแล้ว" : error.message };
  revalidatePath(`/branches/${branchId}`);
  revalidatePath("/");
  return { ok: "บันทึกแล้ว" };
}

export async function deleteEquipment(id: string, branchId: string) {
  const supabase = await createClient();
  await supabase.from("equipment").delete().eq("id", id);
  revalidatePath(`/branches/${branchId}`);
  revalidatePath("/");
}

// สร้างรายการอุปกรณ์ตามเทมเพลต (ไม่มี Serial) ให้สาขา: เติมเฉพาะที่ยังขาด ไม่ซ้ำของเดิม
async function fillTemplate(branchIds: string[] | null) {
  const supabase = await createClient();
  const { data: types } = await supabase.from("equipment_types").select("id,grp,qty_per_branch");
  let ids = branchIds;
  if (!ids) {
    ids = [];
    for (let from = 0; ; from += 1000) {
      const { data } = await supabase.from("branches").select("id").order("id").range(from, from + 999);
      ids.push(...(data ?? []).map((b) => b.id));
      if ((data?.length ?? 0) < 1000) break;
    }
  }
  const have = new Map<string, number>();
  for (let from = 0; ; from += 1000) {
    let q = supabase.from("equipment").select("branch_id,type_id,grp").order("id").range(from, from + 999);
    if (branchIds) q = q.in("branch_id", branchIds);
    const { data } = await q;
    (data ?? []).forEach((e) => {
      const k = `${e.branch_id}|${e.type_id}|${e.grp}`;
      have.set(k, (have.get(k) ?? 0) + 1);
    });
    if ((data?.length ?? 0) < 1000) break;
  }
  const rows: Record<string, unknown>[] = [];
  for (const branch_id of ids) {
    for (const t of types ?? []) {
      for (const g of GROUPS) {
        if (!belongs(t, g)) continue;
        const need = expectedIn(t, g) - (have.get(`${branch_id}|${t.id}|${g}`) ?? 0);
        for (let i = 0; i < need; i++) {
          rows.push({ branch_id, type_id: t.id, grp: g, owner: "VTEC", status: "in_use", serial_no: null });
        }
      }
    }
  }
  for (let i = 0; i < rows.length; i += 500) {
    const { error } = await supabase.from("equipment").insert(rows.slice(i, i + 500));
    if (error) throw new Error(error.message);
  }
  return rows.length;
}

export async function applyTemplate(branchId: string | null) {
  const n = await fillTemplate(branchId ? [branchId] : null);
  revalidatePath("/");
  if (branchId) revalidatePath(`/branches/${branchId}`);
  return n;
}
