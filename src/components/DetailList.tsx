import { normalizeDetail, splitLine } from "@/lib/detail";

/** แสดงรายละเอียดเป็นรายการ bullet พร้อมหัวข้อตัวหนา */
export default function DetailList({ text, className = "" }: { text: string | null; className?: string }) {
  const lines = normalizeDetail(text);
  if (!lines.length) return null;
  return (
    <ul className={`list-disc pl-5 space-y-0.5 marker:text-[#0086FF] ${className}`}>
      {lines.map((l, i) => {
        const { head, body } = splitLine(l);
        return (
          <li key={i}>
            {head && <span className="font-bold text-[#044492]">{head}: </span>}
            {body}
          </li>
        );
      })}
    </ul>
  );
}
