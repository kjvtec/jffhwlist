import { createClient } from "@/lib/supabase/server";
import AddBranches from "@/components/AddBranches";
import BranchList from "@/components/BranchList";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = await createClient();
  const [{ data: branches }, { data: summary }, { data: types }] = await Promise.all([
    supabase.from("branches").select("id,code,name").order("code").limit(1000),
    supabase.from("branch_summary").select("branch_id,total").limit(1000),
    supabase.from("equipment_types").select("qty_per_branch"),
  ]);
  const expected = (types ?? []).reduce((s, t) => s + t.qty_per_branch, 0);
  const totals = new Map((summary ?? []).map((s) => [s.branch_id, s.total]));
  const rows = (branches ?? []).map((b) => ({ ...b, total: totals.get(b.id) ?? 0 }));

  const complete = rows.filter((r) => r.total >= expected).length;
  const totalItems = rows.reduce((s, r) => s + r.total, 0);
  const stats = [
    ["สาขาทั้งหมด", rows.length],
    ["อุปกรณ์ทั้งหมด", totalItems],
    ["สาขาที่อุปกรณ์ครบ", complete],
    ["ควรมีต่อสาขา", expected],
  ];

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-4">
      <section className="rounded-2xl bg-gradient-to-br from-[#081A3A] via-[#0C2553] to-[#044492] text-white px-5 py-4 flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-48">
          <h2 className="text-lg font-extrabold">อุปกรณ์รายสาขา Jiffy</h2>
          <p className="text-sm text-[#B8DCFF]">ตรวจสอบว่าแต่ละสาขามีอุปกรณ์ครบตามที่กำหนดหรือไม่</p>
        </div>
        {stats.map(([l, v]) => (
          <div key={l} className="bg-white/[0.07] border border-white/15 rounded-xl px-4 py-2 text-center">
            <div className="text-xl font-extrabold text-[#FFCB06]">{v}</div>
            <div className="text-xs text-[#B8DCFF]">{l}</div>
          </div>
        ))}
        <AddBranches />
      </section>
      <BranchList rows={rows} expected={expected} />
    </main>
  );
}
