-- Create Locations table
create table locations (
  id uuid primary key default gen_random_uuid(),
  city text not null,
  country text,
  photo_url text,
  created_at timestamp default now()
);

-- Create Places table (optional, tied to locations)
create table places (
  id uuid primary key default gen_random_uuid(),
  location_id uuid references locations(id),
  place_name text not null,
  photo_url text,
  created_at timestamp default now()
);

-- Alter Microblogs
alter table microblogs
add column location_id uuid references locations(id),
add column place_id uuid references places(id);
