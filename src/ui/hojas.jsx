const {useState, useMemo, useEffect} = React;
const {BONE, MAT, CHAR, CHAR_KEYS, SKILL_SLOT_VP, TEX_URL} = FG.data;
const {has, bonePlaster, labCap, marketCap, totalBones, step, DIRS, ortho} = FG.core;
const {ERA_COL, eraDe, Silueta} = FG.ui;
const {Hoja, DinoCard, MarketCard, Btn, BtnEra, BtnEraSec, Peon, Frags} = FG.ui;
const {Bone, Hammer, Yeso, Ico, IcoDino, AvisoIco} = FG.ui;
const {chispasEn, flotanteEn, PALETA} = FG.fx;
const {Pausa} = FG.ui;
function Hojas({g,p,col,onRestart,hoja,setHoja,run,sel,setSel,canAfford}){
  const [ham,setHam] = useState(null);
  const [claim,setClaim] = useState(null);
  const cerrar = () => { setHam(null); setClaim(null); setHoja(null); };
  if(!hoja) return null;
  const hum = !p.isAI;

  if(hoja.k==='pit'){
    const items = g.pits[hoja.cell];
    if(ham!==null) return (
      <Hoja title="Elige una habilidad" sub="Devuelves el martillo y te enseñan un truco" onClose={cerrar}>
        <div className="grid gap-2">
          {g.skillRow.map((s,i)=>
            <button key={s.k} onClick={e=>{chispasEn(e.currentTarget,'habilidad'); flotanteEn(e.currentTarget, s.n, PALETA.habilidad[0]); setHam(null); run('extract',{cell:hoja.cell, item:'martillo', skillIndex:i});}}
              className="carta-fisica text-left rounded-xl p-3 hover:border-cinta transition-colors active:scale-[.99] border border-borde">
              <div className="disp font-bold text-[14px] flex items-center gap-1.5">{s.n}{s.agg && <span className="text-arcilla" title="Habilidad de enfrentamiento"><AvisoIco s={12}/></span>}</div>
              <div className="text-[11px] text-tenue leading-snug mt-0.5">{s.d}</div>
            </button>)}
        </div>
        <p className="text-[11px] text-tenue mt-3">Ocupas la ranura {p.skills.length+1}. Si la dejabas vacía valía {SKILL_SLOT_VP[p.skills.length]} PV.</p>
      </Hoja>);
    const uniq = [...new Set(items)];
    return (
      <Hoja title="Fosa abierta" sub={'Tienes '+p.plaster+' de yeso'} onClose={cerrar}>
        <div className="grid gap-2">
          {uniq.map(o=>{
            if(o==='martillo'){
              const cap = has(p,'martillo2')?2:1, dis = g.hammers>=cap || !g.skillRow.length;
              return <button key={o} disabled={dis} onClick={()=>setHam(0)}
                className="flex items-center gap-3 rounded-xl border border-borde p-3 disabled:opacity-30 hover:border-cinta transition-colors">
                <span className="w-9 h-9 rounded-lg bg-piedra/25 text-piedra flex items-center justify-center shrink-0"><Hammer s={20}/></span>
                <span className="flex-1 text-left"><span className="disp font-bold text-[14px] block">Martillo</span>
                  <span className="text-[11px] text-tenue">{dis?'ya cogiste uno este turno':'lo cambias por una habilidad'}</span></span>
                <span className="text-[12px] text-cinta shrink-0">0 yeso</span></button>;
            }
            const c = bonePlaster(p,o), dis = p.plaster<c, n = items.filter(x=>x===o).length;
            return <button key={o} disabled={dis} onClick={()=>run('extract',{cell:hoja.cell, item:o})}
              className="flex items-center gap-3 rounded-xl border border-borde p-3 disabled:opacity-30 hover:border-cinta transition-colors">
              <span className="w-9 h-9 rounded-lg bg-hueso/10 text-hueso flex items-center justify-center shrink-0"><Bone t={o} s={21}/></span>
              <span className="flex-1 text-left"><span className="disp font-bold text-[14px] block">{BONE[o].es}{n>1 && <span className="text-tenue font-normal"> ×{n}</span>}</span>
                <span className="text-[11px] text-tenue">{BONE[o].end} PV si te lo quedas</span></span>
              <span className={'text-[12px] shrink-0 '+(dis?'text-arcilla':'text-cinta')}>{c} yeso{c>1?'s':''}</span></button>;
          })}
        </div>
      </Hoja>);
  }

  if(hoja==='dinos'){
    const puedeYa = d => { if(!d) return false; const n={}; d.bones.forEach(b=>n[b]=(n[b]||0)+1);
      return Object.entries(n).every(([b,k])=>p.storage[b]>=k); };
    return (
      <Hoja title="Dinosaurios" sub="Laboratorio y expositor" onClose={cerrar} wide>
        {p.lab.map((d,i)=>{
          const need = d.bones.slice(); d.assigned.forEach(x=>{const k=need.indexOf(x); if(k>=0)need.splice(k,1);});
          const perfecto = need.length===0, parcial = d.assigned.reduce((a,x)=>a+BONE[x].val,0);
          return (
            <div key={i} className="mb-3">
              <p className="text-[11px] text-cinta mb-1">En tu laboratorio</p>
              <DinoCard d={d} compact>
                {[...new Set(need)].filter(b=>p.storage[b]>0).length>0 &&
                  <div className="flex flex-wrap justify-center gap-1.5">
                    {[...new Set(need)].filter(b=>p.storage[b]>0).map(b=>
                      <Btn key={b} on={()=>run('assign',{labIndex:i, bone:b})}>Montar {BONE[b].es.toLowerCase()}</Btn>)}
                  </div>}
                {perfecto
                  ? <BtnEra color={ERA_COL[eraDe(d)]} dis={!hum} on={()=>run('scoreLab',{labIndex:i})}>Donar al museo · {d.perfect} PV</BtnEra>
                  : <BtnEraSec color={ERA_COL[eraDe(d)]} dis={!hum||!d.assigned.length} on={()=>run('scoreLab',{labIndex:i})}>Donar incompleto · {parcial} PV</BtnEraSec>}
              </DinoCard>
            </div>);
        })}
        <p className="text-[11px] text-tenue mb-1.5 mt-1">Expositor</p>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {g.dinoRow.map((d,i)=>(
            <DinoCard key={i} d={d}>
              {d && <>
                {puedeYa(d) && hum &&
                  <BtnEra color={ERA_COL[eraDe(d)]} on={()=>run('scoreRow',{rowIndex:i})}>Esqueleto completo · {d.perfect} PV</BtnEra>}
                {hum && g.phase==='lab' && p.lab.length<labCap(p) && d.bones.some(b=>p.storage[b]>0) && (
                  claim===i
                    ? <div className="flex flex-wrap justify-center gap-1.5">
                        {[...new Set(d.bones)].filter(b=>p.storage[b]>0).map(b=>
                          <Btn key={b} tone="p" on={()=>{setClaim(null); run('claim',{rowIndex:i, bone:b});}}>Con {BONE[b].es.toLowerCase()}</Btn>)}
                      </div>
                    : <BtnEraSec color={ERA_COL[eraDe(d)]} on={()=>setClaim(i)}>Llevar al laboratorio</BtnEraSec>)}
                {g.phase!=='lab' && !puedeYa(d) &&
                  <p className="text-[11px] text-tenue">Se reclama en el paso de laboratorio.</p>}
              </>}
            </DinoCard>))}
        </div>
      </Hoja>);
  }

  if(hoja==='mercado') return (
    <Hoja title="Mercado" sub={g.bought>=marketCap(p) ? 'Ya has comprado este turno' : (marketCap(p)>1?'Puedes comprar hasta '+marketCap(p)+' cartas':'Una carta por turno')} onClose={cerrar}>
      <div className="grid gap-2.5">
        {g.market.map((c,i)=><MarketCard key={i} c={c}
          canBuy={hum && g.phase!=='lab' && g.bought<marketCap(p) && c.k!=='vacio' && canAfford(c)}
          on={()=>run('buy',{marketIndex:i})}/>)}
      </div>
      <div className="mt-4 rounded-xl border border-borde p-3">
        <h4 className="disp font-bold text-[13px] mb-2">Tus losetas</h4>
        {p.tiles.length===0
          ? <p className="text-[12px] text-tenue">Todavía no has tirado ninguna loseta fuera del yacimiento. Empuja hacia el borde para reclamarlas.</p>
          : <div className="flex flex-wrap gap-1.5">{p.tiles.map(t=>
              <span key={t.id} className="relative tile h1 px-2.5 py-1.5" style={{background:MAT[t.mat].bg,color:MAT[t.mat].fg}}>
                <svg className="absolute inset-0 w-full h-full"><rect width="100%" height="100%" fill={TEX_URL[t.mat]}/>
                  <rect width="100%" height="100%" fill="url(#grBrillo)"/></svg>
                <span className="relative"><Frags t={t} s={13}/></span></span>)}</div>}
      </div>
    </Hoja>);

  if(hoja==='equipo'){
    if(sel && sel.m==='tool' && sel.step==='tile') return (
      <Hoja title="Linterna" sub={'Te quedan '+sel.left+' losetas por devolver'} onClose={cerrar}>
        <div className="flex flex-wrap gap-2">
          {g.discard.map(t=>
            <button key={t.id} onClick={()=>{setHoja(null); setSel({...sel, step:'cell', tileId:t.id});}}
              className="relative tile h1 px-3 py-2" style={{background:MAT[t.mat].bg,color:MAT[t.mat].fg}}>
              <svg className="absolute inset-0 w-full h-full"><rect width="100%" height="100%" fill={TEX_URL[t.mat]}/>
                <rect width="100%" height="100%" fill="url(#grBrillo)"/></svg>
              <span className="relative"><Frags t={t} s={13}/></span></button>)}
        </div>
      </Hoja>);
    return (
      <Hoja title="Tu equipo" sub={p.name} onClose={cerrar}>
        <h4 className="disp font-bold text-[13px] mb-2">Almacén</h4>
        <div className="grid grid-cols-5 gap-1.5">
          {Object.keys(BONE).map(b=>
            <div key={b} className={'rounded-lg border-[1.5px] p-2 text-center '+(p.storage[b]?'border-hueso/35 text-hueso':'border-borde text-tenue')}
              style={p.storage[b]?{background:'rgb(var(--tinta) / .05)'}:undefined}>
              <Bone t={b} s={20}/>
              <div className="disp font-extrabold text-[15px] leading-none mt-1">{p.storage[b]}</div>
              <div className="text-[9px] leading-none mt-0.5 opacity-70">{BONE[b].es}</div>
            </div>)}
        </div>
        <p className="text-[11px] text-tenue mt-2 flex items-center gap-1.5"><Yeso s={13}/> {p.plaster} de yeso · valen {Math.floor(p.plaster/2)} PV al final</p>

        <h4 className="disp font-bold text-[13px] mt-4 mb-2">Herramientas</h4>
        {p.tools.length===0
          ? <p className="text-[12px] text-tenue">Ninguna. Se compran en el mercado con fragmentos y no gastan energía al usarlas.</p>
          : <div className="grid gap-2">{p.tools.map((s,i)=>(
              <div key={i} className={'carta-fisica flex items-center gap-3 rounded-xl p-3 '+(s.used?'opacity-45':'')}
                style={{border:'1.5px solid '+(s.used?'rgb(var(--tenue) / .5)':'rgb(var(--tinta) / .3)')}}>
                <span className="w-9 h-9 rounded-lg bg-piedra/25 text-piedra flex items-center justify-center shrink-0"><Hammer s={19}/></span>
                <div className="min-w-0 flex-1">
                  <div className="disp font-bold text-[14px]">{s.card.n} {s.card.vp>0 && <span className="text-tenue font-normal text-[11px]">{s.card.vp} PV</span>}</div>
                  <div className="text-[11px] text-tenue leading-snug">{s.card.d}</div>
                </div>
                <Btn dis={s.used||!hum||g.phase!=='actions'} tone="p"
                  on={()=>{ const e=s.card.eff;
                    if(e.t==='energy') return run('tool',{toolIndex:i});
                    if(e.t==='lantern') return setSel({m:'tool', ti:i, step:'tile', left:e.n});
                    setSel({m:'tool', ti:i}); setHoja(null); }}>{s.used?'Usada':'Usar'}</Btn>
              </div>))}</div>}

        <h4 className="disp font-bold text-[13px] mt-4 mb-2">Habilidades</h4>
        <div className="grid gap-2">
          {[0,1,2].map(i=> p.skills[i]
            ? <div key={i} className="carta-fisica rounded-xl p-3">
                <div className="disp font-bold text-[14px]">{p.skills[i].n}</div>
                <div className="text-[11px] text-tenue leading-snug mt-0.5">{p.skills[i].d}</div></div>
            : <div key={i} className="rounded-xl border border-dashed border-borde p-3 text-[12px] text-tenue">
                Ranura libre{SKILL_SLOT_VP[i]>0 && ' · vale '+SKILL_SLOT_VP[i]+' PV si no la ocupas'}</div>)}
        </div>
        {has(p,'empujar') && <Btn cls="mt-2 w-full" dis={g.usedSkill.empujar||!hum}
          on={()=>{ const t=g.players.find(q=>q!==p && q.pos!==null && p.pos!==null && ortho(p.pos).includes(q.pos));
            if(t) run('skillPush',{targetId:t.id, dir:Object.keys(DIRS).find(k=>step(p.pos,k)===t.pos)}); }}>
          Dar un codazo al vecino</Btn>}

        <h4 className="disp font-bold text-[13px] mt-4 mb-2">Colección · {p.scored.length}</h4>
        <div className="flex flex-wrap gap-1.5">
          {p.scored.length===0 && <span className="text-[12px] text-tenue">Sin dinosaurios puntuados todavía.</span>}
          {p.scored.map((d,i)=>
            <span key={i} className="flex items-center gap-1.5 text-[11px] px-2 py-1 rounded-lg"
              style={{color:'rgb(var(--tinta))', background:ERA_COL[eraDe(d)]+'14', border:'1.5px solid '+ERA_COL[eraDe(d)]+'66'}}>
              <Silueta d={d} s={16}/>{d.name}</span>)}
        </div>
      </Hoja>);
  }

  if(hoja==='marcador'){
    const cuenta = q => { const c={}; CHAR_KEYS.forEach(k=>c[k]=0); q.scored.forEach(d=>d.chars.forEach(x=>c[x]++)); return c; };
    return (
      <Hoja title="Marcador" sub="Los lotes de 3 o más puntúan al final" onClose={cerrar}>
        <div className="grid gap-2">
          {g.players.slice().sort((a,b)=>b.vp-a.vp).map(q=>{
            const c = cuenta(q);
            return (
              <div key={q.id} className="carta-fisica rounded-xl p-3"
                style={{border:'1.5px solid '+(q.id===p.id?col:'rgb(var(--tinta) / .25)')}}>
                <div className="flex items-center gap-2">
                  <Peon color={q.color} letra={q.name[0].toUpperCase()} s={22}/>
                  <span className="disp font-bold text-[14px] flex-1">{q.name}</span>
                  <span className="disp font-extrabold text-xl text-cinta">{q.vp}</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {CHAR_KEYS.filter(k=>c[k]>0).map(k=>
                    <span key={k} className={'text-[10px] px-1.5 py-0.5 rounded '+(c[k]>=3?'bg-cinta sobre-acento font-medium':'bg-borde text-esquisto/80')}>
                      {CHAR[k].es} {c[k]}</span>)}
                  {q.scored.length===0 && <span className="text-[11px] text-tenue">Sin colección</span>}
                </div>
                <p className="text-[11px] text-tenue mt-1.5">{q.plaster} yeso · {totalBones(q)} huesos · {q.tiles.length} losetas · {q.skills.length} habilidades</p>
              </div>);
          })}
        </div>
      </Hoja>);
  }

  if(hoja==='pausa') return <Pausa onClose={cerrar} verLog={()=>setHoja('log')} onRestart={onRestart}/>;

  if(hoja==='log') return (
    <Hoja title="Registro" sub="Lo que ha pasado, de lo último a lo primero" onClose={cerrar}>
      <div className="space-y-1.5">
        {g.log.slice().reverse().map((l,i)=>
          <p key={i} className={'text-[12px] leading-snug '+(l.t.startsWith('EVENTO')?'text-arcilla font-medium':l.t.startsWith('—')?'text-cinta':'text-tenue')}>{l.t}</p>)}
      </div>
    </Hoja>);
  return null;
}
Object.assign(FG.ui, {Hojas});
