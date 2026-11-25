"use client";

import { useActionState, useState } from "react";
import { addBranches } from "@/app/actions";

export default function AddBranches() {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(addBranches, null);
  return (
    <>
      <button onClick={() => setOpen(true)} className="bg-slate-900 text-white rounded-lg px-4 py-2 text-sm">
        + เพิ่มสาขา
      </button>
      {open && (
        <div className="fixed inset-0 bg-black/40 grid place-items-center p-4 z-10" onClick={() => setOpen(false)}>
          <form action={action} onClick={(e) => e.stopPropagation()} className="bg-white rounded-xl p-5 w-full max-w-md space-y-3">
            <h2 className="font-semibold">เพิ่มสาขา</h2>
            <p className="text-sm text-slate-500">บรรทัดละ 1 สาขา รูปแบบ: รหัส,ชื่อสาขา (วางหลายบรรทัดได้)</p>
            <textarea name="lines" rows={8} required placeholder={"J001,สาขาสยาม\nJ002,สาขาอารีย์"} className="w-full border rounded-lg p-2 font-mono text-sm" />
            {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
            {state?.ok && <p className="text-sm text-green-700">{state.ok}</p>}
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 text-sm">ปิด</button>
              <button disabled={pending} className="bg-slate-900 text-white rounded-lg px-4 py-2 text-sm disabled:opacity-50">บันทึก</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
