const {BONE, CHAR, CHAR_KEYS, SKILL_SLOT_VP} = FG.data;
const {has} = FG.core;
function finalScoring(g){
  const o = g.opts;
  const rows = g.players.map(p=>{
    const b = {durante:p.vp, lab:0, ranuras:0, habilidades:0, huesos:0, yeso:0, cartas:0, variedad:0, lotes:0, mayorias:0};
    p.lab.forEach(d=>{
      const need = d.bones.slice(); d.assigned.forEach(x=>{const i=need.indexOf(x); if(i>=0)need.splice(i,1);});
      need.slice().forEach(x=>{ if(p.storage[x]>0){ p.storage[x]--; d.assigned.push(x); } });
      const perfect = d.assigned.length===d.bones.length;
      b.lab += perfect ? d.perfect : d.assigned.reduce((a,x)=>a+BONE[x].val,0);
      p.scored.push(d);
    });
    p.lab = [];
    for(let s=p.skills.length; s<3; s++) b.ranuras += SKILL_SLOT_VP[s];
    const endVal = k => has(p,'diente5')&&k==='diente' ? 5 : has(p,'femur5')&&k==='femur' ? 5 : has(p,'costilla5')&&k==='costilla' ? 6 : BONE[k].end;
    Object.entries(p.storage).forEach(([k,n])=>{ b.huesos += n*endVal(k); });
    b.yeso = Math.floor(p.plaster/2);
    b.cartas = p.tools.reduce((a,t)=>a+(t.card.vp||0),0) + p.supplies.reduce((a,c)=>a+(c.vp||0),0);
    const counts = {}; CHAR_KEYS.forEach(k=>counts[k]=0);
    p.scored.forEach(d=>d.chars.forEach(c=>counts[c]++));
    if(o.lotes){
      if(CHAR_KEYS.every(k=>counts[k]>0)) b.variedad = 12;
      CHAR_KEYS.forEach(k=>{ if(counts[k]>=3) b.lotes += CHAR[k].set; });
    }
    return {p, b, counts};
  });
  if(o.mayorias) CHAR_KEYS.forEach(k=>{
    const m = Math.max(...rows.map(r=>r.counts[k]));
    if(m<=0) return;
    const w = rows.filter(r=>r.counts[k]===m);
    if(w.length===1) w[0].b.mayorias += 3;
  });
  rows.forEach(r=>{ r.total = Object.values(r.b).reduce((a,x)=>a+x,0); r.p.vp = r.total; });
  rows.sort((a,b)=> b.total-a.total || b.p.scored.length-a.p.scored.length);
  return rows.map(r=>({name:r.p.name, color:r.p.color, b:r.b, total:r.total, dinos:r.p.scored.length}));
}

const PASOS = [['durante','Durante la partida'],['lab','Dinosaurio en el laboratorio'],['ranuras','Ranuras de habilidad vacías'],
  ['habilidades','Bonos de habilidad'],['huesos','Huesos sobrantes'],['yeso','Yeso sobrante'],['cartas','Cartas de mercado'],
  ['variedad','Variedad de las nueve'],['lotes','Lotes de características'],['mayorias','Mayorías']];
Object.assign(FG.core, {finalScoring, PASOS});
