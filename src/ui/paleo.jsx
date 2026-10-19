// Fossilis · paleoarte: retratos, siluetas, eras y emblemas.
const {Ic} = FG.ui;
/* ============================================================
   RETRATOS DE DINOSAURIOS — búsqueda en segundo plano, una
   sola vez por dino en toda la sesión. Se usan como fondo
   tenue de la carta, no como imagen principal.
   ============================================================ */
const IMG_URLS = new Map();
const IMG_PROM = new Map();

function preload(url){
  return new Promise(res => {
    const im = new Image();
    im.referrerPolicy = 'no-referrer';
    im.onload = () => res(true);
    im.onerror = () => res(false);
    im.src = url;
  });
}

function buscarDino(nombre){
  if(IMG_PROM.has(nombre)) return IMG_PROM.get(nombre);
  const slug = nombre.replace(/ /g, '_');
  const urls = [
    'https://en.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(slug),
    'https://es.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(slug),
  ];
  const p = (async () => {
    for(const api of urls){
      try {
        const r = await fetch(api, { redirect:'follow' });
        if(!r.ok) continue;
        const j = await r.json();
        const url = (j && j.thumbnail && j.thumbnail.source)
                 || (j && j.originalimage && j.originalimage.source)
                 || null;
        if(!url) continue;
        const ok = await preload(url);
        if(ok){ IMG_URLS.set(nombre, url); return url; }
      } catch(e){}
    }
    IMG_URLS.set(nombre, null);
    return null;
  })();
  IMG_PROM.set(nombre, p);
  return p;
}

const ARQ_NOMBRE = {
  Triceratops:'ceratopsiano', Stegosaurus:'acorazado', Ankylosaurus:'acorazado',
  Velociraptor:'raptor', Deinonychus:'raptor', Compsognathus:'raptor', Coelophysis:'raptor',
  Herrerasaurus:'raptor', Placerias:'cuadrupedo', Arizonasaurus:'cuadrupedo',
};
function arquetipo(d){
  if(ARQ_NOMBRE[d.name]) return ARQ_NOMBRE[d.name];
  if(d.chars.includes('aereo')) return 'pterosaurio';
  if(d.chars.includes('acuatico')) return 'marino';
  if(d.chars.includes('bipedo')) return d.chars.includes('carnivoro') ? 'teropodo' : 'ornitopodo';
  if(d.chars.includes('herbivoro')) return 'sauropodo';
  return 'cuadrupedo';
}
const Silueta = ({d, s=54, cls=''}) => <Ic k={arquetipo(d)} s={s} cls={cls}/>;

const ERA_COL  = {triasico:'#F0685E', jurasico:'#2FC08A', cretacico:'#5AA9F0'};
const EraIco = ({era, s=17, col='#8A9BA0'}) => (
  <svg viewBox="0 0 16 16" width={s} height={s} aria-hidden="true" style={{color:col}} fill="currentColor">
    {era==='triasico' && <path d="M8 4.6l5.4 9H2.6L8 4.6zM8 1.3l1 1.6-1 1.6-1-1.6z"/>}
    {era==='jurasico' && <path d="M8 1.6l3.1 4.2h-1.8l2.8 3.8h-2.4v2.6H6.3v-2.6H3.9l2.8-3.8H4.9L8 1.6z"/>}
    {era==='cretacico' && <path d="M8 1.5v13M2.4 4.7l11.2 6.6M13.6 4.7L2.4 11.3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" fill="none"/>}
  </svg>
);
const Rayo = ({s=10}) => (
  <svg viewBox="0 0 16 16" width={s} height={s} aria-hidden="true" fill="currentColor"
    style={{display:'inline-block',verticalAlign:'-1px',margin:'0 1px'}}>
    <path d="M9.6 1 3.4 9h3.1L6 15l6.6-8.3H9.4L9.6 1z"/>
  </svg>
);
const AvisoIco = ({s=12}) => (
  <svg viewBox="0 0 16 16" width={s} height={s} aria-hidden="true" fill="currentColor">
    <path d="M8 1.6l7 12.4H1L8 1.6zm-.8 5v3.4h1.6V6.6H7.2zm0 4.4v1.6h1.6v-1.6H7.2z" fillRule="evenodd"/>
  </svg>
);
const eraDe = d => d.chars.find(c=>ERA_COL[c]) || 'jurasico';
const modo = d => d.chars.includes('aereo') ? 'Vuelo' : d.chars.includes('acuatico') ? 'Nado'
            : d.chars.includes('bipedo') ? 'Dos patas' : 'Cuatro patas';
const rol  = d => d.chars.includes('carnivoro') ? 'Depredador' : 'Herbívoro';

const Emblema = ({d, s=86, valor}) => {
  const c = ERA_COL[eraDe(d)];
  return (
    <div className="relative shrink-0" style={{width:s, height:s}}>
      <div className="w-full h-full rounded-full flex items-center justify-center overflow-hidden"
        style={{background:c+'1F', border:'2.5px solid '+c, color:c,
                boxShadow:'inset 0 2px 4px rgba(0,0,0,.4), 0 3px 6px rgba(0,0,0,.5)'}}>
        <Ic k={arquetipo(d)} s={s*0.62}/>
      </div>
      {valor!==undefined && (
        <span className="absolute -bottom-1 -right-1 min-w-[26px] h-[26px] px-1.5 rounded-full flex items-center justify-center disp font-extrabold text-[13px] border-2 border-esquisto"
          style={{background:c, color:'#0C1112', boxShadow:'0 3px 0 rgba(0,0,0,.4)'}}>{valor}</span>)}
    </div>
  );
};

const HUECOS = {
  1:[[50,50]],
  2:[[33,36],[67,64]],
  3:[[31,32],[70,38],[47,72]],
  4:[[30,29],[71,31],[28,71],[70,70]],
};
const mezcla = (a,b) => { let h=(a*73856093)^(b*19349663); h=(h^(h>>>13))>>>0; return h; };
function repartir(items, cell){
  const n = Math.min(items.length,4);
  const pos = HUECOS[n] || HUECOS[4];
  return items.slice(0,4).map((o,i)=>{
    const h = mezcla(cell+1, i+7);
    return {o, x:pos[i][0]+(h%7)-3, y:pos[i][1]+((h>>3)%7)-3, rot:((h>>6)%56)-28};
  });
}
Object.assign(FG.ui, {buscarDino, IMG_URLS, IMG_PROM, preload, ARQ_NOMBRE, arquetipo, Silueta, ERA_COL, EraIco, eraDe, modo, rol, Emblema, HUECOS, repartir, Rayo, AvisoIco});
