const {EVENTS, MAT} = FG.data;
const {ri, cur, climbTargets} = FG.core;
function resolveEvent(g, log){
  const ev = g.eventDeck.shift() || EVENTS[ri(EVENTS.length)];
  const actor = cur(g);
  log.push('EVENTO — '+ev.n+': '+ev.d);
  const ef = [];
  const lista = a => a.map(p=>p.name).join(', ');
  g.lastEvent = {n:ev.n, d:ev.d, efectos:ef, id:(g.lastEvent?g.lastEvent.id:0)+1};
  switch(ev.k){
    case 'derrumbe': {
      const heavy = g.discard.slice().sort((a,b)=>MAT[b.mat].w-MAT[a.mat].w).slice(0,2);
      heavy.forEach(t=>{
        const spots = [...Array(25).keys()].filter(i=>g.cells[i].length<2 && !(t.mat==='stone'&&g.cells[i][0]&&g.cells[i][0].mat==='stone'&&g.cells[i].length===1));
        if(!spots.length) return;
        const s = spots[ri(spots.length)];
        g.cells[s].push(t); g.discard.splice(g.discard.indexOf(t),1);
      });
      ef.push(heavy.length ? 'Caen '+heavy.length+' loseta'+(heavy.length===1?'':'s')+' sobre el yacimiento.' : 'No había losetas en el descarte.');
      break; }
    case 'suministro': { const dio=[]; g.players.forEach(p=>{let k=0; for(let i=0;i<2;i++){if(g.reserve>0){g.reserve--;p.plaster++;k++;}} if(k)dio.push(p.name+' +'+k);});
      ef.push(dio.length?dio.join(' · '):'La reserva estaba vacía: nadie recibe yeso.'); break; }
    case 'subvencion': { const max=Math.max(...g.players.map(p=>p.vp));
      const lider=g.players.filter(p=>p.vp===max), gana=g.players.filter(p=>p.vp<max);
      gana.forEach(p=>p.vp+=3);
      ef.push(gana.length ? 'Lidera '+lista(lider)+'. Ganan 3 PV: '+lista(gana)+'.' : 'Todos empatados: nadie cobra.');
      break; }
    case 'viento': g.market = g.market.map(c => drawMarket(g, c.kind));
      ef.push('Mercado nuevo: '+g.market.map(c=>c.n).join(', ')+'.'); break;
    case 'relevo': { const dio=[]; g.players.forEach(p=>{ if(g.toolDeck.length){ const c={...g.toolDeck.shift(),kind:'tool'}; p.tools.push({card:c,used:false}); dio.push(p.name+': '+c.n); } });
      ef.push(dio.length?dio.join(' · '):'El mazo de herramientas está agotado.'); break; }
    case 'hallazgo': { if(g.dinoDeck.length){ const k=ri(4); const fuera=g.dinoRow[k]; g.dinoRow[k]=g.dinoDeck.shift();
        ef.push('Se marcha '+(fuera?fuera.name:'una carta')+'. Llega '+g.dinoRow[k].name+'.');
      } else ef.push('El mazo de dinosaurios está agotado.'); break; }
    case 'jornada': { let k=0; for(let i=0;i<3;i++){if(g.reserve>0){g.reserve--;actor.plaster++;k++;}} actor.vp+=2;
      ef.push(actor.name+' disparó el evento: +'+k+' yeso'+(k===1?'':'s')+' y +2 PV.'); break; }
    case 'inspeccion': { const multa=g.players.filter(p=>p.plaster>=6);
      multa.forEach(p=>{p.plaster-=2; g.reserve+=2;});
      ef.push(multa.length ? 'Devuelven 2 yesos: '+lista(multa)+'.' : 'Nadie acumulaba 6 o más yesos.'); break; }
    case 'temblor': { const vuelven=[]; g.players.forEach(p=>{ if(p.pos===null){ const t=climbTargets(g,p); if(t.length){ p.pos=t[ri(t.length)]; p.fell=null; vuelven.push(p.name); } } });
      ef.push(vuelven.length ? 'Vuelven al yacimiento: '+vuelven.join(', ')+'.' : 'Nadie estaba fuera del yacimiento.'); break; }
    case 'prensa': { const tot=p=>Object.values(p.storage).reduce((a,b)=>a+b,0);
      const m=Math.max(...g.players.map(tot)); const w=g.players.filter(p=>tot(p)===m);
      if(m===0) ef.push('Nadie guarda huesos todavía.');
      else if(w.length===1){ w[0].vp+=4; ef.push(w[0].name+' lidera con '+m+' huesos y gana 4 PV.'); }
      else ef.push('Empate a '+m+' huesos entre '+lista(w)+'. La mayoría empatada no cobra.');
      break; }
  }
  g.poolIndex++;
  if(g.poolIndex>4){ g.endTrigger = true; log.push('Se ha agotado el cuarto depósito. Última ronda.'); }
  else {
    const n = 4*g.players.length; const take = Math.min(n, g.reserve);
    g.reserve-=take; g.pool=take;
    log.push('Depósito '+g.poolIndex+' de 4 repuesto con '+take+' yesos.');
  }
  g.pendingEvent = null;
  if(!g.endTrigger && g.pool===0) g.pendingEvent = 'due';
}

function drawMarket(g, kind){
  const d = kind==='tool' ? g.toolDeck : g.supDeck;
  if(!d.length) return {k:'vacio', n:'—', cost:{}, kind, d:'Mazo agotado.', vp:0};
  return {...d.shift(), kind};
}
Object.assign(FG.core, {resolveEvent, drawMarket});
