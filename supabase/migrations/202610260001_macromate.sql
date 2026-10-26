begin;

create table public.food_entries (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  meal text not null check (meal in ('Breakfast', 'Lunch', 'Dinner', 'Snacks')),
  food_name text not null check (length(trim(food_name)) between 1 and 120),
  calories integer not null check (calories between 0 and 1000000),
  protein numeric not null check (protein between 0 and 100000),
  carbs numeric not null check (carbs between 0 and 100000),
  fat numeric not null check (fat between 0 and 100000),
  entry_date date not null,
  created_at timestamptz not null default now()
);
create index food_entries_owner_date on public.food_entries(user_id, entry_date, id);

create table public.workouts (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  workout_type text not null check (workout_type in ('Walking', 'Jogging', 'Running')),
  distance_km numeric(6,2) not null check (distance_km > 0 and distance_km <= 9999.99),
  workout_date date not null,
  created_at timestamptz not null default now()
);
create index workouts_owner_date on public.workouts(user_id, workout_date, id);

create table public.daily_checkins (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  entry_date date not null,
  mood text check (mood in ('Low', 'Okay', 'Good', 'Great')),
  energy_level integer not null default 3 check (energy_level between 1 and 5),
  sleep_minutes integer not null default 0 check (sleep_minutes between 0 and 1440),
  water_glasses integer not null default 0 check (water_glasses between 0 and 8),
  completed_goals text[] not null default '{}' check (
    cardinality(completed_goals) <= 4 and
    completed_goals <@ array['breakfast', 'water', 'activity', 'reflection']::text[] and
    array_position(completed_goals, null) is null
  ),
  primary key (user_id, entry_date)
);

create table public.profiles (
  user_id uuid primary key default auth.uid() references auth.users(id) on delete cascade,
  full_name text not null default '' check (length(full_name) <= 120),
  age integer check (age between 1 and 120),
  height_cm numeric check (height_cm between 30 and 300),
  weight_kg numeric check (weight_kg between 1 and 700),
  activity_level text not null default 'Moderately Active' check (
    activity_level in ('Sedentary', 'Lightly Active', 'Moderately Active', 'Very Active')
  ),
  wellness_goal text not null default '' check (length(wellness_goal) <= 300),
  avatar_data_url text check (avatar_data_url is null or (
    length(avatar_data_url) <= 1500000 and
    avatar_data_url ~ '^data:image/(png|jpeg|webp);base64,[A-Za-z0-9+/]+=*$'
  ))
);

create table public.preferences (
  user_id uuid primary key default auth.uid() references auth.users(id) on delete cascade,
  high_contrast boolean not null default false,
  reduce_motion boolean not null default false,
  enhanced_focus boolean not null default false,
  announcements boolean not null default true
);

do $$
declare target text;
begin
  foreach target in array array['food_entries', 'workouts', 'daily_checkins', 'profiles', 'preferences'] loop
    execute format('alter table public.%I enable row level security', target);
    execute format('revoke all on table public.%I from anon, authenticated', target);
    execute format('grant select, insert, update, delete on table public.%I to authenticated', target);
    execute format('create policy owner_access on public.%I for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)', target);
  end loop;
end $$;
grant usage on schema public to authenticated;
grant usage, select on sequence public.food_entries_id_seq, public.workouts_id_seq to authenticated;

-- Merge only supplied fields, atomically: editing water must not erase mood or goals.
create function public.save_checkin(p_date date, p_patch jsonb)
returns public.daily_checkins language plpgsql security invoker set search_path = '' as $$
declare saved public.daily_checkins;
begin
  if auth.uid() is null then raise exception 'Sign in required' using errcode = '42501'; end if;
  if jsonb_typeof(p_patch) <> 'object' or p_patch = '{}'::jsonb or p_patch is null
    or exists (select 1 from jsonb_object_keys(p_patch) k where k not in ('mood','energyLevel','sleepMinutes','waterGlasses','completedGoals')) then
    raise exception 'Invalid check-in fields' using errcode = '22023';
  end if;
  if exists (select 1 from jsonb_each(p_patch) e where
    (e.key = 'mood' and jsonb_typeof(e.value) <> 'string') or
    (e.key in ('energyLevel','sleepMinutes','waterGlasses') and (jsonb_typeof(e.value) <> 'number' or e.value::text !~ '^[0-9]+$')) or
    (e.key = 'completedGoals' and jsonb_typeof(e.value) <> 'array')) then
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
revoke all on function public.save_checkin(date,jsonb) from public, anon;
grant execute on function public.save_checkin(date,jsonb) to authenticated;

create function public.save_preference(p_key text, p_value boolean)
returns public.preferences language plpgsql security invoker set search_path = '' as $$
declare saved public.preferences;
begin
  if auth.uid() is null then raise exception 'Sign in required' using errcode = '42501'; end if;
  if p_key is null or p_key not in ('highContrast','reduceMotion','enhancedFocus','announcements') or p_value is null then
    raise exception 'Invalid preference' using errcode = '22023';
  end if;
  insert into public.preferences(user_id, high_contrast, reduce_motion, enhanced_focus, announcements)
  values (auth.uid(), case when p_key='highContrast' then p_value else false end,
    case when p_key='reduceMotion' then p_value else false end,
    case when p_key='enhancedFocus' then p_value else false end,
    case when p_key='announcements' then p_value else true end)
  on conflict (user_id) do update set
    high_contrast = case when p_key='highContrast' then excluded.high_contrast else public.preferences.high_contrast end,
    reduce_motion = case when p_key='reduceMotion' then excluded.reduce_motion else public.preferences.reduce_motion end,
    enhanced_focus = case when p_key='enhancedFocus' then excluded.enhanced_focus else public.preferences.enhanced_focus end,
    announcements = case when p_key='announcements' then excluded.announcements else public.preferences.announcements end
  returning * into saved;
  return saved;
end $$;
revoke all on function public.save_preference(text,boolean) from public, anon;
grant execute on function public.save_preference(text,boolean) to authenticated;

commit;
