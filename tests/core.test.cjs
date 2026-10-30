const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const core=require('../core.js');
const ctx={window:{}};vm.runInNewContext(fs.readFileSync(require.resolve('../data.js'),'utf8'),ctx);
const data=JSON.parse(JSON.stringify(ctx.window.KISH_DATA));
test('416 activities have unique persistent IDs and required fields',()=>{
 assert.equal(data.length,416);assert.equal(new Set(data.map(x=>x.id)).size,416);
 assert.ok(data.every(x=>x.name&&x.primary&&Array.isArray(x.related)&&Array.isArray(x.methods)));
 assert.ok(data.every(x=>!/^\d{5}\.0$/.test(x.schedule)));
});
test('interest filter is OR over primary and related fields, without duplicates',()=>{
 const selectedFields=['환경·지속가능성','미술·디자인'];
 const found=data.filter(a=>core.matches(a,{selectedFields}));
 assert.ok(found.some(x=>x.name==='환경보호 포스터 공모전'));
 assert.equal(new Set(found.map(x=>x.id)).size,found.length);
 assert.ok(found.every(a=>core.fields(a).some(f=>selectedFields.includes(f))));
});
test('month ranges, enumerations, cross-year ranges and uncertain dates',()=>{
 assert.deepEqual(core.months('3–7월·9–12월'),[3,4,5,6,7,9,10,11,12]);
 assert.deepEqual(core.months('3·6·9·11월'),[3,6,9,11]);
 assert.deepEqual(core.months('2학기(8월–2027년 1월), 월 미명시'),[1,8,9,10,11,12]);
 assert.deepEqual(core.months('2027년 1월'),[1]);
 assert.deepEqual(core.months('월 미명시'),[]);
 assert.ok(core.periodMatch({schedule:'연중'},'7'));
 assert.ok(core.periodMatch({schedule:'명확하지 않음'},'unknown'));
 assert.ok(!core.periodMatch({schedule:'5월'},'unknown'));
});
test('category, timing, method and query intersect',()=>{
 const a=data.find(x=>x.name==='환경보호 포스터 공모전');
 assert.ok(core.matches(a,{q:'포스터',category:a.category,method:'대회·공모'}));
 assert.ok(!core.matches(a,{q:'포스터',category:'방과후'}));
 assert.ok(!core.matches(a,{method:'공연·연주'}));
});
test('basket aggregation counts each activity exactly once',()=>{
 const g=core.groups(data);assert.equal(g.reduce((sum,x)=>sum+x.items.length,0),data.length);
 assert.ok(g.every(x=>x.items.every(a=>a.primary===x.field)));
});
