import Link from "next/link";

export default function Nav() {
  return (
    <nav className="sticky top-0 z-30 shadow-md">
      <div className="bg-white/95 backdrop-blur-md border-b border-[#D8E9FF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16 gap-3">
          <Link href="/" className="flex items-center gap-3 min-w-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logos/jiffy-logo.png" alt="Jiffy" className="h-9 w-9 sm:h-10 sm:w-10 object-contain shrink-0" />
            <span className="h-6 w-px bg-slate-200 shrink-0" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logos/pttrm-logo.png" alt="PTT RM" className="h-8 sm:h-9 w-auto object-contain shrink-0" />
            <div className="min-w-0">
              <h1 className="text-sm sm:text-lg font-extrabold text-[#0C2553] leading-none truncate">Hardware Inventory Jiffy</h1>
              <p className="text-[10px] sm:text-xs text-slate-500 mt-1 truncate">VTec Pos Retail • Jiffy Project</p>
            </div>
          </Link>
          <div className="flex items-center gap-2 text-xs sm:text-sm font-bold">
            <Link href="/" className="px-3 py-2 rounded-xl bg-[#EFF7FF] hover:bg-[#DCEEFF] text-[#044492] border border-[#B8DCFF]">สาขา</Link>
            <Link href="/types" className="px-3 py-2 rounded-xl bg-[#EFF7FF] hover:bg-[#DCEEFF] text-[#044492] border border-[#B8DCFF]">รายการอุปกรณ์ตั้งต้น</Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
