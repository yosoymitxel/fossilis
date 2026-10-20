// Fossilis · entorno: pantalla completa, movimiento reducido y motor de UI sobre anime.js.
/* ============================================================
   PANTALLA COMPLETA
   ============================================================ */
function irPantallaCompleta(){
  if(typeof document === 'undefined') return;
  if(document.fullscreenElement) return;
  const d = document.documentElement;
  const fn = d.requestFullscreen || d.webkitRequestFullscreen || d.msRequestFullscreen;
  if(!fn) return;
  try {
    const p = fn.call(d);
    if(p && p.catch) p.catch(()=>{});
  } catch(e){}
}
if(typeof document !== 'undefined'){
  const reintento = () => {
    irPantallaCompleta();
    document.removeEventListener('click', reintento, true);
    document.removeEventListener('touchend', reintento, true);
  };
  document.addEventListener('click', reintento, true);
  document.addEventListener('touchend', reintento, true);
}

const SUAVE = typeof window!=='undefined' && window.matchMedia
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;
const AJUSTES = {animacion: !SUAVE, sonido: true};
const quieto = () => !AJUSTES.animacion;

/* 'gabinete' es la sala oscura en toda la app; los otros temas son salas únicas. */
const TEMAS = ['gabinete','vitrina','modular','libreta','seccion'];
const TemaCtx = React.createContext(['gabinete', () => {}]);
const useTema = () => React.useContext(TemaCtx);
const salaDe = (base, tema) => tema==='gabinete' ? 'vitrina' : tema;
// El interruptor de ajustes también apaga los respaldos CSS (ver gabinete.css).
const syncAnim = () => {
  if(typeof document!=='undefined') document.documentElement.dataset.anim = AJUSTES.animacion ? 'on' : 'off';
};
syncAnim();

/* ============================================================
   MOTOR DE UI · anime.js
   Las hojas piden MOT().animate(objetivo, fotogramas, opciones) con fotogramas
   del estilo {propiedad:[desde, hasta]} y 'transform' en cadenas CSS; aquí se
   traduce a la API de anime.js v4. MUELLE sobrevive como el rebote de casa;
   con las animaciones apagadas MOT() devuelve null y manda el respaldo CSS.
   ============================================================ */
const PROP_TRANSFORM = {translateX:'x',translateY:'y',translateZ:'z',
  scale:'scale',scaleX:'scaleX',scaleY:'scaleY',rotate:'rotate',rotateZ:'rotate'};
const DEFECTO = {x:'0px',y:'0px',z:'0px',scale:1,scaleX:1,scaleY:1,rotate:'0deg'};
const unidad = v => String(v).replace(/[\d.\s+-]/g,'');
function propsDe(fotogramas){
  const out = {}, acc = {}, t = fotogramas.transform;
  const lista = t===undefined ? [] : (Array.isArray(t) ? t : [t]);
  lista.forEach((cad,i)=>{
    const re = /([A-Za-z]+)\(([^)]*)\)/g;
    let m;
    while((m = re.exec(String(cad)))){
      const p = PROP_TRANSFORM[m[1]];
      if(!p) continue;
      if(!acc[p]) acc[p] = new Array(lista.length).fill(null);
      acc[p][i] = m[2].trim();
    }
  });
  for(const k in fotogramas) if(k!=='transform') out[k] = fotogramas[k];
  for(const p in acc){
    const v = acc[p].map(x => x===null ? DEFECTO[p] : x);
    if(v.length===2){
      // mismo tramo con unidades distintas (100% → 0px): el cero hereda la unidad
      const u0 = unidad(v[0]), u1 = unidad(v[1]);
      if(u0 && u1 && u0!==u1){
        if(parseFloat(v[0])===0) v[0] = '0'+u1;
        else if(parseFloat(v[1])===0) v[1] = '0'+u0;
      }
      out[p] = {from:v[0], to:v[1]};
    } else out[p] = v.length===1 ? v[0] : v;
  }
  return out;
}
/* anime.js v4: el global es un módulo; la animación se crea con anime.animate(). */
const motorAnime = () => {
  const a = typeof window!=='undefined' ? window.anime : null;
  if(!a) return null;
  if(typeof a.animate==='function') return a;
  return (a.default && typeof a.default.animate==='function') ? a.default : null;
};
/* el core de v4 ya no acepta cubicBezier(...) en texto: se traduce a la familia más cercana */
const easeDe = a => a[1] <= 0.06
  ? (a[2] >= 0.9 ? 'inQuart' : 'inOutQuart')
  : 'outQuart';
const ADAPTE = {
  animate(objetivo, fotogramas, opciones){
    const o = opciones || {}, A = motorAnime();
    if(!A) throw new Error('anime.js no disponible');
    const cfg = propsDe(fotogramas);
    cfg.duration = o.duration!==undefined ? Math.round(o.duration*1000) : 480;
    cfg.ease = o.type==='spring' ? 'outBack(1.35)'
      : Array.isArray(o.ease) ? easeDe(o.ease)
      : (typeof o.ease==='string' ? o.ease : 'outQuart');
    if(o.delay!==undefined) cfg.delay = o.delay;
    let anim = null;
    try { anim = A.animate(objetivo, cfg); }
    catch(e){
      try { anim = A.animate(objetivo, Object.assign({}, cfg, {ease:'linear'})); }
      catch(e2){ anim = null; }
    }
    return {finished:new Promise(res => {
      if(anim && typeof anim.then==='function') anim.then(()=>res());
      else setTimeout(()=>res(), cfg.duration+60);
    })};
  },
  stagger(paso, extra){
    const p = Math.max(0, Math.round((paso||0)*1000));
    const s = Math.max(0, Math.round(((extra&&extra.startDelay)||0)*1000));
    return (el,i)=> s + i*p;
  }
};
const MOT = () => (typeof window!=='undefined' && motorAnime() && !SUAVE && AJUSTES.animacion) ? ADAPTE : null;
const MUELLE = {type:'spring', stiffness:320, damping:32};
Object.assign(FG.fx, {irPantallaCompleta, SUAVE, AJUSTES, quieto, MOT, MUELLE, syncAnim, TEMAS, TemaCtx, useTema, salaDe});
