"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { applyTemplate } from "@/app/actions";

export default function TemplateButton({ branchId, label }: { branchId: string | null; label: string }) {
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <button
      disabled={pending}
      onClick={() => {
        const msg = branchId
          ? "เติมรายการอุปกรณ์ตามเทมเพลตให้สาขานี้ (เพิ่มเฉพาะที่ยังขาด)?"
          : "เติมรายการอุปกรณ์ตามเทมเพลตให้ทุกสาขา (เพิ่มเฉพาะที่ยังขาด)?";
        if (!confirm(msg)) return;
        start(async () => {
          const n = await applyTemplate(branchId);
          alert(`เพิ่มรายการอุปกรณ์ ${n} รายการ`);
          router.refresh();
        });
      }}
      className="bg-[#EFF7FF] hover:bg-[#DCEEFF] text-[#044492] font-bold border border-[#B8DCFF] rounded-xl px-4 py-2 text-sm disabled:opacity-50"
    >
      {pending ? "กำลังสร้าง..." : label}
    </button>
  );
}
