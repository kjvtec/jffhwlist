-- รันใน Supabase > SQL Editor (รันซ้ำได้)
-- 1) Serial ไม่บังคับ (เก็บเป็นเทมเพลตรายการก่อน)  2) รวม Manager Room กับ Back Office / Network เป็นกลุ่มเดียว

alter table equipment alter column serial_no drop not null;

update equipment_types set grp = 'Manager Room / Back Office Network'
 where grp in ('Manager Room', 'Back Office / Network');
update equipment set grp = 'Manager Room / Back Office Network'
 where grp in ('Manager Room', 'Back Office / Network');
