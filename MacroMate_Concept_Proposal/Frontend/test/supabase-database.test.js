import { before, beforeEach, after, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

const alice = '11111111-1111-4111-8111-111111111111';
const bob = '22222222-2222-4222-8222-222222222222';
let database;
before(async () => {
  database = new PGlite();
  await database.exec(`create role anon; create role authenticated;
    create schema auth; create table auth.users(id uuid primary key);
    create function auth.uid() returns uuid language sql stable as
      $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
    grant usage on schema auth to anon, authenticated;
    insert into auth.users values ('${alice}'),('${bob}');`);
  await database.exec(await readFile(new URL('../../../supabase/migrations/202610260001_macromate.sql', import.meta.url), 'utf8'));
});
beforeEach(async () => {
  await database.exec('reset role; truncate public.food_entries, public.workouts, public.daily_checkins, public.profiles, public.preferences restart identity;');
});
after(() => database?.close());
async function asUser(uid, sql, params = []) {
  await database.exec('reset role');
  await database.query("select set_config('request.jwt.claim.sub',$1,false)", [uid || '']);
  await database.exec(`set role ${uid ? 'authenticated' : 'anon'}`);
  return database.query(sql, params);
}
async function addAll() {
  await asUser(alice, "insert into public.food_entries(meal,food_name,calories,protein,carbs,fat,entry_date) values ('Breakfast','Oats',250,8,40,5,'2026-10-26')");
  await asUser(alice, "insert into public.workouts(workout_type,distance_km,workout_date) values ('Walking',2.5,'2026-10-26')");
  await asUser(alice, 'select public.save_checkin($1,$2)', ['2026-10-26', { mood: 'Great', waterGlasses: 3 }]);
  await asUser(alice, "insert into public.profiles(full_name,age,height_cm,weight_kg,wellness_goal) values ('Alice',24,170,65,'Track my habits')");
  await asUser(alice, "select public.save_preference('highContrast',true)");
}
test('owner can create, reload, update and delete their persisted module data', async () => {
  await addAll();
  for (const table of ['food_entries','workouts','daily_checkins','profiles','preferences']) {
    const result = await asUser(alice, `select * from public.${table}`);
    assert.equal(result.rows.length, 1);
    assert.equal(result.rows[0].user_id, alice);
  }
  await asUser(alice, "update public.profiles set full_name='Alice Updated'");
  assert.equal((await asUser(alice, 'select full_name from public.profiles')).rows[0].full_name, 'Alice Updated');
  await asUser(alice, 'delete from public.food_entries where id=1');
  assert.equal((await asUser(alice, 'select * from public.food_entries')).rows.length, 0);
});
test('other accounts cannot read, edit or delete owner rows', async () => {
  await addAll();
  for (const table of ['food_entries','workouts','daily_checkins','profiles','preferences']) {
    assert.equal((await asUser(bob, `select * from public.${table}`)).rows.length, 0);
    await asUser(bob, `delete from public.${table}`);
    assert.equal((await asUser(alice, `select * from public.${table}`)).rows.length, 1);
  }
  await asUser(bob, "update public.profiles set full_name='Intruder'");
  assert.equal((await asUser(alice, 'select full_name from public.profiles')).rows[0].full_name, 'Alice');
});
test('forged ownership and changing a row to another account are denied', async () => {
  await assert.rejects(asUser(bob, 'insert into public.profiles(user_id,full_name) values ($1,$2)', [alice,'Forged']), /row-level security/i);
  await asUser(alice, "insert into public.profiles(full_name) values ('Alice')");
  await assert.rejects(asUser(alice, 'update public.profiles set user_id=$1', [bob]), /row-level security/i);
});
test('guests have no table or RPC access', async () => {
  for (const table of ['food_entries','workouts','daily_checkins','profiles','preferences']) {
    await assert.rejects(asUser(null, `select * from public.${table}`), /permission denied/i);
  }
  await assert.rejects(asUser(null, 'select public.save_checkin($1,$2)', ['2026-10-26',{ mood:'Good' }]), /permission denied/i);
  await assert.rejects(asUser(null, "select public.save_preference('highContrast',true)"), /permission denied/i);
});
test('atomic health and preference patches preserve unrelated fields', async () => {
  await asUser(alice, 'select public.save_checkin($1,$2)', ['2026-10-26',{ mood:'Great', completedGoals:['breakfast'] }]);
  await asUser(alice, 'select public.save_checkin($1,$2)', ['2026-10-26',{ waterGlasses:6, sleepMinutes:450 }]);
  const day = (await asUser(alice, 'select * from public.daily_checkins')).rows[0];
  assert.equal(day.mood, 'Great'); assert.equal(day.water_glasses, 6); assert.equal(day.sleep_minutes,450);
  assert.deepEqual(day.completed_goals,['breakfast']);
  await asUser(alice, "select public.save_preference('highContrast',true)");
  await asUser(alice, "select public.save_preference('reduceMotion',true)");
  const preferences = (await asUser(alice, 'select * from public.preferences')).rows[0];
  assert.equal(preferences.high_contrast,true); assert.equal(preferences.reduce_motion,true); assert.equal(preferences.announcements,true);
});
test('check-in RPC rejects invalid numbers, unknown fields, goals and dates', async () => {
  for (const patch of [{waterGlasses:9},{waterGlasses:1.5},{energyLevel:0},{sleepMinutes:1441},{completedGoals:['admin']},{mood:'Invalid'},{user_id:bob},{waterGlasses:'1'}]) {
    await assert.rejects(asUser(alice, 'select public.save_checkin($1,$2)', ['2026-10-26',patch]));
  }
  await assert.rejects(asUser(alice,'select public.save_checkin($1,$2)',['2026-99-99',{mood:'Good'}]));
  await assert.rejects(asUser(alice,"select public.save_preference('admin',true)"));
});
test('database constraints reject invalid meals, workouts, profiles and unsafe avatars', async () => {
  await assert.rejects(asUser(alice,"insert into public.food_entries(meal,food_name,calories,protein,carbs,fat,entry_date) values ('Brunch','Oats',250,8,40,5,'2026-10-26')"));
  await assert.rejects(asUser(alice,"insert into public.workouts(workout_type,distance_km,workout_date) values ('Walking',-1,'2026-10-26')"));
  await assert.rejects(asUser(alice,"insert into public.profiles(age) values (0)"));
  await assert.rejects(asUser(alice,"insert into public.profiles(avatar_data_url) values ('data:image/svg+xml;base64,PHN2Zz4=')"));
});
