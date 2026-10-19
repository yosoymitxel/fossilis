const {MAT, BONE} = FG.data;
const {cur, has, digCost, bonePlaster, labCap, marketCap, startEnergy, clone, planDig, planSlide, applyOps, pushPawn, solvePayment, gainPlaster, resolveEvent, drawMarket, finalScoring, step, edgeOf, DIR_ES} = FG.core;
function act(g0, type, pl={}){
  const g = clone(g0);
  const p = cur(g);
  const L = [];
  g.fx = null; g.fxId = (g0.fxId||0) + 1;
  const spend = n => { g.energy -= n; };

  switch(type){
    case 'plaster': if(g.energy<1) break; spend(1); gainPlaster(g,p,1,L); break;
    case 'skillPlaster':
      if(g.energy<1 || g.usedSkill.yeso2) break;
      spend(1); g.usedSkill.yeso2 = true; gainPlaster(g,p,2,L); break;
    case 'move': if(g.energy<1) break; spend(1); p.pos = pl.to; L.push(p.name+' se mueve.'); break;
    case 'climb': if(g.energy<1) break; spend(1); p.pos = pl.to; p.fell=null; L.push(p.name+' sube al yacimiento.'); break;
    case 'sand': {
      const c = has(p,'arenaFree') ? 0 : 1;
      if(g.energy<c) break;
      const k = g.discard.findIndex(t=>t.mat==='sand'); if(k<0) break;
      spend(c); g.cells[pl.to].push(g.discard.splice(k,1)[0]);
      L.push(p.name+' coloca una loseta de arena.'); break; }
    case 'dig': {
      const top = g.cells[pl.from][g.cells[pl.from].length-1];
      const cost = digCost(p, top.mat);
      if(g.energy<cost) break;
      const plan = planDig(g, pl.from, pl.dir);
      if(!plan.ok) break;
      spend(cost);
      L.push(p.name+' cava '+MAT[top.mat].es.toLowerCase()+' hacia '+DIR_ES[pl.dir]+'.');
      const antes = g.cells.map(s=>s.length ? s[s.length-1].mat : null);
      applyOps(g, plan.ops, pl.dir, p, L);
      g.fx = {k:'dig', dir:pl.dir, cells: plan.ops.filter(o=>o.type==='move').map(o=>o.to),
              caidas: plan.ops.filter(o=>o.type==='fall').map(o=>({i:o.from, mat:antes[o.from]}))};
      break; }
    case 'extract': {
      if(g.energy<1) break;
      const item = pl.item;
      const k = g.pits[pl.cell].indexOf(item); if(k<0) break;
      if(item==='martillo'){
        const cap = has(p,'martillo2') ? 2 : 1;
        if(g.hammers>=cap || !g.skillRow.length) break;
        spend(1); g.hammers++; g.pits[pl.cell].splice(k,1);
        const s = g.skillRow.splice(pl.skillIndex ?? 0,1)[0];
        p.skills.push(s);
        g.fx = {k:'extract', cell:pl.cell, item:'martillo'};
        L.push(p.name+' cambia un martillo por la habilidad «'+s.n+'».');
      } else {
        const cost = bonePlaster(p,item);
        if(p.plaster<cost) break;
        spend(1); p.plaster-=cost; g.reserve+=cost;
        g.pits[pl.cell].splice(k,1); p.storage[item]++;
        g.fx = {k:'extract', cell:pl.cell, item};
        L.push(p.name+' extrae '+BONE[item].es.toLowerCase()+' por '+cost+' yeso'+(cost>1?'s':'')+'.');
      }
      break; }
    case 'assign': {
      const d = p.lab[pl.labIndex]; if(!d) break;
      const need = d.bones.slice(); d.assigned.forEach(b=>{const i=need.indexOf(b); if(i>=0)need.splice(i,1);});
      if(!need.includes(pl.bone) || p.storage[pl.bone]<1) break;
      p.storage[pl.bone]--; d.assigned.push(pl.bone);
      L.push(p.name+' asigna '+BONE[pl.bone].es.toLowerCase()+' a '+d.name+'.'); break; }
    case 'scoreLab': {
      const d = p.lab[pl.labIndex]; if(!d) break;
      const perfect = d.assigned.length===d.bones.length;
      const pts = perfect ? d.perfect : d.assigned.reduce((a,b)=>a+BONE[b].val,0);
      p.vp += pts; p.lab.splice(pl.labIndex,1); p.scored.push(d);
      L.push(p.name+' puntúa '+d.name+(perfect?' al completo':' de forma parcial')+': '+pts+' PV.');
      if(perfect){
        if(has(p,'bonoPerf')){ p.vp+=3; L.push('Prensa especializada: +3 PV.'); }
        if(has(p,'herrPerf') && g.toolDeck.length){ p.tools.push({card:{...g.toolDeck.shift(),kind:'tool'},used:false}); L.push('Reconocimiento: roba una herramienta.'); }
      }
      break; }
    case 'scoreRow': {
      const d = g.dinoRow[pl.rowIndex]; if(!d) break;
      const need = {}; d.bones.forEach(b=>need[b]=(need[b]||0)+1);
      if(!Object.entries(need).every(([b,n])=>p.storage[b]>=n)) break;
      Object.entries(need).forEach(([b,n])=>{p.storage[b]-=n;});
      p.vp += d.perfect; p.scored.push({...d, assigned:d.bones.slice()});
      g.dinoRow[pl.rowIndex] = g.dinoDeck.shift() || null;
      L.push(p.name+' puntúa '+d.name+' directamente del expositor: '+d.perfect+' PV.');
      if(has(p,'bonoPerf')) { p.vp+=3; L.push('Prensa especializada: +3 PV.'); }
      if(has(p,'herrPerf') && g.toolDeck.length){ p.tools.push({card:{...g.toolDeck.shift(),kind:'tool'},used:false}); }
      break; }
    case 'buy': {
      if(g.bought >= marketCap(p)) break;
      const card = g.market[pl.marketIndex]; if(!card || card.k==='vacio') break;
      const use = solvePayment(p.tiles, card.cost); if(!use) break;
      use.sort((a,b)=>b-a).forEach(i=>{ g.discard.push(p.tiles.splice(i,1)[0]); });
      g.bought++;
      if(card.kind==='tool'){ p.tools.push({card, used:false}); L.push(p.name+' compra la herramienta '+card.n+'.'); }
      else {
        p.supplies.push(card);
        if(card.gain.plaster) gainPlaster(g,p,card.gain.plaster,null);
        if(card.gain.bone) p.storage[card.gain.bone]++;
        L.push(p.name+' compra el suministro '+card.n+'.');
      }
      g.market[pl.marketIndex] = drawMarket(g, card.kind);
      break; }
    case 'claim': {
      if(p.lab.length >= labCap(p)) break;
      const d = g.dinoRow[pl.rowIndex]; if(!d) break;
      if(!d.bones.includes(pl.bone) || p.storage[pl.bone]<1) break;
      p.storage[pl.bone]--;
      p.lab.push({...d, assigned:[pl.bone]});
      g.dinoRow[pl.rowIndex] = g.dinoDeck.shift() || null;
      L.push(p.name+' lleva '+d.name+' a su laboratorio.');
      break; }
    case 'tool': {
      const slot = p.tools[pl.toolIndex]; if(!slot || slot.used) break;
      const e = slot.card.eff;
      if(e.t==='energy'){ g.energy += e.n; }
      if(e.t==='move'){ p.pos = pl.to; }
      if(e.t==='slide' || e.t==='removeTop' || e.t==='remove'){
        if(e.t==='slide'){
          let from = pl.from;
          for(let s=0;s<(e.dist||1);s++){
            const plan = planSlide(g.cells, from, pl.dir, MAT[g.cells[from][g.cells[from].length-1].mat].w);
            if(!plan.ok) break;
            applyOps(g, plan.ops, pl.dir, p, L);
            const nx = step(from, pl.dir); if(nx===null) break; from = nx;
          }
        } else {
          const t = g.cells[pl.from].pop(); if(t) p.tiles.push(t);
          const rider = g.players.find(q=>q.pos===pl.from && g.cells[pl.from].length===0);
          if(rider){ rider.fell = edgeOf(pl.from); rider.pos=null; L.push(rider.name+' queda fuera del yacimiento.'); }
        }
      }
      if(e.t==='lantern'){ const k=g.discard.findIndex(t=>t.id===pl.tileId); if(k>=0) g.cells[pl.to].push(g.discard.splice(k,1)[0]); }
      if(e.t!=='lantern' || pl.last) slot.used = true;
      L.push(p.name+' usa '+slot.card.n+'.');
      break; }
    case 'skillPush': {
      if(g.usedSkill.empujar) break;
      const t = g.players.find(q=>q.id===pl.targetId); if(!t || t.pos===null) break;
      g.usedSkill.empujar = true;
      pushPawn(g,t,pl.dir,L); if(t.pos!==null) pushPawn(g,t,pl.dir,L);
      break; }
    case 'phase': g.phase = pl.to; break;
    case 'endTurn': return endTurn(g, L);
  }
  g.log = g.log.concat(L.map(t=>({t})));
  return g;
}

function endTurn(g, L=[]){
  let guard=0;
  while(g.pendingEvent && guard++<6) resolveEvent(g, L);
  if(g.endTrigger && g.remaining===undefined){
    g.remaining = (g.players.length-1-g.turn) + g.players.length;
    L.push('Se juega el resto de la ronda y una ronda final.');
  }
  if(g.remaining!==undefined){
    g.remaining--;
    if(g.remaining<=0){ g.over=true; g.breakdown = finalScoring(g); g.log=g.log.concat(L.map(t=>({t}))); return g; }
  }
  g.turn = (g.turn+1) % g.players.length;
  const np = cur(g);
  g.phase='actions'; g.energy = startEnergy(np); g.hammers=0; g.bought=0; g.usedSkill={};
  L.push('— Turno de '+np.name+' —');
  g.log = g.log.concat(L.map(t=>({t})));
  return g;
}
Object.assign(FG.core, {act, endTurn});
