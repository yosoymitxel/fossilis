// Fossilis · la escena: el campamento sobre el corte del terreno. Ilustra portada y cinemáticas.
const {useRef, useEffect, useState} = React;
const {quieto} = FG.fx;

const HORAS = {
  noche: {cielo:['#070B14','#131C33','#2C2A45'], astro:'#EDE6CC', halo:'#8FA7C8', lejos:'#1B2438', cerca:'#10161F',
          tienda:'#C9B48A', sombra:'#0A0E14', farol:'#FFC56B', estrellas:1, velo:.34},
  ocaso: {cielo:['#231A3A','#A04A3C','#F0A35C'], astro:'#FFDDA0', halo:'#FFB067', lejos:'#5A3442', cerca:'#2A1C28',
          tienda:'#E6CFA0', sombra:'#160F18', farol:'#FFD38A', estrellas:.35, velo:.18},
  alba:  {cielo:['#BFD9E4','#F0E4CB','#F6C596'], astro:'#FFF6DC', halo:'#FFE2B0', lejos:'#A9B9B8', cerca:'#73877F',
          tienda:'#FBF3DF', sombra:'#3A4640', farol:'#FFC56B', estrellas:0, velo:0},
};
const horaDe = tema => tema==='gabinete' || tema==='vitrina' ? 'noche' : 'alba';

const ESTRELLAS = Array.from({length:42}, (_,i)=>({
  x:(i*97.3)%400, y:(i*53.7)%118, r:.5+((i*7)%5)*.18, d:(i%7)*.6}));
const MOTAS = Array.from({length:14}, (_,i)=>({x:18+(i*27.1)%364, y:150+(i*31)%130, d:(i%7)*1.3, s:1+(i%3)*.5}));
const PIEDRAS = Array.from({length:26}, (_,i)=>({x:(i*61.3)%400, y:252+(i*17)%44, r:2+(i%4)}));

/* Esqueleto de terópodo tendido en la arcilla: espina, costillas, cráneo y patas a trazo. */
function Esqueleto({color}){
  const espina = t => {            // curva del lomo y la cola, de cráneo (t=0) a punta (t=1)
    const x = 44 + t*150;
    const y = 24 - Math.sin(t*3.0)*9 + t*t*16;
    return [x,y];
  };
  const vert = Array.from({length:30}, (_,i)=>espina(i/29));
  return (
    <g fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round">{/* pathLength=1: el trazo se dibuja entero al aparecer */}
      <path d={'M'+vert.map(p=>p[0].toFixed(1)+' '+p[1].toFixed(1)).join(' L')} strokeWidth="2.6" pathLength="1"/>
      {vert.filter((_,i)=>i%2===1).map((p,i)=><path key={i} d={'M'+p[0]+' '+(p[1]-2.4)+'v4.8'} strokeWidth="1.6"/>)}
      {[.1,.14,.18,.22,.26,.3,.34].map((t,i)=>{ const [x,y]=espina(t); const l=12+Math.sin((i+1)/8*3.14)*9;
        return <path key={i} d={'M'+x+' '+(y+1)+' q-5 '+(l*.6)+' 1 '+l} strokeWidth="1.5"/>; })}
      <path d="M44 24 q-3 -9 -15 -10 q-13 -1 -19 6 q-3 4 0 8 l14 1 q9 0 13 -4 M12 26 l15 -1 M13 26 v3 M17 26 v3.4 M21 25.6 v3.4 M25 25.4 v3" strokeWidth="2"/>
      <circle cx="27" cy="19" r="2.4" strokeWidth="1.6"/>
      <path d="M58 20 l5 12 l-6 5 M62 21 l7 10 l-4 6" strokeWidth="1.7"/>
      <ellipse cx="104" cy="22" rx="8" ry="5.5" strokeWidth="2"/>
      <path d="M103 26 l-9 20 l11 13 l-11 2 M108 26 l4 21 l9 11 l-10 3" strokeWidth="2.3"/>
    </g>
  );
}

/* efecto: nada | 'rocas' | 'viento' | 'camion' | 'destello' ; temblor lo pone la clase del contenedor */
const enVertical = () => typeof window!=='undefined' && window.innerHeight > window.innerWidth*1.15;
/* pantalla: la escena llena la ventana y en vertical se reencuadra (campamento y fósil al centro). */
function Escena({hora='noche', efecto, paralaje, pantalla, cls=''}){
  const H = HORAS[hora] || HORAS.noche;
  const raiz = useRef(null);
  const [vert,setVert] = useState(()=>!!pantalla && enVertical());
  useEffect(()=>{
    if(!pantalla) return;
    const f = () => setVert(enVertical());
    window.addEventListener('resize', f);
    return ()=>window.removeEventListener('resize', f);
  },[pantalla]);
  const id = 'e'+hora;
  useEffect(()=>{
    if(!paralaje || quieto()) return;
    const el = raiz.current; if(!el) return;
    let raf = 0;
    const mover = e => {
      const x = (e.clientX/window.innerWidth-.5), y = (e.clientY/window.innerHeight-.5);
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(()=>{ el.style.setProperty('--px', x.toFixed(3)); el.style.setProperty('--py', y.toFixed(3)); });
    };
    window.addEventListener('pointermove', mover, {passive:true});
    return ()=>{ window.removeEventListener('pointermove', mover); cancelAnimationFrame(raf); };
  },[paralaje]);
  return (
    <svg ref={raiz} viewBox={vert ? '48 -25 200 410' : '0 0 400 300'} preserveAspectRatio="xMidYMid slice" aria-hidden="true"
      className={'escena-il '+cls}>
      <defs>
        <linearGradient id={id+'c'} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={H.cielo[0]}/><stop offset=".62" stopColor={H.cielo[1]}/><stop offset="1" stopColor={H.cielo[2]}/>
        </linearGradient>
        <radialGradient id={id+'h'}><stop offset="0" stopColor={H.halo} stopOpacity=".55"/><stop offset="1" stopColor={H.halo} stopOpacity="0"/></radialGradient>
        <radialGradient id={id+'f'}><stop offset="0" stopColor={H.farol} stopOpacity=".7"/><stop offset="1" stopColor={H.farol} stopOpacity="0"/></radialGradient>
        <linearGradient id={id+'v'} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#000" stopOpacity="0"/><stop offset="1" stopColor="#000" stopOpacity={H.velo+.3}/>
        </linearGradient>
      </defs>

      <rect y="-200" width="400" height="372" fill={'url(#'+id+'c)'}/>
      {H.estrellas>0 && <g opacity={H.estrellas}>{ESTRELLAS.map((s,i)=>
        <circle key={i} className="il-estrella" style={{animationDelay:s.d+'s'}} cx={s.x} cy={s.y} r={s.r} fill="#F4EFE4"/>)}</g>}
      <g className="il-capa" style={{'--k':4}} transform={vert ? 'translate(-80 36)' : undefined}>
        <circle cx="292" cy="62" r="62" fill={'url(#'+id+'h)'}/>
        <circle cx="292" cy="62" r="17" fill={H.astro}/>
        {hora==='noche' && <circle cx="299" cy="57" r="14.5" fill={H.cielo[1]} opacity=".92"/>}
      </g>
      <path className="il-capa" style={{'--k':8}} fill={H.lejos}
        d="M-20 172 V128 l34 -3 l10 -16 h46 l9 15 l52 4 l14 -22 h38 l12 20 l60 6 l16 -30 h52 l13 26 l48 5 l16 -12 h20 V172z"/>
      <path className="il-capa" style={{'--k':14}} fill={H.cerca}
        d="M-20 174 V150 q40 -14 84 -6 q46 9 92 -2 q52 -12 104 0 q60 12 160 -4 V174z"/>

      {/* campamento */}
      <g className="il-capa" style={{'--k':20}}>
        <circle className="il-farol" cx="118" cy="150" r="46" fill={'url(#'+id+'f)'}/>
        <path d="M58 168 l34 -42 l34 42z" fill={H.tienda}/>
        <path d="M92 126 l34 42 h-18z" fill={H.sombra} opacity=".28"/>
        <path d="M92 168 l-7 0 l7 -22 l7 22z" fill={H.sombra} opacity=".8"/>
        <path d="M92 126 v-12" stroke={H.tienda} strokeWidth="1.3"/>
        <path className="il-bandera" d="M92 114 l13 3.5 l-13 3.5z" fill="#B0775C"/>
        <path d="M118 168 v-20 M113 148 h10" stroke={H.sombra} strokeWidth="1.6" strokeLinecap="round"/>
        <rect x="115" y="149" width="6" height="8" rx="1.5" fill={H.farol}/>
        <rect x="136" y="158" width="15" height="10" fill="#8A6A45"/><path d="M136 162 h15 M143.5 158 v10" stroke={H.sombra} strokeWidth=".9" opacity=".6"/>
<path d="M236 169 l9 -31" stroke="#8A6A45" strokeWidth="2.2" strokeLinecap="round"/>
        <path d="M233 143 q12 -11 25 -2" stroke="#B9C0C6" strokeWidth="2.6" strokeLinecap="round" fill="none"/>
        <path d="M268 168 q14 -15 30 0z" fill="#B98E55"/>
        <path d="M321 168 v-11 M316 168 v-7 M326 168 v-8" stroke={H.cerca} strokeWidth="1.6" strokeLinecap="round"/>
        {efecto==='camion' && <g className="il-camion">
          <rect x="0" y="146" width="34" height="18" rx="2" fill="#C9AE83"/><rect x="34" y="151" width="15" height="13" rx="2" fill="#B0775C"/>
          <rect x="37" y="153.5" width="8" height="5" fill="#CFE0E8"/>
          <circle cx="10" cy="166" r="4.5" fill="#14161A"/><circle cx="40" cy="166" r="4.5" fill="#14161A"/>
        </g>}
      </g>

      {/* el corte: arena, arcilla, piedra */}
      <g className="il-corte">
        <path fill="#C9A56B" d="M0 168 q50 -3 100 0 t100 0 t100 0 t100 0 V420 H0z"/>
        <path fill="#A9603F" d="M0 204 q34 -7 70 -1 q46 8 96 0 q60 -9 118 1 q60 9 116 -2 V420 H0z"/>
        <path fill="#6C7781" d="M0 250 q60 -9 120 -1 q70 9 140 -2 q70 -10 140 2 V420 H0z"/>
        <g fill="#000" opacity=".13">{PIEDRAS.map((p,i)=><ellipse key={i} cx={p.x} cy={p.y} rx={p.r*1.5} ry={p.r}/>)}</g>
        <g fill="#FFF" opacity=".16">{MOTAS.map((m,i)=><circle key={i} cx={(m.x*1.7)%400} cy={176+(i*5)%24} r=".9"/>)}</g>
        <path d="M0 205 q34 -7 70 -1 q46 8 96 0 q60 -9 118 1 q60 9 116 -2" stroke="#000" strokeOpacity=".22" fill="none"/>
        <path d="M0 251 q60 -9 120 -1 q70 9 140 -2 q70 -10 140 2" stroke="#000" strokeOpacity=".28" fill="none"/>
        <g className="il-fosil" transform={vert ? 'translate(60 200) scale(.9)' : 'translate(94 206) scale(1.06)'}><Esqueleto color="#F1E7CE"/></g>
        <g fill="none" stroke="#F1E7CE" strokeWidth="1.6" opacity=".55" strokeLinecap="round">
          <path d="M40 270 q8 -7 16 0 q-8 7 -16 0z M48 263 v14"/>
          <path d="M330 268 a8 8 0 1 1 .1 0 M330 262 a3 3 0 1 1 .1 0"/>
          <path d="M352 222 l14 -5 M351 219 l1.5 6 M365 214 l1.5 6"/>
        </g>
        <rect y="168" width="400" height="252" fill={'url(#'+id+'v)'}/>
      </g>

      <g className="il-motas" fill={H.farol}>{MOTAS.map((m,i)=>
        <circle key={i} cx={m.x} cy={m.y} r={m.s*.7} style={{animationDelay:-m.d+'s'}}/>)}</g>
      {efecto==='rocas' && <g fill="#59636C">{[60,128,210,286,340].map((x,i)=>
        <path key={i} className="il-roca" style={{animationDelay:i*.13+'s'}} d={'M'+x+' -20 l12 -7 l11 6 l-2 13 l-13 5 l-10 -6z'}/>)}</g>}
      {efecto==='viento' && <g stroke="#E8CFA0" strokeWidth="1.4" strokeLinecap="round" fill="none">{[40,74,98,126,150,186].map((y,i)=>
        <path key={i} className="il-racha" style={{animationDelay:i*.17+'s'}} d={'M-80 '+y+' q40 -8 80 0 t80 0'}/>)}</g>}
      {efecto==='destello' && <rect className="il-destello" width="400" height="300" fill="#FFF"/>}
    </svg>
  );
}
Object.assign(FG.ui, {Escena, horaDe});
