revoke delete on table "public"."locations" from "anon";

revoke insert on table "public"."locations" from "anon";

revoke references on table "public"."locations" from "anon";

revoke select on table "public"."locations" from "anon";

revoke trigger on table "public"."locations" from "anon";

revoke truncate on table "public"."locations" from "anon";

revoke update on table "public"."locations" from "anon";

revoke delete on table "public"."locations" from "authenticated";

revoke insert on table "public"."locations" from "authenticated";

revoke references on table "public"."locations" from "authenticated";

revoke select on table "public"."locations" from "authenticated";

revoke trigger on table "public"."locations" from "authenticated";

revoke truncate on table "public"."locations" from "authenticated";

revoke update on table "public"."locations" from "authenticated";

revoke delete on table "public"."locations" from "service_role";

revoke insert on table "public"."locations" from "service_role";

revoke references on table "public"."locations" from "service_role";

revoke select on table "public"."locations" from "service_role";

revoke trigger on table "public"."locations" from "service_role";

revoke truncate on table "public"."locations" from "service_role";

revoke update on table "public"."locations" from "service_role";

revoke delete on table "public"."places" from "anon";

revoke insert on table "public"."places" from "anon";

revoke references on table "public"."places" from "anon";

revoke select on table "public"."places" from "anon";

revoke trigger on table "public"."places" from "anon";

revoke truncate on table "public"."places" from "anon";

revoke update on table "public"."places" from "anon";

revoke delete on table "public"."places" from "authenticated";

revoke insert on table "public"."places" from "authenticated";

revoke references on table "public"."places" from "authenticated";

revoke select on table "public"."places" from "authenticated";

revoke trigger on table "public"."places" from "authenticated";

revoke truncate on table "public"."places" from "authenticated";

revoke update on table "public"."places" from "authenticated";

revoke delete on table "public"."places" from "service_role";

revoke insert on table "public"."places" from "service_role";

revoke references on table "public"."places" from "service_role";

revoke select on table "public"."places" from "service_role";

revoke trigger on table "public"."places" from "service_role";

revoke truncate on table "public"."places" from "service_role";

revoke update on table "public"."places" from "service_role";

alter table "public"."microblogs" drop constraint "microblogs_location_id_fkey";

alter table "public"."microblogs" drop constraint "microblogs_place_id_fkey";

alter table "public"."places" drop constraint "places_location_id_fkey";

alter table "public"."locations" drop constraint "locations_pkey";

alter table "public"."places" drop constraint "places_pkey";

drop index if exists "public"."locations_pkey";

drop index if exists "public"."places_pkey";

drop table "public"."locations";

drop table "public"."places";

alter table "public"."microblogs" drop column "location_id";

alter table "public"."microblogs" drop column "place_id";


