import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import EquipmentTable, { type Equipment, type EqType } from "@/components/EquipmentTable";
import TemplateButton from "@/components/TemplateButton";
import { deleteBranch } from "../../actions";

export default async function BranchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: branch }, { data: types }, { data: items }] = await Promise.all([
    supabase.from("branches").select("id,code,name").eq("id", id).maybeSingle(),
    supabase.from("equipment_types").select("id,code,name,qty_per_branch,sort_order,grp").order("sort_order"),
    supabase
      .from("equipment")
      .select("id,type_id,grp,owner,serial_no,brand,model,status,installed_at,note")
      .eq("branch_id", id)
      .limit(1000),
  ]);
  if (!branch) notFound();

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/" className="text-sm text-[#0086FF]">← กลับหน้าสาขา</Link>
          <h1 className="text-xl font-extrabold text-[#0C2553]">
            {branch.code} · {branch.name}
          </h1>
        </div>
        <div className="flex items-center gap-3">
        <TemplateButton branchId={id} label="เติมตามเทมเพลต" />
        <form
          action={async () => {
            "use server";
            await deleteBranch(id);
          }}
        >
          <button className="text-sm text-red-600">ลบสาขา</button>
        </form>
        </div>
      </div>
      <EquipmentTable
        branchId={id}
        types={(types ?? []) as EqType[]}
        items={(items ?? []) as Equipment[]}
      />
    </main>
  );
}
