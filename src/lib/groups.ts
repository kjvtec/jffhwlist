export const GROUPS = ["Manager Room", "Back Office / Network", "POS 1", "POS 2"] as const;
export type Group = (typeof GROUPS)[number];

export const OWNERS = ["VTEC", "PTTRM ICT"] as const;

type T = { grp: string; qty_per_branch: number };

/** ชนิดอุปกรณ์ที่เลือกได้ใน group นั้น (ชนิด grp 'POS' ใช้ได้ทั้ง POS 1 และ POS 2) */
export function belongs(t: T, g: string) {
  return g.startsWith("POS") ? t.grp === "POS" : t.grp === g;
}

/** จำนวนที่ควรมีของชนิดนั้นใน group (POS แบ่งครึ่งระหว่าง 2 ชุด) */
export function expectedIn(t: T, g: string) {
  return g.startsWith("POS") ? Math.floor(t.qty_per_branch / 2) : t.qty_per_branch;
}
