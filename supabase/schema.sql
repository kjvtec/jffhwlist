-- Jiffy Hardware Inventory — รันทั้งไฟล์ใน Supabase > SQL Editor

create table if not exists branches (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  region text,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists equipment_types (
  id serial primary key,
  code text not null unique,          -- 1.1, 1.2, ... 2, 3
  name text not null,
  category text not null check (category in ('core','optional')),
  qty_per_branch int not null,        -- จำนวนที่ควรมีต่อสาขา
  sort_order int not null
);

create table if not exists equipment (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid not null references branches(id) on delete cascade,
  type_id int not null references equipment_types(id),
  serial_no text not null unique,
  brand text,
  model text,
  status text not null default 'in_use' check (status in ('in_use','spare','repair','lost')),
  installed_at date,
  note text,
  updated_at timestamptz not null default now()
);
create index if not exists equipment_branch_idx on equipment(branch_id);

-- สรุปจำนวนอุปกรณ์ต่อสาขา (หลีกเลี่ยง limit 1000 แถวของ API)
create or replace view branch_summary with (security_invoker = true) as
select b.id as branch_id, count(e.id)::int as total
from branches b left join equipment e on e.branch_id = b.id
group by b.id;

-- RLS: ให้เฉพาะผู้ที่ล็อกอินเข้าถึงได้
alter table branches enable row level security;
alter table equipment_types enable row level security;
alter table equipment enable row level security;
do $$ declare t text; begin
  foreach t in array array['branches','equipment_types','equipment'] loop
    execute format('drop policy if exists "auth all" on %I', t);
    execute format('create policy "auth all" on %I for all to authenticated using (true) with check (true)', t);
  end loop;
end $$;

-- ข้อมูลชนิดอุปกรณ์ (POS 2 ชุด + HHT 2 + Laser Printer 1 ต่อสาขา)
insert into equipment_types (code,name,category,qty_per_branch,sort_order) values
 ('1.1','POS','core',2,1),
 ('1.2','Finger Scan','core',2,2),
 ('1.3','Thermal Printer','core',2,3),
 ('1.4','Cash Drawer','core',2,4),
 ('1.5','Mouse','core',2,5),
 ('1.6','Keyboard','core',2,6),
 ('1.7','Numpad','core',2,7),
 ('1.8','Barcode Scanner','core',2,8),
 ('1.9','Smart Card Reader','core',2,9),
 ('2','Hand Held (HHT)','optional',2,10),
 ('3','Laser Printer','optional',1,11)
on conflict (code) do nothing;
