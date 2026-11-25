"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function login(_: unknown, fd: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: String(fd.get("email")),
    password: String(fd.get("password")),
  });
  if (error) return { error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" };
  redirect("/");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

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
  const { error } = await supabase.from("branches").insert(rows);
  if (error) return { error: error.message.includes("duplicate") ? "รหัสสาขาซ้ำ" : error.message };
  revalidatePath("/");
  return { ok: `เพิ่ม ${rows.length} สาขาแล้ว` };
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
    serial_no: String(fd.get("serial_no") ?? "").trim(),
    brand: String(fd.get("brand") ?? "").trim() || null,
    model: String(fd.get("model") ?? "").trim() || null,
    status: String(fd.get("status")),
    installed_at: String(fd.get("installed_at") ?? "") || null,
    note: String(fd.get("note") ?? "").trim() || null,
    updated_at: new Date().toISOString(),
  };
  if (!row.serial_no) return { error: "กรุณากรอก Serial" };
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
