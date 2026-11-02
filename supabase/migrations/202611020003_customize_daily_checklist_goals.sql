begin;

alter table public.daily_checkins
  drop constraint if exists daily_checkins_completed_goals_check;

alter table public.daily_checkins
  add constraint daily_checkins_completed_goals_check check (
    cardinality(completed_goals) <= 20 and
    array_position(completed_goals, null) is null
  );

create or replace function public.save_checkin(p_date date, p_patch jsonb)
returns public.daily_checkins language plpgsql security invoker set search_path = '' as $$
declare saved public.daily_checkins;
begin
  if auth.uid() is null then raise exception 'Sign in required' using errcode = '42501'; end if;
  if jsonb_typeof(p_patch) <> 'object' or p_patch = '{}'::jsonb or p_patch is null
    or exists (select 1 from jsonb_object_keys(p_patch) k where k not in ('mood','energyLevel','sleepMinutes','waterGlasses','completedGoals')) then
    raise exception 'Invalid check-in fields' using errcode = '22023';
  end if;
  if exists (select 1 from jsonb_each(p_patch) e where
    (e.key = 'mood' and jsonb_typeof(e.value) not in ('string','null')) or
    (e.key in ('energyLevel','sleepMinutes','waterGlasses') and (jsonb_typeof(e.value) <> 'number' or e.value::text !~ '^[0-9]+$')) or
    (e.key = 'completedGoals' and (
      jsonb_typeof(e.value) <> 'array' or jsonb_array_length(e.value) > 20 or
      exists (select 1 from jsonb_array_elements(e.value) as goal(value)
        where jsonb_typeof(goal.value) is distinct from 'string'
          or coalesce(goal.value #>> '{}', '') !~ '^[A-Za-z0-9_-]{1,64}$')
    ))) then
    raise exception 'Invalid check-in values' using errcode = '22023';
  end if;
  insert into public.daily_checkins(user_id, entry_date, mood, energy_level, sleep_minutes, water_glasses, completed_goals)
  values (auth.uid(), p_date, p_patch->>'mood', coalesce((p_patch->>'energyLevel')::integer,3),
    coalesce((p_patch->>'sleepMinutes')::integer,0), coalesce((p_patch->>'waterGlasses')::integer,0),
    case when p_patch ? 'completedGoals' then array(select jsonb_array_elements_text(p_patch->'completedGoals')) else '{}'::text[] end)
  on conflict (user_id, entry_date) do update set
    mood = case when p_patch ? 'mood' then excluded.mood else public.daily_checkins.mood end,
    energy_level = case when p_patch ? 'energyLevel' then excluded.energy_level else public.daily_checkins.energy_level end,
    sleep_minutes = case when p_patch ? 'sleepMinutes' then excluded.sleep_minutes else public.daily_checkins.sleep_minutes end,
    water_glasses = case when p_patch ? 'waterGlasses' then excluded.water_glasses else public.daily_checkins.water_glasses end,
    completed_goals = case when p_patch ? 'completedGoals' then excluded.completed_goals else public.daily_checkins.completed_goals end
  returning * into saved;
  return saved;
end $$;

commit;
