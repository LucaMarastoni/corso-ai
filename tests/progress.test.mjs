import {test} from 'node:test';
import assert from 'node:assert/strict';
import {initialState,award,complete,score,unlock,restore,canFinish,keyFor} from '../app/progress.ts';
import {levels} from '../app/journey.ts';
const prepare=(s,n)=>({...s,seen:[...new Set([...s.seen,...[0,1,2].map(i=>keyFor(n,i))])],solved:[...new Set([...s.solved,...[0,1,2].map(i=>keyFor(n,i))])],notes:{...s.notes,[n]:'Il mio prompt e la revisione verificata con tutti i criteri.'},checks:{...s.checks,[n]:[0,1,2]}});
test('Cannot unlock a level by skipping the learning or laboratory requirements',()=>{
 assert.equal(unlock(initialState),0);assert.equal(canFinish(initialState,0),false);assert.equal(score(complete(initialState,0)),0);
 const later=prepare(initialState,2);assert.equal(complete(later,2).completed.length,0);
 const missing=prepare(initialState,0);missing.solved=missing.solved.slice(1);assert.equal(complete(missing,0).completed.length,0);
});
test('Retries and repeated completion never farm points; full journey is 600',()=>{
 let s=initialState;s=award(s,'0:0');s=award(s,'0:0');assert.equal(score(s),20);
 for(let n=0;n<6;n++){s=prepare(s,n);s=complete(s,n);const once=score(s);s=complete(s,n);assert.equal(score(s),once);assert.equal(unlock(s),Math.min(n+1,5));}
 assert.equal(score(s),600);assert.equal(s.completed.length,6);
 assert.deepEqual(restore(JSON.stringify(s)),s);
});
test('Saved progress sanitizes malformed fields and preserves completed rewards after note edits',()=>{
 const s=complete(prepare(initialState,0),0);s.notes[0]='';s.checks[0]=[];assert.equal(score(restore(JSON.stringify(s))),100);
 const restored=restore(JSON.stringify({level:99,step:-1,solved:['0:0','0:0','9:2',null],seen:[],completed:[5,0],notes:{0:6},checks:{0:[8,'x']}}));
 assert.equal(restored.level,0);assert.equal(restored.step,0);assert.deepEqual(restored.solved,['0:0']);assert.deepEqual(restored.completed,[]);
 assert.throws(()=>restore('not-json'));
});
test('All six levels have complete slides, balanced A/B exercises and matching feedback',()=>{
 assert.equal(levels.length,6);let a=0,b=0;
 for(const l of levels){assert.equal(l.slides.length,3);assert.equal(l.challenges.length,3);assert.equal(l.criteria.length,3);for(const s of l.slides)assert.equal(s.steps.length,3);for(const q of l.challenges){assert.equal(q.options.length,2);assert.ok(q.correct===0||q.correct===1);assert.ok(q.why.length>40&&q.hint.length>15);q.correct===0?a++:b++;}}
 assert.ok(a>=7&&b>=7);
});
