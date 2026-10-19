const {FR} = FG.data;
function applyTile(t, need){
  for(const f of t.frags){
    if(f!=='comodin' && need[f]>0){ need[f]--; continue; }
    if(f==='comodin'){ const s=FR.find(x=>need[x]>0); if(s){need[s]--;continue;} }
    if(need.comodin>0) need.comodin--;
  }
}
function solvePayment(tiles, cost){
  const need = {ambar:0,huevo:0,huella:0,comodin:0,...cost};
  const used = new Set();
  const pick = score => {
    let best=null;
    tiles.forEach((t,i)=>{ if(used.has(i))return; const s=score(t); if(s>0&&(!best||s>best.s||(s===best.s&&t.frags.length<tiles[best.i].frags.length))) best={i,s}; });
    return best;
  };
  for(const f of FR){
    let guard=0;
    while(need[f]>0 && guard++<40){
      const b = pick(t=>t.frags.filter(x=>x===f||x==='comodin').length);
      if(!b) return null;
      used.add(b.i); applyTile(tiles[b.i], need);
    }
  }
  let guard=0;
  while(need.comodin>0 && guard++<40){
    const b = pick(t=>t.frags.length);
    if(!b) return null;
    used.add(b.i); applyTile(tiles[b.i], need);
  }
  return [...used];
}

function gainPlaster(g, p, n, log){
  for(let i=0;i<n;i++){
    if(g.pool>0){ g.pool--; p.plaster++; if(g.pool===0) g.pendingEvent = g.pendingEvent || 'due'; }
    else if(g.reserve>0){ g.reserve--; p.plaster++; }
  }
  if(log) log.push(p.name+' gana '+n+' yeso'+(n>1?'s':'')+'.');
}
Object.assign(FG.core, {applyTile, solvePayment, gainPlaster});
