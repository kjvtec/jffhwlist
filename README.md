# Jiffy Hardware Inventory

เว็บเช็คอุปกรณ์รายสาขา (Next.js + Supabase + Vercel)

## ตั้งค่า Supabase
1. สร้าง project ที่ supabase.com
2. SQL Editor → วางและรัน `supabase/schema.sql`
3. Authentication → Users → Add user (อีเมล + รหัสผ่านของคุณ) แล้วปิด Sign ups ใน Authentication → Providers → Email
4. Project Settings → API → คัดลอก Project URL และ anon key

## รันในเครื่อง
```
copy .env.example .env.local   # ใส่ค่าจริง
npm run dev
```

## Deploy บน Vercel
1. push โค้ดขึ้น GitHub
2. Import repo ใน Vercel
3. ตั้ง Environment Variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## การใช้งาน
- หน้าแรก: รายชื่อสาขา + เพิ่มสาขาหลายรายการ (บรรทัดละ `รหัส,ชื่อ`)
- คลิกรหัสสาขา: ตารางอุปกรณ์ เรียงตามชนิด / Serial / สถานะ ได้ เพิ่ม แก้ไข ลบได้
- จำนวนที่ควรมีต่อสาขา: POS ชุดละ 2 (1.1–1.9), HHT 2, Laser Printer 1 (แก้ที่ตาราง `equipment_types.qty_per_branch`)
