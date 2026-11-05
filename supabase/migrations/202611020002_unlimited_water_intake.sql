begin;

alter table public.daily_checkins
  drop constraint if exists daily_checkins_water_glasses_check;

alter table public.daily_checkins
  add constraint daily_checkins_water_glasses_check check (water_glasses >= 0);

commit;
