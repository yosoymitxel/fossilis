const {BONE} = FG.data;
const {cur, has, bonePlaster, marketCap, labCap, digCost, climbTargets, extractTargets, moveTargets, digTargets, planDig, openPit, solvePayment, rc, DIRS, ri, rnd} = FG.core;
function boneUtility(g,p,b){
  if(b==='martillo') return 3;
  let u = BONE[b].end/6;
  p.lab.forEach(d=>{ const need=d.bones.slice(); d.assigned.forEach(x=>{const i=need.indexOf(x);if(i>=0)need.splice(i,1);}); if(need.includes(b)) u+=4; });
  g.dinoRow.forEach(d=>{ if(d && d.bones.includes(b)) u+=1.2; });
  return u;
}
function aiStep(g){
  const p = cur(g);
  if(g.phase==='actions'){
    if(p.pos===null){ const c=climbTargets(g,p); if(c.length && g.energy>=1) return {t:'climb', to:c[0]}; }
    for(let i=0;i<g.dinoRow.length;i++){ const d=g.dinoRow[i]; if(!d) continue;
      const need={}; d.bones.forEach(b=>need[b]=(need[b]||0)+1);
      if(Object.entries(need).every(([b,n])=>p.storage[b]>=n)) return {t:'scoreRow', rowIndex:i}; }
    for(let i=0;i<p.lab.length;i++){ if(p.lab[i].assigned.length===p.lab[i].bones.length) return {t:'scoreLab', labIndex:i}; }
    for(let i=0;i<p.lab.length;i++){ const d=p.lab[i]; const need=d.bones.slice(); d.assigned.forEach(x=>{const k=need.indexOf(x);if(k>=0)need.splice(k,1);});
      const m=need.find(b=>p.storage[b]>0); if(m) return {t:'assign', labIndex:i, bone:m}; }
    if(g.energy<1) return {t:'phase', to:'market'};

    const ex = extractTargets(g,p);
    let best=null;
    ex.forEach(c=>g.pits[c].forEach(it=>{
      if(it==='martillo'){ const cap=has(p,'martillo2')?2:1; if(g.hammers>=cap||!g.skillRow.length) return; }
      else if(p.plaster < bonePlaster(p,it)) return;
      const u = boneUtility(g,p,it);
      if(!best||u>best.u) best={u, cell:c, item:it};
    }));
    if(best && best.u>=1.2) return {t:'extract', cell:best.cell, item:best.item, skillIndex:ri(g.skillRow.length)};

    const wants = ex.some(c=>g.pits[c].some(it=>it!=='martillo' && boneUtility(g,p,it)>=3));
    if(wants && p.plaster<6 && (g.pool>0||g.reserve>0)) return {t:'plaster'};

    const useful = [...Array(25).keys()].filter(i=>openPit(g,i) && g.pits[i].some(it=>boneUtility(g,p,it)>=2));
    const mv = moveTargets(g,p);
    if(useful.length && mv.length && !ex.length){
      const score = i => Math.min(...useful.map(u=>{const[a,b]=rc(i),[c,d]=rc(u);return Math.abs(a-c)+Math.abs(b-d);}));
      const to = mv.slice().sort((a,b)=>score(a)-score(b))[0];
      if(p.pos===null || score(to) < score(p.pos)) return {t:'move', to};
    }
    const cand=[];
    digTargets(g,p).forEach(from=>{
      const top=g.cells[from][g.cells[from].length-1];
      const cost=digCost(p,top.mat); if(cost>g.energy) return;
      Object.keys(DIRS).forEach(dir=>{
        const plan=planDig(g,from,dir); if(!plan.ok) return;
        let v = -cost*0.6;
        if(plan.ops.some(o=>o.type==='fall')) v += 2.2;
        if(g.cells[from].length===1 && g.pits[from].length) v += 1.6 + g.pits[from].length*0.35;
        if(from===p.pos) v -= 1.0;
        v += rnd()*0.4;
        cand.push({v,from,dir});
      });
    });
    if(cand.length){ cand.sort((a,b)=>b.v-a.v); const c=cand[0]; if(c.v>-0.5) return {t:'dig', from:c.from, dir:c.dir}; }
    if(g.pool>0 || (p.plaster<8 && g.reserve>0)) return {t:'plaster'};
    return {t:'phase', to:'market'};
  }
  if(g.phase==='market'){
    if(g.bought < marketCap(p)){
      const opts = g.market.map((c,i)=>({c,i})).filter(o=>o.c.k!=='vacio' && solvePayment(p.tiles,o.c.cost));
      if(opts.length){
        opts.sort((a,b)=>(Object.values(b.c.cost).reduce((x,y)=>x+y,0))-(Object.values(a.c.cost).reduce((x,y)=>x+y,0)));
        return {t:'buy', marketIndex:opts[0].i};
      }
    }
    return {t:'phase', to:'lab'};
  }
  if(g.phase==='lab'){
    if(p.lab.length < labCap(p)){
      const opts=[];
      g.dinoRow.forEach((d,i)=>{ if(!d) return; const b=d.bones.find(x=>p.storage[x]>0); if(b) opts.push({i,b,v:d.perfect/d.bones.length}); });
      if(opts.length){ opts.sort((a,b)=>b.v-a.v); return {t:'claim', rowIndex:opts[0].i, bone:opts[0].b}; }
    }
    return {t:'endTurn'};
  }
  return {t:'endTurn'};
}
Object.assign(FG.core, {boneUtility, aiStep});
