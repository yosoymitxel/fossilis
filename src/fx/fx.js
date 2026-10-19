// Fossilis · efectos: paleta, partículas de canvas, flotantes y gestos.
const {quieto} = FG.fx;
const PALETA = {
  hueso:    ['#FFF3D6','#FFD98A','#E8A33D'],
  yeso:     ['#FFFFFF','#BFF3FF','#7FE0FF'],
  arena:    ['#FFC93C','#FF9F1C','#FFE8A8'],
  arcilla:  ['#FF5A3C','#FF8A5B','#D4381A'],
  piedra:   ['#FFE9A8','#FFAE3C','#FFFFFF'],
  compra:   ['#C77DFF','#FFD23F','#FF7BD5'],
  habilidad:['#2FE6C4','#7CFFE8','#FFD23F'],
  evento:   ['#FF4D3D','#FFB03A','#FFE566'],
  martillo: ['#FFD23F','#FFF3A0','#FF9F1C'],
  caida:    ['#FFD98A','#FF9F1C','#FFFFFF'],
};
const MAT_PAL = {sand:'arena', clay:'arcilla', stone:'piedra'};

function Chispas(x, y, o){
  if(quieto() || typeof document==='undefined') return;
  const col = o.col, n = o.n || 24;
  const cv = document.createElement('canvas');
  cv.style.cssText = 'position:fixed;left:0;top:0;pointer-events:none;z-index:70';
  cv.width = window.innerWidth; cv.height = window.innerHeight;
  cv.style.width = cv.width+'px'; cv.style.height = cv.height+'px';
  document.body.appendChild(cv);
  const ctx = cv.getContext('2d');
  const dir = o.dir!==undefined ? o.dir : -Math.PI/2;
  const abre = o.abre!==undefined ? o.abre : Math.PI*2;
  const grav = o.grav!==undefined ? o.grav : .19;
  const [tmin,tmax] = o.tam || [2.5,6];
  const ps = Array.from({length:n}, ()=>{
    const ang = dir + (Math.random()-.5)*abre;
    const v = o.vel * (0.5+Math.random()*1.0);
    return {x, y, vx:Math.cos(ang)*v, vy:Math.sin(ang)*v, vida:1,
            s:tmin+Math.random()*(tmax-tmin), r:Math.random()*6,
            vr:(Math.random()-.5)*(o.giro||.4),
            c:col[Math.floor(Math.random()*col.length)]};
  });
  const fin = o.dura || .017;
  let t0 = null;
  const paso = t => {
    if(t0===null) t0 = t;
    const dt = Math.min((t-t0)/16.67, 3); t0 = t;
    ctx.clearRect(0,0,cv.width,cv.height);
    let vivos = 0;
    for(const q of ps){
      if(q.vida<=0) continue;
      vivos++;
      q.vy += grav*dt; q.x += q.vx*dt; q.y += q.vy*dt;
      q.vx *= (o.roce || .99); q.r += q.vr*dt; q.vida -= fin*dt;
      ctx.save(); ctx.globalAlpha = Math.max(q.vida,0);
      ctx.translate(q.x,q.y); ctx.rotate(q.r); ctx.fillStyle = q.c;
      if(o.forma==='redonda'){ ctx.beginPath(); ctx.arc(0,0,q.s/2,0,6.284); ctx.fill(); }
      else ctx.fillRect(-q.s/2, -q.s/2, q.s, q.s*(o.forma==='lasca'?2.2:1.6));
      ctx.restore();
    }
    if(vivos) requestAnimationFrame(paso); else cv.remove();
  };
  requestAnimationFrame(paso);
}

const PERFIL = {
  mover:  {col:['#FFFFFF'],      n:7,  vel:1.2, grav:.30, tam:[2,3],   forma:'redonda', dura:.045},
  arena:  {col:PALETA.arena,     n:11, vel:1.0, grav:.42, tam:[1.8,3], forma:'redonda',
           dir:Math.PI/2, abre:1.0, dura:.026},
  subir:  {col:['#FFFFFF'],      n:9,  vel:2.2, grav:.20, tam:[2,3.5],
           dir:-Math.PI/2, abre:0.9, dura:.03},
  yeso:   {col:PALETA.yeso,      n:16, vel:1.6, grav:.06, tam:[3,5],   forma:'redonda', dura:.015, giro:.15},
  cavar:  {col:PALETA.caida,     n:24, vel:3.6, grav:.38, tam:[2,5],   forma:'lasca',   giro:.7},
  extraer:{col:PALETA.hueso,     n:30, vel:4.4, grav:.22, tam:[2.5,6], forma:'lasca',
           dir:-Math.PI/2, abre:1.5, giro:.5},
  martillo:{col:PALETA.martillo, n:30, vel:3.6, grav:.26, tam:[2,5],   forma:'lasca',   giro:.8},
  compra: {col:PALETA.compra,    n:26, vel:2.0, grav:-.03, tam:[2,4],  forma:'redonda', dura:.012},
  habilidad:{col:PALETA.habilidad,n:26, vel:2.4, grav:.05, tam:[2,4],  forma:'redonda', dura:.014},
  evento: {col:PALETA.evento,    n:54, vel:4.6, grav:.30, tam:[2.5,6], forma:'lasca',   giro:.9},
  esqueleto:{col:PALETA.hueso,   n:120,vel:5.6, grav:.24, tam:[3,8],   forma:'lasca',   giro:.7, dura:.011},
};

function Flotante(x, y, texto, color, grande){
  if(typeof document==='undefined') return;
  const d = document.createElement('div');
  d.textContent = texto;
  d.style.cssText = 'position:fixed;left:0;top:0;z-index:71;pointer-events:none;'+
    'font-family:Archivo,sans-serif;font-weight:800;white-space:nowrap;'+
    'text-shadow:0 2px 0 rgba(0,0,0,.7);font-size:'+(grande?26:16)+'px;color:'+color+';'+ // taste-skill-ignore: el número flota sobre el tablero y necesita separarse
    'transform:translate(-50%,-50%) translate('+x+'px,'+y+'px)';
  document.body.appendChild(d);
  if(quieto() || !d.animate){ setTimeout(()=>d.remove(), 900); return; }
  d.animate([
    {transform:'translate(-50%,-50%) translate('+x+'px,'+y+'px) scale(.5)', opacity:0},
    {transform:'translate(-50%,-50%) translate('+x+'px,'+(y-14)+'px) scale('+(grande?1.2:1.08)+')', opacity:1, offset:.22},
    {transform:'translate(-50%,-50%) translate('+x+'px,'+(y-28)+'px) scale(1)', opacity:1, offset:.62},
    {transform:'translate(-50%,-50%) translate('+x+'px,'+(y-64)+'px) scale(.92)', opacity:0}
  ], {duration:grande?1500:1100, easing:'cubic-bezier(.2,.9,.3,1)'})
   .finished.then(()=>d.remove(), ()=>d.remove());
}
const flotanteEn = (el, texto, color, grande) => {
  if(!el || !el.getBoundingClientRect) return;
  const r = el.getBoundingClientRect();
  Flotante(r.left+r.width/2, r.top+r.height/2, texto, color, grande);
};

function Sacudida(el, f){
  if(!el || quieto() || !el.animate) return;
  el.animate([
    {transform:'translate(0,0)'}, {transform:'translate('+(-f)+'px,'+(f*.6)+'px)'},
    {transform:'translate('+(f*.8)+'px,'+(-f*.5)+'px)'},
    {transform:'translate('+(-f*.45)+'px,'+(f*.25)+'px)'}, {transform:'translate(0,0)'}
  ], {duration:260, easing:'ease-out'});
}
function Destello(el, color){
  if(!el || quieto() || !el.animate) return;
  el.animate([{boxShadow:'0 0 0 0 '+color+'00'},
    {boxShadow:'0 0 34px 7px '+color+'CC', offset:.3},
    {boxShadow:'0 0 0 0 '+color+'00'}], {duration:900, easing:'ease-out'});
}
function chispasEn(el, k, extra){
  if(!el || !el.getBoundingClientRect) return;
  const r = el.getBoundingClientRect();
  const base = PERFIL[k] || PERFIL.cavar;
  Chispas(r.left+r.width/2, r.top+r.height/2, Object.assign({}, base, extra||{}));
}

const GESTO = {
  cavar:  ['rotate(0deg)','rotate(-26deg) translateY(-2px)','rotate(12deg) translateY(2px)','rotate(0deg)'],
  yeso:   ['translateY(0px)','translateY(-5px) scale(1.1)','translateY(3px) scale(.94)','translateY(0px)'],
  mover:  ['translateX(0px)','translateX(-4px)','translateX(5px)','translateX(0px)'],
  extraer:['translateY(0px) scale(1)','translateY(4px) scale(.9)','translateY(-6px) scale(1.12)','translateY(0px) scale(1)'],
  arena:  ['translateY(-6px)','translateY(2px)','translateY(-1px)','translateY(0px)'],
  subir:  ['translateY(0px)','translateY(-6px)','translateY(-2px)','translateY(0px)'],
  pausa:  ['scale(1)','scale(.82)','scale(1.06)','scale(1)'],
};
Object.assign(FG.fx, {PALETA, MAT_PAL, Chispas, PERFIL, Flotante, flotanteEn, Sacudida, Destello, chispasEn, GESTO});
