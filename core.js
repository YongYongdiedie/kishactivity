(function(root){
 'use strict';
 const collator=new Intl.Collator('ko',{numeric:true,sensitivity:'base'});
 const compare=(a,b)=>collator.compare(a.name,b.name);
 const fields=a=>[...new Set([a.primary,...a.related])];
 function months(text){
   const found=new Set();
   // Only parse month-marked sequences; years, grades and page numbers are excluded.
   const pattern=/(?<!\d)(1[0-2]|[1-9])((?:\s*[·,~–—−-]\s*(?:1[0-2]|[1-9]))*)\s*월/g;
   for(const match of text.matchAll(pattern)){
     const seq=match[0].replace(/월/g,'');
     for(const part of seq.split(/[·,]/)){
       const nums=part.match(/\d+/g).map(Number);
       if(nums.length===1)found.add(nums[0]);
       else if(nums[0]<=nums[1])for(let m=nums[0];m<=nums[1];m++)found.add(m);
       else{for(let m=nums[0];m<=12;m++)found.add(m);for(let m=1;m<=nums[1];m++)found.add(m);}
     }
   }
   // Cross-year dates such as 8월–2027년 1월.
   for(const m of text.matchAll(/(1[0-2]|[1-9])월\s*[~–—−-]\s*20\d{2}년\s*(1[0-2]|[1-9])월/g)){
     for(let n=+m[1];n<=12;n++)found.add(n);for(let n=1;n<=+m[2];n++)found.add(n);
   }
   return [...found].sort((a,b)=>a-b);
 }
 function periodMatch(a,p){
   if(!p)return true;
   const text=a.schedule;
   if(p==='ongoing')return /연중|상시|수시|학기 중/.test(text);
   if(p==='unknown')return months(text).length===0&&!/연중|상시|수시|학기 중/.test(text);
   // Month filters also include explicitly ongoing activities.
   return months(text).includes(+p)||/연중|상시/.test(text);
 }
 function matches(a,{q='',category='',period='',method='',selectedFields=[]}={}){
   const query=q.normalize('NFC').toLocaleLowerCase().trim();
   const haystack=[a.name,a.department,a.primary,...a.related,...a.methods].join(' ').normalize('NFC').toLocaleLowerCase();
   return (!query||haystack.includes(query))&&(!category||a.category===category)&&periodMatch(a,period)&&(!method||a.methods.includes(method))&&(!selectedFields.length||fields(a).some(f=>selectedFields.includes(f)));
 }
 function groups(items){const map=new Map();for(const a of items){if(!map.has(a.primary))map.set(a.primary,[]);map.get(a.primary).push(a);}return [...map].map(([field,items])=>({field,items})).sort((a,b)=>b.items.length-a.items.length||collator.compare(a.field,b.field));}
 const api={compare,fields,months,periodMatch,matches,groups};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.KishCore=api;
})(typeof window!=='undefined'?window:globalThis);
