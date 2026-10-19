const {useState, useRef, useEffect} = React;
const {DINOS} = FG.data;
const {Silueta, TEX, Temas, NOTA_TEMA, NOMBRE_TEMA} = FG.ui;
const {MOT, irPantallaCompleta, useTema, salaDe} = FG.fx;
function Setup({onStart}){
  const [tema] = useTema();
  const [n,setN] = useState(3);
  const [bots,setBots] = useState(2);
  const [seed,setSeed] = useState(()=>Math.floor(Math.random()*99999));
  const [opts,setOpts] = useState({agresivas:true, lotes:true, mayorias:true});
  const humans = n - Math.min(bots,n-1);

  const start = () => {
    irPantallaCompleta();
    onStart({seed:Number(seed)||1, opts,
      players: Array.from({length:n},(_,i)=>({name: i<humans?'Jugador '+(i+1):'Bot '+(i-humans+1), isAI:i>=humans}))});
  };

  const Row = ({label, children}) => (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-3">
      <span className="text-[16px] text-hueso/90">{label}</span>{children}</div>);
  const caja = useRef(null);
  useEffect(()=>{
    const m = MOT(); if(!m || !caja.current) return;
    m.animate(caja.current.querySelectorAll('[data-e]'),
      {opacity:[0,1], transform:['translateY(18px)','translateY(0px)']},
      {delay:m.stagger(0.06), duration:.5, ease:[.2,.9,.3,1]});
    const sil = caja.current.querySelectorAll('[data-sil]');
    if(sil.length) m.animate(sil, {opacity:[0,.55], transform:['translateY(26px) scale(.9)','translateY(0px) scale(1)']},
      {delay:m.stagger(0.1, {startDelay:.15}), duration:.7, type:'spring', bounce:.34});
  },[]);
  const Pick = ({v, set, vals}) => <div className="flex gap-1">{vals.map(k=>
    <button key={k} onClick={()=>set(k)} aria-pressed={v===k}
      className={'w-11 h-11 rounded-lg text-[15px] disp font-bold transition-colors btn-fisico '+(v===k?'bg-cinta sobre-acento':'bg-sedimento text-hueso border-[1.5px] border-borde hover:bg-borde/10')}>{k}</button>)}</div>;
  return (
    <div ref={caja} data-sala={salaDe('modular', tema)} className="min-h-[100svh] bg-esquisto text-hueso px-4 py-6 flex items-center justify-center">
      <TEX/>
      <div className="w-full max-w-5xl">
        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-6 lg:gap-14 items-center">
          <div className="min-w-0">
            <div className="relative h-24 lg:h-36 -mb-2 overflow-hidden">
              <div className="absolute inset-0 flex items-end justify-center gap-2 origin-bottom lg:scale-[1.3]">
                {[['Stegosaurus',56],['Tyrannosaurus rex',88],['Pteranodon',52]].map(([n,s])=>{
                  const d=DINOS.find(x=>x.name===n);
                  return <span key={n} data-sil style={{color:'rgb(var(--tinta))', opacity:.16}}><Silueta d={d} s={s}/></span>;})}
              </div>
              <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-esquisto to-transparent"/>{/* taste-skill-ignore: niebla del hero sobre las siluetas */}
            </div>
            <h1 data-e className="disp font-extrabold text-[44px] sm:text-[54px] lg:text-[80px] xl:text-[100px] leading-[0.92] mt-1">Fossilis</h1>
            <p data-e className="text-hueso/80 text-[16px] mt-3 leading-relaxed max-w-[46ch]">
              Yacimiento abierto. Cinco por cinco casillas de arena, arcilla y piedra. Debajo hay cuarenta y cinco huesos
              que nadie ha visto. Empuja el terreno, gasta yeso y llévate el esqueleto antes que el resto.
            </p>
          </div>
          <div data-e className="carta-fisica rounded-2xl p-4 lg:p-5">
            <details className="pb-1">
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3">
                <span className="text-[16px] text-hueso/90">Tema</span>
                <span className="inline-flex items-center gap-2 text-[13px] text-tenue">
                  {NOMBRE_TEMA[tema]}<span className="text-hueso/70">Elegir</span></span>
              </summary>
              <div className="mt-1"><Temas/></div>
              <p className="text-[13px] text-tenue leading-snug mt-2">{NOTA_TEMA[tema]}</p>
            </details>
            <Row label="Paleontólogos"><Pick v={n} set={k=>{setN(k);setBots(Math.min(bots,k-1));}} vals={[2,3,4,5]}/></Row>
            <Row label="De ellos, bots"><Pick v={bots} set={setBots} vals={Array.from({length:n},(_,k)=>k)}/></Row>
            <Row label="Habilidades de enfrentamiento">
              <input type="checkbox" checked={opts.agresivas} onChange={e=>setOpts({...opts,agresivas:e.target.checked})} className="w-6 h-6 accent-cinta"/></Row>
            <Row label="Lotes y variedad al final">
              <input type="checkbox" checked={opts.lotes} onChange={e=>setOpts({...opts,lotes:e.target.checked})} className="w-6 h-6 accent-cinta"/></Row>
            <Row label="Mayorías al final">
              <input type="checkbox" checked={opts.mayorias} onChange={e=>setOpts({...opts,mayorias:e.target.checked})} className="w-6 h-6 accent-cinta"/></Row>
            <Row label="Semilla del montaje">
              <input value={seed} onChange={e=>setSeed(e.target.value)} inputMode="numeric" aria-label="Semilla del montaje"
                className="w-28 bg-sedimento border-[1.5px] border-borde rounded-lg px-2.5 py-2 text-right text-[16px]"/></Row>
            <button onClick={start} className="btn-fisico mt-4 w-full bg-cinta sobre-acento disp font-extrabold text-[16px] py-3 rounded-xl active:scale-[.99] transition-transform">
              Abrir el yacimiento</button>
          </div>
        </div>
        <p className="text-[16px] text-hueso/75 mt-6 leading-relaxed text-center max-w-[64ch] mx-auto">
          Adaptación personal del juego de David Díaz publicado por Kids Table Board Gaming.
          Sin ánimo de lucro y sin material del editor. Siluetas e iconos de Lorc, Delapouite y
          Caro Asercion (game-icons.net), bajo licencia CC BY 3.0. Retratos en miniatura servidos
          por Wikipedia/Wikimedia Commons (CORS abierto).
        </p>
      </div>
    </div>
  );
}
Object.assign(FG.ui, {Setup});
