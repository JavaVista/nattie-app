create table "public"."microblogs" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid default gen_random_uuid(),
    "title" text,
    "content" jsonb,
    "created_at" timestamp without time zone not null default now(),
    "location" text,
    "file_urls" text[] default '{}'::text[],
    "useless_facts" jsonb
);


alter table "public"."microblogs" enable row level security;

create table "public"."users" (
    "id" uuid not null default gen_random_uuid(),
    "email" text,
    "name" text,
    "created_at" timestamp without time zone not null default now()
);


alter table "public"."users" enable row level security;

CREATE UNIQUE INDEX microblogs_pkey ON public.microblogs USING btree (id);

CREATE UNIQUE INDEX users_pkey ON public.users USING btree (id);

alter table "public"."microblogs" add constraint "microblogs_pkey" PRIMARY KEY using index "microblogs_pkey";

alter table "public"."users" add constraint "users_pkey" PRIMARY KEY using index "users_pkey";

alter table "public"."microblogs" add constraint "microblogs_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) not valid;

alter table "public"."microblogs" validate constraint "microblogs_user_id_fkey";

grant delete on table "public"."microblogs" to "anon";

grant insert on table "public"."microblogs" to "anon";

grant references on table "public"."microblogs" to "anon";

grant select on table "public"."microblogs" to "anon";

grant trigger on table "public"."microblogs" to "anon";

grant truncate on table "public"."microblogs" to "anon";

grant update on table "public"."microblogs" to "anon";

grant delete on table "public"."microblogs" to "authenticated";

grant insert on table "public"."microblogs" to "authenticated";

grant references on table "public"."microblogs" to "authenticated";

grant select on table "public"."microblogs" to "authenticated";

grant trigger on table "public"."microblogs" to "authenticated";

grant truncate on table "public"."microblogs" to "authenticated";

grant update on table "public"."microblogs" to "authenticated";

grant delete on table "public"."microblogs" to "service_role";

grant insert on table "public"."microblogs" to "service_role";

grant references on table "public"."microblogs" to "service_role";

grant select on table "public"."microblogs" to "service_role";

grant trigger on table "public"."microblogs" to "service_role";

grant truncate on table "public"."microblogs" to "service_role";

grant update on table "public"."microblogs" to "service_role";

grant delete on table "public"."users" to "anon";

grant insert on table "public"."users" to "anon";

grant references on table "public"."users" to "anon";

grant select on table "public"."users" to "anon";

grant trigger on table "public"."users" to "anon";

grant truncate on table "public"."users" to "anon";

grant update on table "public"."users" to "anon";

grant delete on table "public"."users" to "authenticated";

grant insert on table "public"."users" to "authenticated";

grant references on table "public"."users" to "authenticated";

grant select on table "public"."users" to "authenticated";

grant trigger on table "public"."users" to "authenticated";

grant truncate on table "public"."users" to "authenticated";

grant update on table "public"."users" to "authenticated";

grant delete on table "public"."users" to "service_role";

grant insert on table "public"."users" to "service_role";

grant references on table "public"."users" to "service_role";

grant select on table "public"."users" to "service_role";

grant trigger on table "public"."users" to "service_role";

grant truncate on table "public"."users" to "service_role";

grant update on table "public"."users" to "service_role";

create policy "Users can manage their own blogs"
on "public"."microblogs"
as permissive
for all
to public
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));


create policy "Allow anyone to register"
on "public"."users"
as permissive
for insert
to public
with check (true);


create policy "Allow user to view own record"
on "public"."users"
as permissive
for select
to public
using ((auth.uid() = id));



