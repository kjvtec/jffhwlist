"use client";

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="bg-[#FFCB06] hover:bg-[#F5C000] text-[#0C2553] font-extrabold border border-[#E5B300] rounded-xl px-4 py-2 text-sm"
    >
      พิมพ์ / บันทึกเป็น PDF
    </button>
  );
}
