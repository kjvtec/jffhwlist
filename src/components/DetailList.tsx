import { normalizeDetail, splitLine } from "@/lib/detail";

type Block = { heading: string | null; items: string[] };

// บรรทัดที่ไม่มี ":" สั้น ๆ และไม่มีตัวเลข ถือเป็น "หัวข้อกลุ่ม" (เช่น ELECTRICAL, ขนาดโดยรวม)
const isHeading = (l: string) => !l.includes(":") && l.length <= 28 && !/\d/.test(l);

function toBlocks(lines: string[]): Block[] {
  const blocks: Block[] = [];
  for (const l of lines) {
    if (isHeading(l)) blocks.push({ heading: l, items: [] });
    else {
      if (!blocks.length) blocks.push({ heading: null, items: [] });
      blocks[blocks.length - 1].items.push(l);
    }
  }
  return blocks;
}

/** แสดงรายละเอียดเป็นหัวข้อ + bullet (รูปแบบเดียวกันทุกหน้า) */
export default function DetailList({ text, className = "" }: { text: string | null; className?: string }) {
  const blocks = toBlocks(normalizeDetail(text));
  if (!blocks.length) return null;
  return (
    <div className={`space-y-2 ${className}`}>
      {blocks.map((b, i) => (
        <div key={i}>
          {b.heading && <div className="font-bold text-[#0C2553]">{b.heading}</div>}
          {b.items.length > 0 && (
            <ul className="list-disc pl-5 space-y-0.5 marker:text-[#0086FF]">
              {b.items.map((l, j) => {
                const { head, body } = splitLine(l);
                return (
                  <li key={j}>
                    {head && <span className="font-bold text-[#044492]">{head}: </span>}
                    {body}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}
