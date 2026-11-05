import { test } from 'node:test';
import assert from 'node:assert/strict';
import { allRows, dayFromRow, profileFromRow, preferencesFromRow, unwrap } from '../src/supabase/database.js';

test('journal pagination retains records beyond the default API page', async () => {
  const source = Array.from({ length: 1207 }, (_, id) => ({ id }));
  const result = await allRows(() => ({ range: (start, end) => Promise.resolve({ data: source.slice(start,end+1), error:null }) }));
  assert.equal(result.length,1207); assert.equal(result.at(-1).id,1206);
});
test('a failure on a later page is reported rather than returning partial charts', async () => {
  await assert.rejects(allRows(() => ({ range: (start) => Promise.resolve(start ? { error:{message:'Connection failed'} } : {data:Array(1000).fill({}),error:null}) })),/Connection failed/);
});
test('empty mood stays unlogged while shared health values map to the UI', () => {
  const day = dayFromRow({mood:null,energy_level:4,sleep_minutes:450,water_glasses:3,completed_goals:['water']});
  assert.equal(day.mood,null); assert.equal(day.sleepMinutes,450); assert.equal(day.waterGlasses,3);
});
test('profile and preferences map only supported database columns', () => {
  const profile = profileFromRow({full_name:'Test Person',age:24,height_cm:170,weight_kg:65,activity_level:'Moderately Active',wellness_goal:'Track habits',avatar_data_url:null,secret:'not returned'});
  assert.equal(profile.fullName,'Test Person'); assert.equal(profile.heightCm,170); assert.equal('secret' in profile,false);
  assert.deepEqual(preferencesFromRow({high_contrast:true,reduce_motion:false,enhanced_focus:true,announcements:false}),{highContrast:true,reduceMotion:false,enhancedFocus:true,announcements:false});
  assert.throws(() => unwrap({error:{message:'Access denied'}}),/Access denied/);
});
