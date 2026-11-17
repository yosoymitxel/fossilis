// Fossilis · efectos: paleta, polvo, destellos, flotantes y gestos.
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

/* Cada gesto tiene su reacción, ninguna es confeti:
   polvo   · nube del material que se levanta y se disipa (cavar)
   destella· estrella de 4 puntas que crece y se apaga (hueso)
   anillo  · onda que se abre desde la pieza (martillo, hueso raro, habilidad) */
const capa = (x, y, lado, css) => {
  const d = document.createElement('div');
  d.style.cssText = 'position:fixed;left:'+(x-lado/2)+'px;top:'+(y-lado/2)+'px;width:'+lado+'px;height:'+lado+'px;'+
    'pointer-events:none;z-index:70;will-change:transform,opacity;'+css;
  document.body.appendChild(d);
  return d;
};
const centro = el => { const r = el.getBoundingClientRect(); return [r.left+r.width/2, r.top+r.height/2, Math.min(r.width,r.height)]; };
function polvo(el, color, dir){
  if(!el || quieto() || typeof document==='undefined') return;
  const [x,y,t] = centro(el), [vx,vy] = dir || [0,0];
  for(let i=0;i<5;i++){
    const ox = (i-2)*t*.16, d = capa(x+ox+vx*t*.3, y+t*.18+vy*t*.3, t*.7,
      'border-radius:50%;background:radial-gradient(circle,'+color+' 0%,'+color+'00 68%)');
    d.animate([{transform:'translate(0,0) scale(.35)', opacity:.75},
               {transform:'translate('+(ox*.6+vx*t*.25)+'px,'+(-t*.32-i%2*6)+'px) scale(1.5)', opacity:0}],
      {duration:620+i*70, delay:i*25, easing:'cubic-bezier(.23,1,.32,1)', fill:'backwards'}).finished.then(()=>d.remove(), ()=>d.remove());
  }
}
function destella(el, color, grande){
  if(!el || quieto() || typeof document==='undefined') return;
  const [x,y,t] = centro(el), d = capa(x, y, t*(grande?1.5:1.1),
    'background:'+color+';clip-path:polygon(50% 0,60% 40%,100% 50%,60% 60%,50% 100%,40% 60%,0 50%,40% 40%);'+
    'filter:drop-shadow(0 0 6px '+color+')');
  d.animate([{transform:'scale(.2) rotate(0deg)', opacity:1, offset:0},
             {transform:'scale(1) rotate(30deg)', opacity:1, offset:.3},
             {transform:'scale(0) rotate(60deg)', opacity:.6}],
    {duration:440, easing:'cubic-bezier(.23,1,.32,1)'}).finished.then(()=>d.remove(), ()=>d.remove());
}
function anillo(el, color, tam){
  if(!el || quieto() || typeof document==='undefined') return;
  const [x,y,t] = centro(el), d = capa(x, y, t, 'border-radius:50%;border:3px solid '+color);
  d.animate([{transform:'scale(.4)', opacity:1},{transform:'scale('+(tam||2.2)+')', opacity:0}],
    {duration:560, easing:'cubic-bezier(.23,1,.32,1)'}).finished.then(()=>d.remove(), ()=>d.remove());
}

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

const GESTO = {
  cavar:  ['rotate(0deg)','rotate(-26deg) translateY(-2px)','rotate(12deg) translateY(2px)','rotate(0deg)'],
  yeso:   ['translateY(0px)','translateY(-5px) scale(1.1)','translateY(3px) scale(.94)','translateY(0px)'],
  mover:  ['translateX(0px)','translateX(-4px)','translateX(5px)','translateX(0px)'],
  extraer:['translateY(0px) scale(1)','translateY(4px) scale(.9)','translateY(-6px) scale(1.12)','translateY(0px) scale(1)'],
  arena:  ['translateY(-6px)','translateY(2px)','translateY(-1px)','translateY(0px)'],
  subir:  ['translateY(0px)','translateY(-6px)','translateY(-2px)','translateY(0px)'],
  pausa:  ['scale(1)','scale(.82)','scale(1.06)','scale(1)'],
};
/* Vuelo al marcador: una copia sale de `desde`, sube en arco y cae encogiéndose en `hacia`,
   que rebota al recibirla. `pinta(nodo)` viste la copia (loseta, hueso, yeso). */
function rebota(el, k=1.3){
  if(!el || quieto() || !el.animate) return;
  el.animate([{transform:'scale(1)'},{transform:'scale('+k+')', offset:.35},{transform:'scale(1)'}],
    {duration:340, easing:'cubic-bezier(.23,1,.32,1)'});
}
function vuela(desde, hacia, pinta, o={}){
  if(!desde || !hacia || typeof document==='undefined') return;
  const a = desde.getBoundingClientRect ? desde.getBoundingClientRect() : desde, b = hacia.getBoundingClientRect();
  const lado = o.lado || Math.min(a.width, a.height, 56);
  const x0 = a.left + a.width/2 + (o.dx||0), y0 = a.top + a.height/2 + (o.dy||0);
  const x1 = b.left + b.width/2, y1 = b.top + b.height/2;
  if(quieto()){ rebota(hacia); return; }
  const d = document.createElement('div');
  d.style.cssText = 'position:fixed;left:0;top:0;z-index:72;pointer-events:none;display:grid;place-items:center;'+
    'width:'+lado+'px;height:'+lado+'px;margin:'+(-lado/2)+'px 0 0 '+(-lado/2)+'px;will-change:transform';
  pinta(d);
  document.body.appendChild(d);
  const alto = Math.max(40, Math.abs(y1-y0)*.35);
  const mx = (x0+x1)/2, my = Math.min(y0,y1) - alto;
  const fin = o.fin || .32, t = (x,y,s,r) => 'translate('+x+'px,'+y+'px) scale('+s+') rotate('+r+'deg)';
  d.animate([
    {transform:t(x0,y0,1,0), offset:0, easing:'cubic-bezier(.23,1,.32,1)'},
    {transform:t(x0,y0-14,1.12,-6), offset:.18, easing:'cubic-bezier(.5,0,.75,0)'},
    {transform:t(mx,my,.8,8), offset:.55, easing:'cubic-bezier(.25,.6,.35,1)'},
    {transform:t(x1,y1,fin,0), offset:1}
  ], {duration:o.dura || 620, delay:o.retraso || 0, fill:'both'})
   .finished.then(()=>{ d.remove(); rebota(hacia); if(o.alLlegar) o.alLlegar(); }, ()=>d.remove());
}
/* Golpe: la pieza se enciende un instante (white flash) */
function golpe(el){
  if(!el || quieto() || !el.animate) return;
  el.animate([{filter:'brightness(2.2) saturate(.4)'},{filter:'brightness(1)'}], {duration:160, easing:'ease-out'});
}
Object.assign(FG.fx, {rebota, vuela, golpe});
Object.assign(FG.fx, {PALETA, MAT_PAL, polvo, destella, anillo, Flotante, flotanteEn, Sacudida, Destello, GESTO});
