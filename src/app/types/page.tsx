import { createClient } from "@/lib/supabase/server";
import { SPECS } from "@/lib/specs";
import DetailList from "@/components/DetailList";

export const dynamic = "force-dynamic";

export default async function TypesPage() {
  const supabase = await createClient();
  const { data: types } = await supabase
    .from("equipment_types")
    .select("id,code,name,category,qty_per_branch,grp")
    .order("sort_order");
  const perBranch = (types ?? []).reduce((s, t) => s + t.qty_per_branch, 0);

  return (
    <main className="max-w-5xl mx-auto p-4 space-y-4">
      <section className="rounded-2xl bg-gradient-to-br from-[#081A3A] via-[#0C2553] to-[#044492] text-white px-5 py-4">
        <h2 className="text-lg font-extrabold">รายการอุปกรณ์ตั้งต้นต่อสาขา</h2>
        <p className="text-sm text-[#B8DCFF] mt-1">
          Manager Room, Back Office / Network, POS 1 และ POS 2 รวม {perBranch} ชิ้นต่อสาขา
        </p>
      </section>
      <div className="space-y-3">
        {(types ?? []).map((t) => (
          <details key={t.id} className="bg-white rounded-2xl border border-[#B8DCFF] shadow-sm">
            <summary className="cursor-pointer p-4 flex items-center gap-3 font-bold text-[#0C2553]">
              <span className="font-mono text-[#0086FF]">{t.code}</span>
              <span className="flex-1">{t.name}</span>
              <span className="text-xs px-2 py-1 rounded-full bg-[#EFF7FF] text-[#044492] border border-[#B8DCFF]">
                {t.grp === "POS" ? "POS 1 + POS 2" : t.grp}
              </span>
              <span className="text-sm px-3 py-1 rounded-xl bg-[#FFCB06] text-[#0C2553]">{t.qty_per_branch} ชิ้น/สาขา</span>
            </summary>
            <div className="px-5 pb-4 text-sm text-slate-700 border-t border-[#D8E9FF] pt-3">
              <DetailList text={(SPECS[t.code] ?? []).join(String.fromCharCode(10))} />
            </div>
          </details>
        ))}
      </div>
    </main>
  );
}
