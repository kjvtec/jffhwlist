import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import EquipmentTable, { type Equipment, type EqType } from "@/components/EquipmentTable";
import { deleteBranch } from "../../actions";

export default async function BranchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: branch }, { data: types }, { data: items }] = await Promise.all([
    supabase.from("branches").select("id,code,name").eq("id", id).maybeSingle(),
    supabase.from("equipment_types").select("id,code,name,qty_per_branch,sort_order").order("sort_order"),
    supabase
      .from("equipment")
      .select("id,type_id,serial_no,brand,model,status,installed_at,note")
      .eq("branch_id", id)
      .limit(1000),
  ]);
  if (!branch) notFound();

  return (
    <main className="max-w-6xl mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/" className="text-sm text-blue-700">← กลับหน้าสาขา</Link>
          <h1 className="text-xl font-semibold">
            {branch.code} · {branch.name}
          </h1>
        </div>
        <form
          action={async () => {
            "use server";
            await deleteBranch(id);
          }}
        >
          <button className="text-sm text-red-600">ลบสาขา</button>
        </form>
      </div>
      <EquipmentTable
        branchId={id}
        types={(types ?? []) as EqType[]}
        items={(items ?? []) as Equipment[]}
      />
    </main>
  );
}
