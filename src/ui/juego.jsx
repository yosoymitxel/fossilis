const {useState, useMemo, useRef, useEffect, useLayoutEffect} = React;
const {MAT, BONE} = FG.data;
const {cur, has, digCost, digTargets, extractTargets, moveTargets, sandTargets, climbTargets, planDig, pasoHacia, marketCap, startEnergy, act, aiStep, totalBones, solvePayment, DIRS, reach} = FG.core;
const {ERA_COL, eraDe} = FG.ui;
const {Peon, Cell, Hoja, Btn, BtnJ, Banda, TEX, Ico, Ic, IcoDino, Yeso, Rayo, ICONO} = FG.ui;
const {Hojas, Final, Pausa} = FG.ui;
const {son, chispasEn, flotanteEn, Sacudida, Destello, Chispas, PERFIL, PALETA, MAT_PAL, GESTO, SUAVE, quieto, useTema, salaDe} = FG.fx;
const PISTAS = [
  {k:'inicio',  cond:g=>true,
   t:'Cavar empuja una loseta y todo lo que tenga detrás. Gastas energía arriba a la derecha.'},
  {k:'fosa',    cond:g=>g.cells.some(s=>s.length===0),
   t:'Donde ya no queda loseta hay fosa. Ponte al lado, extrae, y paga con yeso.'},
  {k:'reclama', cond:(g,p)=>p.tiles.length>0,
   t:'Las losetas que empujas fuera del tablero son tuyas: sus fragmentos pagan las cartas del mercado.'},
  {k:'huesos',  cond:(g,p)=>totalBones(p)>=2,
   t:'Con los huesos que pide una carta puedes llevártela al laboratorio, o puntuarla entera de golpe.'},
  {k:'deposito',cond:g=>g.pool===0,
   t:'Al vaciarse el depósito salta un evento y se rellena. Cuatro vaciados y la partida termina.'},
  {k:'fuera',   cond:(g,p)=>g.players.some(q=>q.pos===null),
   t:'Quien cae a una fosa o fuera del borde queda apartado y gasta 1 de energía en volver.'},
];

function Game({g, setG, onRestart}){
  const [tema] = useTema();
  const [sel,setSel] = useState(null);
  const [hoja,setHoja] = useState(null);
  const [toast,setToast] = useState(null);
  const [evt,setEvt] = useState(null);
  const p = cur(g);
  const guard = useRef(0);
  const lastLog = useRef(g.log.length);
  const lastEvt = useRef(g.lastEvent ? g.lastEvent.id : 0);
  const tablero = useRef(null);
  const marcador = useRef(null);
  const lastTurn = useRef(g.turn);
  const lastVP = useRef({});
  const cajas = useRef(new Map());
  const montado = useRef(false);
  const vuelo = useRef(new Map());
  const [banda,setBanda] = useState(null);
  const [vistas,setVistas] = useState([]);
  const col = p.color;
  const suave = SUAVE;

  const enCasilla = (i, k, extra) => {
    const el = tablero.current && tablero.current.querySelector('[data-cell="'+i+'"]');
    chispasEn(el, k, extra);
  };
  const sitio = el => {
    let x=0, y=0, n=el;
    while(n && n!==tablero.current){ x+=n.offsetLeft; y+=n.offsetTop; n=n.offsetParent; }
    return {x,y};
  };
  useLayoutEffect(()=>{
    const cont = tablero.current; if(!cont) return;
    const vistos = new Set();
    cont.querySelectorAll('[data-tile],[data-peon]').forEach(el=>{
      const k = el.dataset.tile ? 't'+el.dataset.tile : 'p'+el.dataset.peon;
      vistos.add(k);
      const s = sitio(el);
      const ant = cajas.current.get(k);
      cajas.current.set(k, s);
      if(suave || !el.animate) return;
      if(ant){
        const dx = ant.x-s.x, dy = ant.y-s.y;
        if(Math.abs(dx)<1 && Math.abs(dy)<1) return;
        const previa = vuelo.current.get(k); if(previa) previa.cancel();
        const a = el.animate(
          [{transform:'translate('+dx+'px,'+dy+'px)'}, {transform:'translate(0,0)'}],
          {duration:420, easing:'cubic-bezier(.22,1.15,.34,1)', composite:'add'});
        vuelo.current.set(k,a);
        a.finished.then(()=>{ if(vuelo.current.get(k)===a) vuelo.current.delete(k); }, ()=>{});
      } else if(montado.current){
        el.animate([{transform:'scale(.45)',opacity:0},{transform:'scale(1)',opacity:1}],
          {duration:340, easing:'cubic-bezier(.22,1.3,.36,1)', composite:'add'});
      }
    });
    for(const k of [...cajas.current.keys()]) if(!vistos.has(k)){ cajas.current.delete(k); vuelo.current.delete(k); }
    montado.current = true;
  });

  useEffect(()=>{
    if(!g.fx || !tablero.current) return;
    if(g.fx.k==='dig'){
      son(g.fx.caidas.some(c=>c.mat==='stone') ? 'piedra' : 'cavar');
      g.fx.caidas.forEach(c=>{
        enCasilla(c.i, 'cavar', {col:PALETA[MAT_PAL[c.mat]] || PALETA.caida});
        Sacudida(tablero.current, c.mat==='stone' ? 7 : c.mat==='clay' ? 4 : 2);
        const el = tablero.current.querySelector('[data-cell="'+c.i+'"]');
        flotanteEn(el, '+ '+MAT[c.mat].es, PALETA[MAT_PAL[c.mat]][0]);
      });
    }
    if(g.fx.k==='extract'){
      const el = tablero.current.querySelector('[data-cell="'+g.fx.cell+'"] .capa');
      const casilla = tablero.current.querySelector('[data-cell="'+g.fx.cell+'"]');
      if(el && el.animate && !suave)
        el.animate([{transform:'scale(1)'},{transform:'scale(1.22)'},{transform:'scale(1)'}],
          {duration:460, easing:'cubic-bezier(.3,1.4,.4,1)'});
      if(g.fx.item==='martillo'){
        son('martillo');
        enCasilla(g.fx.cell, 'martillo');
        flotanteEn(casilla, 'Martillo', PALETA.martillo[0]);
      } else {
        const v = BONE[g.fx.item].val, raro = v>=6;
        son(raro ? 'raro' : 'extraer');
        enCasilla(g.fx.cell, 'extraer', {n: 16 + v*3, vel: 3.4 + v*0.22});
        flotanteEn(casilla, BONE[g.fx.item].es+' '+v, PALETA.hueso[raro?2:0], raro);
        if(raro) Destello(tablero.current, PALETA.hueso[2]);
      }
    }
  },[g.fxId]);

  useEffect(()=>{
    if(g.turn===lastTurn.current) return;
    lastTurn.current = g.turn;
    son('turno');
    setBanda({texto:'Turno de '+cur(g).name, color:cur(g).color, id:Date.now()});
    const t = setTimeout(()=>setBanda(null), 1700);
    return ()=>clearTimeout(t);
  },[g.turn]);

  useEffect(()=>{
    g.players.forEach(q=>{
      const antes = lastVP.current[q.id];
      const d = antes===undefined ? 0 : q.vp-antes;
      if(d>0){
        if(q.id===g.turn || d>=8)
          flotanteEn(marcador.current, '+'+d+' PV', q.color, d>=8);
        if(d>=12){
          const ult = q.scored[q.scored.length-1];
          const cE = ult ? ERA_COL[eraDe(ult)] : '#A97F3C';
          const pal = [cE,'#F4EFE4','#CFE0E8'];
          son('esqueleto');
          Chispas(window.innerWidth/2, window.innerHeight*0.40,
            Object.assign({}, PERFIL.esqueleto, {col:pal.concat(q.color)}));
          Destello(tablero.current, cE);
          setBanda({texto: ult ? ult.name+' al museo' : 'Esqueleto completo',
                    color: cE, id: Date.now()});
        }
      }
      lastVP.current[q.id]=q.vp;
    });
  },[g]);

  const SON_ACC = {move:'mover', sand:'arena', climb:'subir', plaster:'yeso',
                   buy:'compra', skillPlaster:'yeso', skillPush:'mover'};
  const run = (t, pl={}) => {
    if(SON_ACC[t]) son(SON_ACC[t]);
    setG(x=>act(x,t,pl)); setSel(null); setHoja(null);
  };

  useEffect(()=>{
    if(g.log.length>lastLog.current){
      const t = g.log[g.log.length-1].t;
      lastLog.current = g.log.length;
      if(!t.startsWith('—')) setToast({t, id:g.log.length});
    }
    const id = g.lastEvent ? g.lastEvent.id : 0;
    if(id>lastEvt.current){
      lastEvt.current = id; setEvt(g.lastEvent);
      Chispas(window.innerWidth/2, window.innerHeight*0.24, PERFIL.evento);
      son('evento');
      Destello(tablero.current, PALETA.evento[0]);
      Sacudida(tablero.current, 6);
    }
  },[g]);
  useEffect(()=>{ if(!toast) return; const i=setTimeout(()=>setToast(null),2400); return ()=>clearTimeout(i); },[toast]);

  useEffect(()=>{
    if(g.over || !cur(g).isAI) { guard.current=0; return; }
    const id = setTimeout(()=>{
      guard.current++;
      const s = guard.current>70 ? {t:'endTurn'} : aiStep(g);
      setG(x=>act(x, s.t, s));
      if(s.t==='endTurn') guard.current=0;
    }, 430);
    return ()=>clearTimeout(id);
  }, [g]);

  if(g.over) return <Final g={g} onRestart={onRestart}/>;

  const canAfford = c => !!solvePayment(p.tiles, c.cost);
  const digs  = digTargets(g,p).filter(i=>digCost(p, g.cells[i][g.cells[i].length-1].mat) <= g.energy);
  const exts  = extractTargets(g,p);
  const mvs   = moveTargets(g,p);
  const sands = sandTargets(g,p);
  const climbs= climbTargets(g,p);
  const tool  = sel && sel.m==='tool' ? p.tools[sel.ti].card : null;
  const hum   = !p.isAI;
  const pista = hum ? PISTAS.find(x=>vistas.indexOf(x.k)<0 && x.cond(g,p)) : null;

  let hi = new Set();
  if(sel && hum){
    if(sel.m==='move') hi = new Set(mvs);
    if(sel.m==='climb') hi = new Set(climbs);
    if(sel.m==='sand') hi = new Set(sands);
    if(sel.m==='extract') hi = new Set(exts);
    if(sel.m==='dig') hi = new Set(sel.from!==undefined?[sel.from]:digs);
    if(sel.m==='tool'){
      const e = tool.eff;
      if(e.t==='slide') hi = new Set(sel.from!==undefined?[sel.from]:[...Array(25).keys()].filter(i=>g.cells[i].length&&g.cells[i][g.cells[i].length-1].mat===e.mat));
      if(e.t==='remove') hi = new Set([...Array(25).keys()].filter(i=>g.cells[i].length&&g.cells[i][g.cells[i].length-1].mat===e.mat));
      if(e.t==='removeTop') hi = new Set([...Array(25).keys()].filter(i=>g.cells[i].length>0));
      if(e.t==='move') hi = new Set(reach(g,p,e.n));
      if(e.t==='lantern' && sel.step==='cell') hi = new Set([...Array(25).keys()].filter(i=>g.cells[i].length<2));
    }
  }
  const arrowsFor = from => Object.fromEntries(Object.keys(DIRS).map(d=>[d, planDig(g,from,d).ok]));

  useEffect(()=>{
    const k = e => {
      if(e.key==='Escape' && sel) return setSel(null);
      if(!sel || sel.m!=='dig' || sel.from===undefined) return;
      const d = {ArrowUp:'N', ArrowDown:'S', ArrowLeft:'O', ArrowRight:'E'}[e.key];
      if(d && planDig(g, sel.from, d).ok){ e.preventDefault(); run('dig',{from:sel.from, dir:d}); }
    };
    window.addEventListener('keydown',k);
    return ()=>window.removeEventListener('keydown',k);
  },[sel,g]);

  const onCell = i => {
    if(!hum || !sel) return;
    if(sel.m==='move' && hi.has(i)) return run('move',{to:i});
    if(sel.m==='climb' && hi.has(i)) return run('climb',{to:i});
    if(sel.m==='sand' && hi.has(i)) return run('sand',{to:i});
    if(sel.m==='extract' && hi.has(i)) return setHoja({k:'pit', cell:i});
    if(sel.m==='dig'){
      if(sel.from===i) return setSel({m:'dig'});
      if(sel.from!==undefined){
        const d = pasoHacia(sel.from, i);
        if(d && planDig(g, sel.from, d).ok) return run('dig',{from:sel.from, dir:d});
      }
      if(digs.includes(i)) return setSel({m:'dig', from:i});
    }
    if(sel.m==='tool'){
      const e = tool.eff;
      if(e.t==='move' && hi.has(i)) return run('tool',{toolIndex:sel.ti, to:i});
      if((e.t==='remove'||e.t==='removeTop') && hi.has(i)) return run('tool',{toolIndex:sel.ti, from:i});
      if(e.t==='slide'){ if(sel.from===i) return setSel({...sel, from:undefined}); if(hi.has(i)) return setSel({...sel, from:i}); }
      if(e.t==='lantern' && sel.step==='cell' && hi.has(i)){
        const last = sel.left<=1;
        setG(x=>act(x,'tool',{toolIndex:sel.ti, tileId:sel.tileId, to:i, last}));
        return last ? setSel(null) : setSel({m:'tool', ti:sel.ti, step:'tile', left:sel.left-1});
      }
    }
  };

  const A = ({k, t, on, dis, cost, active}) => {
    const ico = useRef(null);
    const gesto = () => {
      if(!ico.current || !ico.current.animate || dis || suave) return;
      ico.current.animate((GESTO[k] || GESTO.pausa).map(tr=>({transform:tr})),
        {duration:520, easing:'cubic-bezier(.3,.9,.3,1)'});
    };
    const pulsar = e => {
      gesto();
      chispasEn(e.currentTarget, k, (k==='mover'||k==='subir') ? {col:['#CFE0E8','#F4EFE4']} : null);
      if(k==='yeso') flotanteEn(e.currentTarget, '+1 yeso', PALETA.yeso[2]);
      on();
    };
    return (
      <button onClick={pulsar} onMouseEnter={gesto} onFocus={gesto} disabled={dis}
        className="btn-fisico flex flex-col items-center justify-center gap-0.5 py-2 lg:py-2.5 rounded-xl text-[11px] lg:text-[12px] font-medium leading-tight transition-[transform,color,background-color,border-color,opacity,filter,box-shadow] active:scale-95 disabled:opacity-25 disabled:active:scale-100 bg-sedimento border hover:brightness-110 min-h-[62px] lg:min-h-[68px]"
        style={active ? {background:'rgb(var(--acento) / .16)', borderColor:'rgb(var(--acento) / .55)', color:'rgb(var(--tinta))'} : {borderColor:'rgb(var(--borde))'}}>
        <span ref={ico} className="block">{k==='yeso' ? <Yeso s={18}/> : <Ico k={k} s={18}/>}</span>
        <span className="leading-none">{t}</span>
        <span className={'leading-none text-[10px] inline-flex items-center '+(active?'opacity-75':'text-tenue')}>{cost===0?'gratis':<>{cost}<Rayo s={9}/></>}</span>
      </button>
    );
  };

  const TabBtn = ({id, label, badge, icon, full}) => {
    const iconEl = icon
      ? (ICONO[icon] ? <Ic k={icon} s={16}/> : <Ico k={icon} s={16}/>)
      : null;
    return (
      <button onClick={()=>setHoja(id)} aria-label={label} title={label}
        className={'relative flex flex-col items-center justify-center gap-1 py-1.5 min-h-[44px] px-1.5 text-[11px] text-tenue hover:text-hueso transition-colors rounded-lg hover:bg-borde/30 '+(full?'flex-1':'w-full')}>
        {iconEl}
        <span className="truncate leading-none">{label}</span>
        {badge>0 && <span className="absolute top-0.5 right-0.5 min-w-[15px] h-[15px] px-1 rounded-full text-[9px] font-bold leading-[15px] bg-cinta sobre-acento">{badge}</span>}
      </button>
    );
  };

  const puedePuntuar = g.dinoRow.filter(d=>{ if(!d) return false; const n={}; d.bones.forEach(b=>n[b]=(n[b]||0)+1);
    return Object.entries(n).every(([b,k])=>p.storage[b]>=k); }).length
    + p.lab.filter(d=>d.assigned.length===d.bones.length).length;

  const avisos = (
    <>
      {g.players.some(q=>q.pos===null) && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-arcilla/50 bg-arcilla/10 px-2.5 py-2">
          <span className="text-[11px] text-arcilla shrink-0">Fuera del yacimiento</span>
          {g.players.filter(q=>q.pos===null).map(q=>(
            <span key={q.id} className="flex items-center gap-1.5 text-[11px]">
              <Peon color={q.color} letra={q.name[0].toUpperCase()} s={20} activo={q.id===g.turn}/>
              <span className="text-hueso/85">{q.name}</span>
              <span className="text-tenue">lado {({N:'norte',S:'sur',E:'este',O:'oeste'})[q.fell]}</span>
            </span>))}
          {hum && p.pos===null && <BtnJ cls="ml-auto !py-1.5 !px-3 text-[12px]"
            dis={g.energy<1||!climbs.length} on={()=>setSel({m:'climb'})}>Volver al tajo · 1<Rayo s={10}/></BtnJ>}
        </div>)}
      {hum && pista && (
        <div className="flex items-start gap-2.5 rounded-xl p-2.5 border-[1.5px] border-cinta/40 bg-cinta/10">
          <span className="mt-0.5 shrink-0 text-cinta"><Ico k="pista" s={17}/></span>
          <p className="text-[12px] leading-snug flex-1 text-hueso/90">{pista.t}</p>
          <button onClick={()=>setVistas(v=>[...v, pista.k])}
            className="shrink-0 text-[11px] px-2 py-1 rounded-lg font-medium bg-cinta sobre-acento">Vale</button>
        </div>)}
    </>
  );

  const acciones = hum && g.phase==='actions' && (
    <>
      <div className="grid grid-cols-4 lg:grid-cols-2 gap-1.5 lg:gap-2">
        <A k="yeso" t="Yeso" cost={1} dis={g.energy<1||(g.pool===0&&g.reserve===0)} on={()=>run('plaster')}/>
        <A k="mover" t="Mover" cost={1} dis={g.energy<1||!mvs.length} active={sel&&sel.m==='move'} on={()=>setSel(sel&&sel.m==='move'?null:{m:'move'})}/>
        <A k="cavar" t="Cavar" cost={1} dis={!digs.length} active={sel&&sel.m==='dig'} on={()=>setSel(sel&&sel.m==='dig'?null:{m:'dig'})}/>
        <A k="extraer" t="Extraer" cost={1} dis={g.energy<1||!exts.length} active={sel&&sel.m==='extract'} on={()=>setSel(sel&&sel.m==='extract'?null:{m:'extract'})}/>
        <A k="arena" t="Arena" cost={has(p,'arenaFree')?0:1} dis={!sands.length||g.energy<(has(p,'arenaFree')?0:1)} active={sel&&sel.m==='sand'} on={()=>setSel(sel&&sel.m==='sand'?null:{m:'sand'})}/>
        {p.pos===null && <A k="subir" t="Subir" cost={1} dis={g.energy<1||!climbs.length} active={sel&&sel.m==='climb'} on={()=>setSel({m:'climb'})}/>}
        {has(p,'yeso2') && <A k="yeso" t="Mezcla" cost={1} dis={g.energy<1||g.usedSkill.yeso2} on={()=>run('skillPlaster')}/>}
      </div>
      <BtnJ cls="mt-2 w-full" on={()=>run('phase',{to:'market'})}>
        <Ico k="mercado" s={16}/> Pasar al mercado
      </BtnJ>
    </>
  );
  const faseMercado = hum && g.phase==='market' && (
    <div className="flex gap-2">
      <Btn cls="flex-1 py-3" on={()=>setHoja('mercado')}><Ico k="mercado" s={16}/> Ver el mercado</Btn>
      <BtnJ cls="flex-1" on={()=>run('phase',{to:'lab'})}>
        <Ico k="turno" s={15}/> {g.bought?'Seguir':'No comprar'}
      </BtnJ>
    </div>
  );
  const faseLab = hum && g.phase==='lab' && (
    <div className="flex gap-2">
      <Btn cls="flex-1 py-3" on={()=>setHoja('dinos')}><IcoDino s={17}/> Ver dinosaurios</Btn>
      <BtnJ cls="flex-1" on={()=>run('endTurn')}>
        <Ico k="turno" s={15}/> Terminar turno
      </BtnJ>
    </div>
  );

  return (
    <div data-sala={salaDe('vitrina', tema)} className="min-h-[100svh] lg:h-[100svh] lg:overflow-hidden flex flex-col pb-20 lg:pb-0">
      <TEX/>
      <header className="shrink-0 z-30"
        style={{background:'rgb(var(--fondo) / .94)', borderBottom:'2px solid rgb(var(--acento) / .28)',
                boxShadow:'0 4px 0 rgba(0,0,0,.35), 0 12px 22px -10px rgba(0,0,0,.7)'}}>
        <div className="max-w-[1200px] mx-auto px-3 lg:px-5 py-2">
          <div className="flex items-center gap-2.5">
            <Peon color={p.color} letra={p.name[0].toUpperCase()} s={30} activo/>
            <div className="min-w-0 flex-1">
              <div className="disp font-bold text-[14px] leading-none truncate">{p.name}
                {p.isAI && <span className="text-tenue font-normal text-[12px]"> · excavando</span>}</div>
              <div className="text-[12px] text-tenue leading-none mt-1">
                {g.phase==='actions'?'acciones':g.phase==='market'?'mercado':'laboratorio'}
                {g.remaining!==undefined && ' · quedan '+g.remaining+' turnos'}</div>
            </div>
            <div className="flex gap-[3px] items-center" title={'Energía: '+g.energy}>
              {g.energy===0 && g.phase==='actions'
                ? <span className="text-[10px] text-arcilla font-medium px-1.5 py-0.5 rounded bg-arcilla/15 border border-arcilla/40">sin energía</span>
                : <>
                  {Array.from({length:Math.max(g.energy,0)},(_,k)=><span key={k} className="w-[7px] h-4 rounded-sm"
                    style={{background:'rgb(var(--acento))', boxShadow:'inset 0 1px 0 rgba(255,255,255,.4), 0 2px 0 rgba(0,0,0,.4)'}}/>)}
                  {Array.from({length:Math.max(startEnergy(p)-g.energy,0)},(_,k)=><span key={k} className="w-[7px] h-4 rounded-sm bg-borde"/>)}
                </>}
            </div>
            <div ref={marcador} className="text-right shrink-0 w-10">
              <div className="disp font-extrabold text-lg leading-none text-hueso">{p.vp}</div>
              <div className="text-[10px] text-tenue leading-none">PV</div>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[11px] text-tenue shrink-0">Depósito {g.poolIndex}/4</span>
            <div className="flex gap-[2px] flex-1 h-2.5 items-stretch">
              {Array.from({length:Math.max(g.pool,0)},(_,k)=><span key={k} className="flex-1 max-w-[10px] bg-hueso rounded-[2px]"
                style={{boxShadow:'inset 0 1px 0 rgba(255,255,255,.5), 0 1px 0 rgba(0,0,0,.4)'}}/>)}
              {g.pool===0 && <span className="text-[11px] text-arcilla self-center">vacío · evento inminente</span>}
              {g.pool>0 && g.pool<=2 && <span className="text-[11px] text-cinta self-center">quedan {g.pool}</span>}
            </div>
            <span className="text-[11px] text-tenue shrink-0 flex items-center gap-1"><Yeso s={12}/><b className="text-hueso">{p.plaster}</b></span>
          </div>
        </div>
      </header>

      <div className="lg:flex-1 lg:min-h-0 lg:overflow-hidden">
        <div className="h-full max-w-[1200px] mx-auto px-3 lg:px-5 lg:grid lg:grid-cols-[minmax(0,1fr)_368px] lg:gap-6 lg:pt-3 lg:items-start">
          <main className="min-w-0 lg:min-h-0">
            <div ref={tablero} className="escena relative mt-3 lg:mt-0 p-2 lg:p-3 rounded-2xl transition-colors lg:max-w-[calc(100svh-260px)] lg:mx-auto lg:w-full"
              style={{background:'radial-gradient(ellipse at 50% 20%, rgb(var(--superficie)) 0%, rgb(var(--fondo)) 72%)'}}>{/* taste-skill-ignore: charco de luz bajo la vitrina */}
              <div className="marco-yacimiento">
                <div className="haz" aria-hidden="true"/>
                <div className="rejilla-3d grid grid-cols-5 gap-1.5 lg:gap-2.5 select-none relative">
                  {[...Array(25).keys()].map(i=>
                    <Cell key={i} g={g} i={i} hi={hi.has(i)}
                      dim={!!sel && hum && hi.size>0 && !hi.has(i)}
                      onClick={sel && hum ? ()=>onCell(i) : undefined}
                      arrows={sel && (sel.m==='dig'||(sel.m==='tool'&&tool&&tool.eff.t==='slide')) && sel.from===i ? arrowsFor(i) : null}
                      onArrow={d=> sel.m==='dig' ? run('dig',{from:i, dir:d}) : run('tool',{toolIndex:sel.ti, from:i, dir:d})}/>)}
                </div>
              </div>
            </div>

            <p className="mt-2.5 lg:mt-3 text-[13px] text-hueso/80 min-h-[18px] lg:max-w-[calc(100svh-260px)] lg:mx-auto lg:w-full">
              {sel && sel.m==='dig' && (sel.from===undefined ? 'Elige la loseta que vas a empujar.' : 'Elige hacia dónde la empujas.')}
              {sel && sel.m==='move' && 'Elige dónde plantarte.'}
              {sel && sel.m==='extract' && 'Elige una fosa abierta a tu lado.'}
              {sel && sel.m==='sand' && 'Elige dónde poner la arena.'}
              {sel && sel.m==='climb' && 'Vuelves por el lado por el que caíste.'}
              {sel && sel.m==='tool' && (tool.eff.t==='lantern' && sel.step==='tile' ? 'Elige una loseta del descarte.' : 'Usando '+tool.n+'.')}
              {!sel && hum && g.phase==='actions' && (g.energy>0 ? 'Te quedan '+g.energy+' de energía.' : 'Sin energía. Pasa al mercado.')}
              {!sel && hum && g.phase==='market' && ('Puedes comprar '+(marketCap(p)>1?'hasta '+marketCap(p)+' cartas':'una carta')+' con tus fragmentos.')}
              {!sel && hum && g.phase==='lab' && 'Puedes llevarte un dinosaurio al laboratorio.'}
              {p.isAI && 'El bot está resolviendo su turno.'}
            </p>

            <div className="hidden lg:block mt-2 space-y-2 min-h-[60px] lg:max-w-[calc(100svh-260px)] lg:mx-auto lg:w-full">{avisos}</div>
          </main>

          <aside className="lg:h-full lg:overflow-y-auto lg:min-h-0 lg:pr-1 mt-3 lg:mt-0">
            <div className="hidden lg:flex gap-0.5 mb-3 rounded-xl border border-borde/70 bg-sedimento/40 p-1">
              <TabBtn id="dinos" label="Dinos" badge={puedePuntuar} icon="teropodo"/>
              <TabBtn id="mercado" label="Mercado" icon="mercado"/>
              <TabBtn id="equipo" label="Equipo" badge={p.tools.filter(t=>!t.used).length} icon="equipo"/>
              <TabBtn id="marcador" label="Marcador" icon="marcador"/>
              <TabBtn id="pausa" label="Pausa" icon="pausa"/>
            </div>

            {acciones}
            {faseMercado}
            {faseLab}

            <div className="lg:hidden mt-3 space-y-2 min-h-[60px]">{avisos}</div>

            <div className="hidden lg:block mt-3 rounded-xl border border-borde/70 bg-sedimento/40 p-3">
              <h4 className="text-[11px] text-tenue mb-1.5 uppercase tracking-wider">Registro</h4>
              <div className="space-y-1 max-h-[180px] overflow-y-auto scroll">
                {g.log.slice(-8).reverse().map((l,i)=>(
                  <p key={i} className={'text-[12px] leading-snug '+(l.t.startsWith('EVENTO')?'text-arcilla':l.t.startsWith('—')?'text-cinta':'text-tenue')}>{l.t}</p>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>

      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 flex bg-sedimento/98"
        style={{paddingBottom:'env(safe-area-inset-bottom)', boxShadow:'0 -4px 0 rgba(0,0,0,.3), 0 -12px 22px -10px rgba(0,0,0,.7)'}}>
        <TabBtn id="dinos" label="Dinosaurios" badge={puedePuntuar} full/>
        <TabBtn id="mercado" label="Mercado" full/>
        <TabBtn id="equipo" label="Tu equipo" badge={p.tools.filter(t=>!t.used).length} full/>
        <TabBtn id="marcador" label="Marcador" full/>
        <TabBtn id="pausa" label="Pausa" icon="pausa" full/>
      </nav>

      {banda && <Banda key={banda.id} banda={banda}/>}

      {toast && <div key={toast.id} role="status" aria-live="polite" className="flota fixed left-1/2 -translate-x-1/2 bottom-20 z-40 max-w-[90vw] px-3.5 py-2 rounded-full bg-hueso text-esquisto text-[12px] font-medium"
        style={{boxShadow:'0 4px 0 rgba(0,0,0,.4), 0 12px 20px -8px rgba(0,0,0,.7)'}}>{toast.t}</div>}

      {evt && <Hoja title={evt.n} sub="Evento" onClose={()=>setEvt(null)}>
        <div className="flex gap-3 items-start">
          <div className="w-11 h-11 rounded-lg bg-arcilla/25 text-arcilla flex items-center justify-center shrink-0 disp font-extrabold text-xl">!</div>
          <p className="text-[13px] leading-relaxed text-hueso/90">{evt.d}</p>
        </div>
        {evt.efectos && evt.efectos.length>0 &&
          <div className="mt-3 rounded-xl border border-borde bg-esquisto/60 p-3">
            <p className="text-[10px] text-cinta mb-1.5">A quién afecta</p>
            {evt.efectos.map((t,i)=><p key={i} className="text-[13px] leading-snug text-hueso">{t}</p>)}
          </div>}
        <BtnJ cls="mt-4 w-full" on={()=>setEvt(null)}>Entendido</BtnJ>
      </Hoja>}

      <Hojas g={g} p={p} col={col} onRestart={onRestart} hoja={hoja} setHoja={setHoja} run={run} sel={sel} setSel={setSel} canAfford={canAfford}/>
    </div>
  );
}
Object.assign(FG.ui, {Game});
