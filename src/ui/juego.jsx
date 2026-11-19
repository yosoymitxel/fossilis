const {useState, useMemo, useRef, useEffect, useLayoutEffect} = React;
const {MAT, BONE} = FG.data;
const {cur, has, digCost, digTargets, extractTargets, moveTargets, sandTargets, climbTargets, planDig, pasoHacia, marketCap, startEnergy, act, aiStep, totalBones, solvePayment, DIRS, reach} = FG.core;
const {ERA_COL, eraDe} = FG.ui;
const {Peon, Cell, Hoja, Btn, BtnJ, Banda, TEX, Ico, Ic, IcoDino, Yeso, Rayo, ICONO, Rodante, svgIcono} = FG.ui;
const {Hojas, Pausa, Momento, Diorama, sabe3D} = FG.ui;
const {son, flotanteEn, Sacudida, Destello, polvo, destella, anillo, PALETA, MAT_PAL, GESTO, SUAVE, quieto, useTema, salaDe, AJUSTES, RITMO, vuela, golpe} = FG.fx;
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

function Accion({k, t, on, dis, cost, active}){
  const ico = useRef(null);
  const gesto = () => {
    if(!ico.current || !ico.current.animate || dis || SUAVE) return;
    ico.current.animate((GESTO[k] || GESTO.pausa).map(tr=>({transform:tr})),
      {duration:520, easing:'cubic-bezier(.3,.9,.3,1)'});
  };
  const pulsar = e => {
    gesto();
    if(k==='yeso'){
      flotanteEn(e.currentTarget, '+1 yeso', PALETA.yeso[2]);
      vuela(e.currentTarget, document.querySelector('[data-hud="yeso"]'), d=>{ d.innerHTML = svgIcono('ui-yeso', 26, PALETA.yeso[1]); }, {lado:30, fin:.6});
    }
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
}

function TabBtn({id, label, badge, icon, full, abrir}){
  const iconEl = icon
    ? (ICONO[icon] ? <Ic k={icon} s={16}/> : <Ico k={icon} s={16}/>)
    : null;
  return (
    <button onClick={()=>abrir(id)} aria-label={label} title={label}
      className={'relative flex flex-col items-center justify-center gap-1 py-1.5 min-h-[44px] px-1.5 text-[11px] text-tenue hover:text-hueso transition-colors rounded-lg hover:bg-borde/30 '+(full?'flex-1':'w-full')}>
      {iconEl}
      <span className="truncate leading-none">{label}</span>
      {badge>0 && <span className="absolute top-0.5 right-0.5 min-w-[15px] h-[15px] px-1 rounded-full text-[9px] font-bold leading-[15px] bg-cinta sobre-acento">{badge}</span>}
    </button>
  );
}


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
  const anchoTablero = useRef(null);
  const paron = useRef(0);          // ms de parada antes de que el empuje arranque
  const [banda,setBanda] = useState(null);
  const [vistas,setVistas] = useState([]);
  // Escenas intermedias: se muestran de una en una y los bots esperan a que acaben.
  const cine = () => AJUSTES.cinematicas && !quieto();
  const [cola,setCola] = useState(()=> g.log.length<=1 && !g.reanudada && cine() ? [{k:'apertura', g}] : []);
  const encolar = m => setCola(c=>c.concat(Object.assign({id:Date.now()+Math.random()}, m)));
  // El tablero vive en el yacimiento 3D de la cinemática (solo en la sala oscura y si el 3D carga).
  const usa3D = salaDe('vitrina', tema)==='vitrina';
  const [con3d,setCon3d] = useState(false);
  const desde = useRef(cola.length && cola[0].k==='apertura' ? 'apertura' : null).current;
  const bajaCamara = !cola.length || cola[0].k!=='apertura';
  const raiz = useRef(null), rejilla = useRef(null), encuadre = useRef(null);
  const [montaje,setMontaje] = useState(desde ? 'oculto' : 'listo');
  useEffect(()=>{
    const r = raiz.current, j = rejilla.current, esc = tablero.current;
    if(!r || !j || !esc || typeof ResizeObserver==='undefined') return;
    const marco = esc.querySelector('.marco-yacimiento');
    // Posición de maqueta (sin transformaciones) respecto a la raíz, que es donde está el lienzo 3D.
    const caja = el => { let x=0, y=0, n=el; while(n && n!==r){ x+=n.offsetLeft; y+=n.offsetTop; n=n.offsetParent; }
      return {x, y, w:el.offsetWidth, h:el.offsetHeight}; };
    const nums = v => (String(v).replace(/^[a-z0-9]*\(/i,'').match(/-?[\d.]+(e-?\d+)?/g) || []).map(Number);   // sin el nombre (matrix3d)
    // Lo que el 3D necesita para repetir la proyección CSS: punto de fuga y perspectiva de .escena,
    // eje y ángulo del rotateX del marco, y centro y ancho de la rejilla.
    const medir = () => {
      const E = caja(esc), M = caja(marco), J = caja(j), cE = getComputedStyle(esc), cM = getComputedStyle(marco);
      const po = nums(cE.perspectiveOrigin), to = nums(cM.transformOrigin), m = nums(cM.transform);
      const a = m.length===16 ? Math.atan2(m[6], m[5]) : 0;
      const P = parseFloat(cE.perspective) || 1e5;
      encuadre.current = {ex:E.x+(po[0] ?? E.w/2), ey:E.y+(po[1] ?? E.h/2), P, a,
        ax:M.y+(to[1] ?? M.h), bx:J.x+J.w/2, by:J.y+J.h/2, S:J.w};
    };
    medir();
    const ro = new ResizeObserver(medir); ro.observe(r); ro.observe(j); ro.observe(esc);
    return ()=>ro.disconnect();
  },[]);
  // Al terminar la apertura la cámara baja y las losetas caen en su sitio una a una.
  useEffect(()=>{
    if(montaje!=='oculto' || !bajaCamara) return;
    const t = setTimeout(()=>setMontaje('montando'), con3d ? 900 : 150);
    return ()=>clearTimeout(t);
  },[bajaCamara, montaje]);
  useLayoutEffect(()=>{
    if(montaje!=='montando') return;
    const j = rejilla.current;
    if(j && !quieto()) j.querySelectorAll('.celda-3d').forEach((c,i)=>{
      const fila = Math.floor(i/5), col = i%5;
      c.animate([{transform:'translateY(-46px) scale(1.06)', opacity:0},{transform:'translateY(0) scale(1)', opacity:1}],
        {duration:420, delay:(fila+col)*45, easing:'cubic-bezier(.23,1,.32,1)', fill:'backwards'});
    });
    const t = setTimeout(()=>setMontaje('listo'), 900);
    return ()=>clearTimeout(t);
  },[montaje]);
  const lastScored = useRef({});
  const lastFin = useRef(g.endTrigger);
  const col = p.color;
  const suave = SUAVE;

  const sitio = el => {
    let x=0, y=0, n=el;
    while(n && n!==tablero.current){ x+=n.offsetLeft; y+=n.offsetTop; n=n.offsetParent; }
    return {x,y};
  };
  useLayoutEffect(()=>{
    const cont = tablero.current; if(!cont) return;
    const vistos = new Set();
    const ancho = cont.offsetWidth+'x'+cont.offsetHeight, redimensionado = anchoTablero.current!==null && anchoTablero.current!==ancho;
    anchoTablero.current = ancho;
    cont.querySelectorAll('[data-tile],[data-peon]').forEach(el=>{
      const k = el.dataset.tile ? 't'+el.dataset.tile : 'p'+el.dataset.peon;
      vistos.add(k);
      const s = sitio(el);
      const ant = cajas.current.get(k);
      cajas.current.set(k, s);
      if(suave || !el.animate || redimensionado) return;
      if(ant){
        const dx = ant.x-s.x, dy = ant.y-s.y;
        if(Math.abs(dx)<1 && Math.abs(dy)<1) return;
        const previa = vuelo.current.get(k); if(previa) previa.cancel();
        const tr = (x,y,sx,sy) => 'translate('+x+'px,'+y+'px) scale('+sx+','+sy+')';
        const salto = Math.min(22, 8 + Math.hypot(dx,dy)*.12);
        const fotos = el.dataset.peon
          ? [{transform:tr(dx,dy,1,1), easing:'cubic-bezier(.33,0,.67,1)'},
             {transform:tr(dx/2,dy/2-salto,1.04,1.04), offset:.5, easing:'cubic-bezier(.33,0,.67,1)'},
             {transform:tr(0,0,1.12,.86), offset:.86, easing:'cubic-bezier(.23,1,.32,1)'},
             {transform:tr(0,0,1,1)}]
          : [{transform:tr(dx,dy,1,1), easing:'cubic-bezier(.5,0,.2,1)'},
             {transform:tr(0,0,1.07,.93), offset:.72, easing:'cubic-bezier(.23,1,.32,1)'},
             {transform:tr(0,0,1,1)}];
        const a = el.animate(fotos, {duration:el.dataset.peon ? 380 : 360, delay:paron.current, fill:'backwards', composite:'add'});
        vuelo.current.set(k,a);
        a.finished.then(()=>{ if(vuelo.current.get(k)===a) vuelo.current.delete(k); }, ()=>{});
      } else if(montado.current){
        el.animate([{transform:'scale(.45)',opacity:0},{transform:'scale(1)',opacity:1}],
          {duration:340, easing:'cubic-bezier(.22,1.3,.36,1)', composite:'add'});
      }
    });
    for(const k of [...cajas.current.keys()]) if(!vistos.has(k)){ cajas.current.delete(k); vuelo.current.delete(k); }
    montado.current = true;
    paron.current = 0;
  });

  // Al cambiar el tamaño (pantalla completa, giro) se apuntan los sitios nuevos sin animar nada.
  useEffect(()=>{
    const cont = tablero.current; if(!cont || typeof ResizeObserver==='undefined') return;
    const ro = new ResizeObserver(()=>{
      anchoTablero.current = cont.offsetWidth+'x'+cont.offsetHeight;
      cont.querySelectorAll('[data-tile],[data-peon]').forEach(el=>
        cajas.current.set(el.dataset.tile ? 't'+el.dataset.tile : 'p'+el.dataset.peon, sitio(el)));
    });
    ro.observe(cont);
    return ()=>ro.disconnect();
  },[]);

  useEffect(()=>{
    if(!g.fx || !tablero.current) return;
    if(g.fx.k==='dig'){
      son(g.fx.caidas.some(c=>c.mat==='stone') ? 'piedra' : 'cavar');
      g.fx.caidas.forEach(c=>{
        Sacudida(tablero.current, c.mat==='stone' ? 7 : c.mat==='clay' ? 4 : 2);
        const el = tablero.current.querySelector('[data-cell="'+c.i+'"]');
        flotanteEn(el, '+ '+MAT[c.mat].es, PALETA[MAT_PAL[c.mat]][0]);
        const paso = ({N:[0,-1],S:[0,1],E:[1,0],O:[-1,0]})[g.fx.dir] || [0,0], r = el && el.getBoundingClientRect();
        polvo(el, MAT[c.mat].bg, paso);
        if(r) vuela(el, document.querySelector('[data-hud="losetas"]'), d=>{
          const m = MAT[c.mat].bg;
          d.style.background = m; d.style.borderRadius = '5px';
          d.style.boxShadow = 'inset 0 2px 0 rgba(255,255,255,.35), 0 2px 0 color-mix(in srgb,'+m+' 70%,#140b05), 0 4px 0 color-mix(in srgb,'+m+' 52%,#140b05), 0 10px 12px -4px rgba(0,0,0,.6)';
        }, {lado:r.width*.6, dx:paso[0]*r.width*.75, dy:paso[1]*r.height*.75, retraso:240, fin:.32, dura:700});
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
        anillo(casilla, '#F4EFE4', 1.8);
        flotanteEn(casilla, 'Martillo', PALETA.martillo[0]);
      } else {
        const v = BONE[g.fx.item].val, raro = v>=6;
        son(raro ? 'raro' : 'extraer');
        destella(casilla, PALETA.hueso[raro?1:0], raro);
        if(raro) anillo(casilla, PALETA.hueso[2], 2.6);
        flotanteEn(casilla, BONE[g.fx.item].es+' '+v, PALETA.hueso[raro?2:0], raro);
        vuela(casilla, document.querySelector('[data-hud="huesos"]'),
          d=>{ d.innerHTML = svgIcono(g.fx.item, 34, PALETA.hueso[raro?1:0]); d.style.filter = 'drop-shadow(0 3px 2px rgba(0,0,0,.7))'; },
          {lado:40, fin:.5, dura:760, retraso:120});
        if(raro) Destello(tablero.current, PALETA.hueso[2]);
      }
    }
  },[g.fxId]);

  useEffect(()=>{
    if(g.turn===lastTurn.current) return;
    lastTurn.current = g.turn;
    const q = cur(g);
    if(cine() && !q.isAI && g.players.filter(x=>!x.isAI).length>1){ encolar({k:'relevo', jugador:q}); return; }
    son('turno');
    setBanda({texto:'Turno de '+q.name, color:q.color, id:Date.now()});
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
        const ult = q.scored[q.scored.length-1];
        const nuevo = q.scored.length > (lastScored.current[q.id]===undefined ? q.scored.length : lastScored.current[q.id]);
        if(nuevo && ult && cine()) encolar({k:'museo', dino:ult, pv:d, jugador:q});
        else if(d>=12){
          const cE = ult ? ERA_COL[eraDe(ult)] : '#A97F3C';
          son('esqueleto');
          Destello(tablero.current, cE);
          setBanda({texto: ult ? ult.name+' al museo' : 'Esqueleto completo',
                    color: cE, id: Date.now()});
        }
      }
      lastVP.current[q.id]=q.vp;
      lastScored.current[q.id]=q.scored.length;
    });
    if(g.endTrigger && !lastFin.current && !g.over && cine()) encolar({k:'ultima'});
    lastFin.current = g.endTrigger;
  },[g]);

  const SON_ACC = {move:'mover', sand:'arena', climb:'subir', plaster:'yeso',
                   buy:'compra', skillPlaster:'yeso', skillPush:'mover'};
  const run = (t, pl={}) => {
    if(SON_ACC[t]) son(SON_ACC[t]);
    if(t==='dig' && !suave){
      paron.current = 80;
      golpe(tablero.current && tablero.current.querySelector('[data-cell="'+pl.from+'"] .tile'));
    }
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
      lastEvt.current = id;
      if(cine()) encolar({k:'evento', evento:g.lastEvent, deposito:g.poolIndex});
      else { setEvt(g.lastEvent); son('evento'); }
      Destello(tablero.current, PALETA.evento[0]);
      Sacudida(tablero.current, 6);
    }
  },[g]);
  useEffect(()=>{ if(!toast) return; const i=setTimeout(()=>setToast(null),2400); return ()=>clearTimeout(i); },[toast]);

  useEffect(()=>{
    if(g.over || !cur(g).isAI) { guard.current=0; return; }
    if(cola.length) return;
    const id = setTimeout(()=>{
      guard.current++;
      const s = guard.current>70 ? {t:'endTurn'} : aiStep(g);
      setG(x=>act(x, s.t, s));
      if(s.t==='endTurn') guard.current=0;
    }, RITMO[AJUSTES.ritmo] || 430);
    return ()=>clearTimeout(id);
  }, [g, cola.length]);

  const canAfford = c => !!solvePayment(p.tiles, c.cost);
  const digs  = digTargets(g,p).filter(i=>digCost(p, g.cells[i][g.cells[i].length-1].mat) <= g.energy);
  const exts  = extractTargets(g,p);
  const mvs   = moveTargets(g,p);
  const sands = sandTargets(g,p);
  const climbs= climbTargets(g,p);
  const tool  = sel && sel.m==='tool' ? p.tools[sel.ti].card : null;
  const hum   = !p.isAI;
  const pista = hum && AJUSTES.pistas ? PISTAS.find(x=>vistas.indexOf(x.k)<0 && x.cond(g,p)) : null;

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
      <div className="grid grid-cols-5 lg:grid-cols-2 gap-1.5 lg:gap-2">
        <Accion k="yeso" t="Yeso" cost={1} dis={g.energy<1||(g.pool===0&&g.reserve===0)} on={()=>run('plaster')}/>
        <Accion k="mover" t="Mover" cost={1} dis={g.energy<1||!mvs.length} active={sel&&sel.m==='move'} on={()=>setSel(sel&&sel.m==='move'?null:{m:'move'})}/>
        <Accion k="cavar" t="Cavar" cost={1} dis={!digs.length} active={sel&&sel.m==='dig'} on={()=>setSel(sel&&sel.m==='dig'?null:{m:'dig'})}/>
        <Accion k="extraer" t="Extraer" cost={1} dis={g.energy<1||!exts.length} active={sel&&sel.m==='extract'} on={()=>setSel(sel&&sel.m==='extract'?null:{m:'extract'})}/>
        <Accion k="arena" t="Arena" cost={has(p,'arenaFree')?0:1} dis={!sands.length||g.energy<(has(p,'arenaFree')?0:1)} active={sel&&sel.m==='sand'} on={()=>setSel(sel&&sel.m==='sand'?null:{m:'sand'})}/>
        {p.pos===null && <Accion k="subir" t="Subir" cost={1} dis={g.energy<1||!climbs.length} active={sel&&sel.m==='climb'} on={()=>setSel({m:'climb'})}/>}
        {has(p,'yeso2') && <Accion k="yeso" t="Mezcla" cost={1} dis={g.energy<1||g.usedSkill.yeso2} on={()=>run('skillPlaster')}/>}
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
      <Btn cls="flex-1 py-3" on={()=>setHoja('dinos')}><Ico k="laboratorio" s={17}/> Al laboratorio</Btn>
      <BtnJ cls="flex-1" on={()=>run('endTurn')}>
        <Ico k="turno" s={15}/> Terminar turno
      </BtnJ>
    </div>
  );

  return (
    <div ref={raiz} data-sala={salaDe('vitrina', tema)} data-montaje={montaje}
      className={'pantalla relative min-h-[100svh] lg:h-[100svh] lg:overflow-hidden flex flex-col pb-20 lg:pb-0'+(con3d?' con-3d':'')}>
      <TEX/>
      {usa3D && <div className="fondo-tablero" aria-hidden="true">
        <Diorama hora="noche" plano="tablero" encuadre={encuadre} vuelo={bajaCamara} desde={desde} onEstado={e=>setCon3d(e==='listo')}/>
      </div>}
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
                <span className="fases" aria-label={'Fase: '+({actions:'acciones',market:'mercado',lab:'laboratorio'})[g.phase]}>
                  {[['actions','Acciones'],['market','Mercado'],['lab','Laboratorio']].map(([k,n],i,a)=>
                    <i key={k} className={g.phase===k ? 'on' : a.findIndex(x=>x[0]===g.phase)>i ? 'hecha' : ''}>{n}</i>)}
                </span>
                {g.remaining!==undefined && <span className="ml-1.5 text-arcilla">quedan {g.remaining} turnos</span>}</div>
            </div>
            <div className="flex gap-[3px] items-center" title={'Energía: '+g.energy} aria-label={'Energía: '+g.energy}>
              {Array.from({length:Math.max(startEnergy(p), g.energy)},(_,k)=><span key={k} className={'pip'+(k<g.energy?'':' gastada')}/>)}
            </div>
            <div ref={marcador} className="text-right shrink-0 w-10">
              <div className="disp font-extrabold text-lg leading-none text-hueso tabular-nums"><Rodante key={p.id} n={p.vp}/></div>
              <div className="text-[10px] text-tenue leading-none">PV</div>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[11px] text-tenue shrink-0">Depósito {Math.min(g.poolIndex,4)}/4</span>
            <div className="flex gap-[2px] flex-1 h-2.5 items-stretch">
              {Array.from({length:Math.max(g.pool,0)},(_,k)=><span key={k} className="flex-1 max-w-[10px] bg-hueso rounded-[2px]"
                style={{boxShadow:'inset 0 1px 0 rgba(255,255,255,.5), 0 1px 0 rgba(0,0,0,.4)'}}/>)}
              {g.pool===0 && <span className="text-[11px] text-arcilla self-center">vacío · evento inminente</span>}
              {g.pool>0 && g.pool<=2 && <span className="text-[11px] text-cinta self-center">quedan {g.pool}</span>}
            </div>
            <span className="hud" data-hud="losetas" title="Losetas reclamadas"><span className="hud-loseta"/><b>{p.tiles.length}</b></span>
            <span className="hud" data-hud="huesos" title="Huesos en el almacén"><Ic k="femur" s={13}/><b>{totalBones(p)}</b></span>
            <span className="hud" data-hud="yeso" title="Yeso"><Yeso s={13}/><b>{p.plaster}</b></span>
          </div>
        </div>
      </header>

      <div className="relative z-10 lg:flex-1 lg:min-h-0 lg:overflow-hidden">
        <div className="h-full max-w-[1200px] mx-auto px-3 lg:px-5 lg:grid lg:grid-cols-[minmax(0,1fr)_368px] lg:gap-6 lg:pt-3 lg:items-start">
          <main className="min-w-0 lg:min-h-0">
            <div ref={tablero} className="escena relative mt-3 lg:mt-0 p-2 lg:p-3 rounded-2xl transition-colors lg:max-w-[calc(100svh-260px)] lg:mx-auto lg:w-full"
              style={{background:'radial-gradient(ellipse at 50% 20%, rgb(var(--superficie)) 0%, rgb(var(--fondo)) 72%)'}}>{/* taste-skill-ignore: charco de luz bajo la vitrina */}
              <div className="marco-yacimiento">
                <div className="haz" aria-hidden="true"/>
                <div ref={rejilla} className="rejilla-3d grid grid-cols-5 gap-1.5 lg:gap-2.5 select-none relative">
                  {[...Array(25).keys()].map(i=>
                    <Cell key={i} g={g} i={i} hi={hi.has(i)}
                      dim={!!sel && hum && hi.size>0 && !hi.has(i)}
                      onClick={sel && hum ? ()=>onCell(i) : undefined}
                      arrows={sel && (sel.m==='dig'||(sel.m==='tool'&&tool&&tool.eff.t==='slide')) && sel.from===i ? arrowsFor(i) : null}
                      onArrow={d=> sel.m==='dig' ? run('dig',{from:i, dir:d}) : run('tool',{toolIndex:sel.ti, from:i, dir:d})}/>)}
                </div>
                <div className="peones grid grid-cols-5 grid-rows-5 gap-1.5 lg:gap-2.5" aria-hidden="true">
                  {g.players.filter(q=>q.pos!==null).map(q=>{ const h = g.cells[q.pos].length;
                    return <div key={q.id} className="peon-casilla" style={{gridColumn:(q.pos%5)+1, gridRow:Math.floor(q.pos/5)+1}}>
                      <span className="peon-sombra"/>
                      <span data-peon={q.id} className={'relative block '+(h===2?'-translate-y-[5px]':h===1?'-translate-y-[1px]':'')}>
                        <Peon color={q.color} letra={q.name[0].toUpperCase()} s={24} activo={q.id===g.turn}/></span>
                    </div>; })}
                </div>
              </div>
            </div>

            <p role="status" aria-live="polite" className="estado mt-2.5 lg:mt-3 text-[13px] text-hueso/80 min-h-[18px] lg:max-w-[calc(100svh-260px)] lg:mx-auto lg:w-full">
              {toast ? <span key={toast.id} className="aviso">{toast.t}</span> : <>
              {sel && sel.m==='dig' && (sel.from===undefined ? 'Elige la loseta que vas a empujar.' : 'Elige hacia dónde la empujas.')}
              {sel && sel.m==='move' && 'Elige dónde plantarte.'}
              {sel && sel.m==='extract' && 'Elige una fosa abierta a tu lado.'}
              {sel && sel.m==='sand' && 'Elige dónde poner la arena.'}
              {sel && sel.m==='climb' && 'Vuelves por el lado por el que caíste.'}
              {sel && sel.m==='tool' && (tool.eff.t==='lantern' && sel.step==='tile' ? 'Elige una loseta del descarte.' : 'Usando '+tool.n+'.')}
              {!sel && hum && g.phase==='actions' && (g.energy>0 ? 'Te quedan '+g.energy+' de energía.' : 'Sin energía. Pasa al mercado.')}
              {!sel && hum && g.phase==='market' && ('Puedes comprar '+(marketCap(p)>1?'hasta '+marketCap(p)+' cartas':'una carta')+' con tus fragmentos.')}
              {!sel && hum && g.phase==='lab' && 'Puedes llevarte un dinosaurio al laboratorio.'}
              {p.isAI && 'El bot está resolviendo su turno.'}</>}
            </p>

            <div className="hidden lg:block mt-2 space-y-2 min-h-[60px] lg:max-w-[calc(100svh-260px)] lg:mx-auto lg:w-full">{avisos}</div>
          </main>

          <aside className="lg:h-full lg:overflow-y-auto lg:min-h-0 lg:pr-1 mt-3 lg:mt-0">
            <div className="hidden lg:flex gap-0.5 mb-3 rounded-xl border border-borde/70 bg-sedimento/40 p-1">
              <TabBtn abrir={setHoja} id="dinos" label="Dinos" badge={puedePuntuar} icon="dinos"/>
              <TabBtn abrir={setHoja} id="mercado" label="Mercado" icon="mercado"/>
              <TabBtn abrir={setHoja} id="equipo" label="Equipo" badge={p.tools.filter(t=>!t.used).length} icon="equipo"/>
              <TabBtn abrir={setHoja} id="marcador" label="Marcador" icon="marcador"/>
              <TabBtn abrir={setHoja} id="pausa" label="Pausa" icon="pausa"/>
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
        <TabBtn abrir={setHoja} id="dinos" label="Dinos" badge={puedePuntuar} icon="dinos" full/>
        <TabBtn abrir={setHoja} id="mercado" label="Mercado" icon="mercado" full/>
        <TabBtn abrir={setHoja} id="equipo" label="Equipo" badge={p.tools.filter(t=>!t.used).length} icon="equipo" full/>
        <TabBtn abrir={setHoja} id="marcador" label="Marcador" icon="marcador" full/>
        <TabBtn abrir={setHoja} id="pausa" label="Pausa" icon="pausa" full/>
      </nav>

      {banda && !cola.length && <Banda key={banda.id} banda={banda}/>}
      {cola.length>0 && <Momento key={cola[0].id || 'apertura'} m={cola[0]} sobre3d={usa3D && sabe3D()===true} onFin={()=>setCola(c=>c.slice(1))}/>}



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
