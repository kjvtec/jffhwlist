import { createClient } from "@/lib/supabase/server";
import { logout } from "./actions";
import AddBranches from "@/components/AddBranches";
import BranchList from "@/components/BranchList";

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

  return (
    <main className="max-w-5xl mx-auto p-4 space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">อุปกรณ์รายสาขา Jiffy ({rows.length} สาขา)</h1>
        <div className="flex gap-2 items-center">
          <AddBranches />
          <form action={logout}><button className="text-sm text-slate-600 px-2">ออกจากระบบ</button></form>
        </div>
      </header>
      <BranchList rows={rows} expected={expected} />
    </main>
  );
}
