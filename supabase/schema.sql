create table cvs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  file_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table applications (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  job_description text,
  cv_id uuid references cvs(id),
  created_at timestamptz not null default now()
);

alter table cvs enable row level security;
alter table applications enable row level security;
