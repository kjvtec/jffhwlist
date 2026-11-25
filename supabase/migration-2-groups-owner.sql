-- รันใน Supabase > SQL Editor (รันซ้ำได้)
-- เพิ่ม Group อุปกรณ์, คอลัมน์ Owner และชนิดอุปกรณ์ใหม่

alter table equipment_types add column if not exists grp text not null default 'POS';
alter table equipment add column if not exists grp text;
alter table equipment add column if not exists owner text not null default 'VTEC';
alter table equipment drop constraint if exists equipment_owner_check;
alter table equipment add constraint equipment_owner_check check (owner in ('VTEC','PTTRM ICT'));

-- grp ของชนิด: 'POS' = ใช้ได้ทั้ง POS 1 และ POS 2 (qty_per_branch = รวมทั้ง 2 ชุด)
insert into equipment_types (code,name,category,qty_per_branch,sort_order,grp) values
 ('1.1','POS','core',2,1,'POS'),
 ('1.2','Finger Scan','core',2,2,'POS'),
 ('1.3','Thermal Printer','core',2,3,'POS'),
 ('1.4','Cash Drawer','core',2,4,'POS'),
 ('1.5','Mouse','core',2,5,'POS'),
 ('1.6','Keyboard','core',2,6,'POS'),
 ('1.7','Numpad','core',2,7,'POS'),
 ('1.8','Barcode Scanner','core',2,8,'POS'),
 ('1.9','Smart Card Reader','core',2,9,'POS'),
 ('1.10','Second Display (Touch Screen)','core',2,10,'POS'),
 ('2','Hand Held (HHT)','optional',2,11,'Manager Room'),
 ('3','Laser Printer','optional',1,12,'Manager Room'),
 ('4.1','E-Box PC','core',1,13,'Back Office / Network'),
 ('4.2','UPS APC 1600VA','core',1,14,'Back Office / Network'),
 ('4.3','Surge Protector','core',1,15,'Back Office / Network'),
 ('4.4','German plug cable','core',1,16,'Back Office / Network'),
 ('4.5','Multifunction Printer','core',1,17,'Back Office / Network'),
 ('4.6','Color Printer','core',1,18,'Back Office / Network'),
 ('4.7','ID Card Reader','core',1,19,'Back Office / Network'),
 ('4.8','Hub Switch 24 ports','core',1,20,'Back Office / Network'),
 ('4.9','Access Point','core',1,21,'Back Office / Network')
on conflict (code) do update set
  name = excluded.name, category = excluded.category,
  qty_per_branch = excluded.qty_per_branch,
  sort_order = excluded.sort_order, grp = excluded.grp;

-- อุปกรณ์เดิมที่ยังไม่มี group
update equipment e set grp = case when t.grp = 'POS' then 'POS 1' else t.grp end
from equipment_types t where e.type_id = t.id and e.grp is null;
