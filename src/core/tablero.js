const {MAT} = FG.data;
const {step, ortho, diag, around8, edgeOf, cellsOnEdge, DIR_ES, has, pawnAt, openPit} = FG.core;
function digTargets(g,p){
  if(p.pos===null) return [];
  const list = [p.pos, ...ortho(p.pos)];
  if(has(p,'diagCav')) list.push(...diag(p.pos));
  return list.filter(i=>g.cells[i].length>0);
}
function extractTargets(g,p){
  if(p.pos===null) return [];
  const list = has(p,'diagExt') ? around8(p.pos) : ortho(p.pos);
  return list.filter(i=>openPit(g,i));
}
function moveTargets(g,p){
  if(p.pos===null) return [];
  const max = has(p,'mover3') ? 3 : 2;
  const seen = {[p.pos]:0}, out = new Set(), q=[p.pos];
  while(q.length){
    const i = q.shift();
    if(seen[i]>=max) continue;
    for(const j of around8(i)){
      if(g.cells[j].length===0) continue;
      if(seen[j]!==undefined && seen[j]<=seen[i]+1) continue;
      seen[j]=seen[i]+1; q.push(j);
      if(!pawnAt(g,j)) out.add(j);
    }
  }
  out.delete(p.pos);
  return [...out];
}
function sandTargets(g,p){
  if(!g.discard.some(t=>t.mat==='sand')) return [];
  const base = p.pos===null ? cellsOnEdge(p.fell) : ortho(p.pos);
  return base.filter(i=>g.cells[i].length<2);
}
function climbTargets(g,p){
  if(p.pos!==null) return [];
  const libre = i => g.cells[i].length>0 && !pawnAt(g,i);
  const propio = cellsOnEdge(p.fell).filter(libre);
  if(propio.length) return propio;
  return ['N','S','E','O'].flatMap(cellsOnEdge).filter((i,k,a)=>a.indexOf(i)===k).filter(libre);
}

function planSlide(cells, from, dir, weight){
  const to = step(from, dir);
  if(to===null) return {ok:true, ops:[{type:'fall', from}]};
  const ops = [];
  if(cells[to].length===2){
    const top = cells[to][1];
    if(MAT[top.mat].w > weight) return {ok:false, ops:[]};
    const sub = planSlide(cells, to, dir, weight);
    if(!sub.ok) return {ok:false, ops:[]};
    ops.push(...sub.ops);
  }
  ops.push({type:'move', from, to});
  return {ok:true, ops};
}
function planDig(g, from, dir){
  if(g.cells[from].length===0) return {ok:false, ops:[]};
  const top = g.cells[from][g.cells[from].length-1];
  return planSlide(g.cells, from, dir, MAT[top.mat].w);
}
function pushPawn(g, p, dir, log){
  const to = step(p.pos, dir);
  if(to===null){ p.fell = edgeOf(p.pos); p.pos=null; log.push(p.name+' sale del yacimiento por el lado '+DIR_ES[dir]+'.'); return; }
  if(g.cells[to].length===0){ p.fell = edgeOf(to); p.pos=null; log.push(p.name+' cae en una fosa y queda fuera.'); return; }
  const other = g.players.find(q=>q!==p && q.pos===to);
  if(other) pushPawn(g, other, dir, log);
  p.pos = to;
}
function applyOps(g, ops, dir, actor, log){
  for(const op of ops){
    const rider = g.players.find(p=>p.pos===op.from);
    if(op.type==='fall'){
      const t = g.cells[op.from].pop();
      actor.tiles.push(t);
      log.push(actor.name+' reclama una loseta de '+MAT[t.mat].es.toLowerCase()+'.');
      if(rider){ rider.fell = edgeOf(op.from); rider.pos=null; log.push(rider.name+' cae fuera con la loseta.'); }
    } else {
      const victim = g.players.find(p=>p.pos===op.to && p!==rider);
      if(victim) pushPawn(g, victim, dir, log);
      g.cells[op.to].push(g.cells[op.from].pop());
      if(rider) rider.pos = op.to;
    }
  }
}

function reach(g,p,max){
  if(p.pos===null) return [];
  const seen={[p.pos]:0}, out=new Set(), q=[p.pos];
  while(q.length){ const i=q.shift(); if(seen[i]>=max) continue;
    for(const j of around8(i)){
      if(g.cells[j].length===0) continue;
      if(seen[j]!==undefined && seen[j]<=seen[i]+1) continue;
      seen[j]=seen[i]+1; q.push(j); if(!pawnAt(g,j)) out.add(j);
    }}
  out.delete(p.pos); return [...out];
}
Object.assign(FG.core, {digTargets, extractTargets, moveTargets, sandTargets, climbTargets, reach, planSlide, planDig, pushPawn, applyOps});
