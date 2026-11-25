/** จัดรูปแบบรายละเอียดอุปกรณ์: บรรทัดละ 1 หัวข้อ "หัวข้อ: ค่า" (ตัดบรรทัดว่าง, ตัด bullet เดิม, จัดช่องว่าง) */
export function normalizeDetail(raw: string | null | undefined): string[] {
  return (raw ?? "")
    .split(/\r?\n/)
    .map((l) => l.replace(/^[\s•·●▪\-–*]+/, "").trim())
    .filter(Boolean)
    .map((l) => {
      const m = l.match(/^([^:：]{1,60}?)\s*[:：]\s*(.*)$/);
      return m ? `${m[1].trim()}: ${m[2].trim().replace(/\s{2,}/g, " ")}` : l.replace(/\s{2,}/g, " ");
    });
}

export function splitLine(line: string): { head: string | null; body: string } {
  const m = line.match(/^([^:]{1,60}?):\s*(.*)$/);
  return m ? { head: m[1], body: m[2] } : { head: null, body: line };
}
