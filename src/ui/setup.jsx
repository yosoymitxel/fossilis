const {useState} = React;
const {COLORS} = FG.data;
const {TEX, Peon, Ico} = FG.ui;
const {irPantallaCompleta, useTema, salaDe, son} = FG.fx;
const BOTS = ['Anning','Cope','Marsh','Owen','Bakker'];
const REGLAS = [
  ['agresivas','Habilidades de enfrentamiento','Entran en la fila las habilidades que fastidian al rival'],
  ['lotes','Lotes y variedad al final','Puntos extra por colecciones variadas'],
  ['mayorias','Mayorías al final','Puntos para quien más tenga de cada cosa'],
];
function Setup({onStart, onVolver}){
  const [tema] = useTema();
  const [mesa,setMesa] = useState([{name:'Jugador 1', isAI:false},{name:BOTS[0], isAI:true},{name:BOTS[1], isAI:true}]);
  const [seed,setSeed] = useState(()=>Math.floor(Math.random()*99999));
  const [opts,setOpts] = useState({agresivas:true, lotes:true, mayorias:true});
  const humanos = mesa.filter(s=>!s.isAI).length;
  const libre = (bot, lista) => {
    const usados = lista.map(s=>s.name);
    if(bot) return BOTS.find(n=>!usados.includes(n)) || 'Bot';
    for(let k=1;;k++) if(!usados.includes('Jugador '+k)) return 'Jugador '+k;
  };
  const editar = (i, cambio) => setMesa(m=>m.map((s,k)=>k===i ? Object.assign({}, s, cambio) : s));
  const alternar = i => { son('ui'); setMesa(m=>{
    const resto = m.filter((_,k)=>k!==i);
    return m.map((s,k)=>k===i ? {isAI:!s.isAI, name:libre(!s.isAI, resto)} : s); }); };
  const sumar = () => { son('ui'); setMesa(m=>m.concat({isAI:true, name:libre(true, m)})); };
  const quitar = i => { son('ui'); setMesa(m=>m.filter((_,k)=>k!==i)); };

  const start = () => {
    irPantallaCompleta(); son('abrir');
    onStart({seed:Number(seed)||1, opts,
      players: mesa.map((s,i)=>({name:(s.name||'').trim() || (s.isAI?'Bot ':'Jugador ')+(i+1), isAI:s.isAI}))});
  };
  return (
    <div data-sala={salaDe('modular', tema)} className="pantalla min-h-[100svh] bg-esquisto text-hueso px-4 pt-5 pb-28 lg:py-10">
      <TEX/>
      <div className="w-full max-w-4xl mx-auto">
        <button onClick={onVolver} className="inline-flex items-center gap-1.5 min-h-11 pr-3 text-[14px] text-tenue hover:text-hueso transition-colors">
          <span aria-hidden="true" className="text-[18px] leading-none">←</span> Portada</button>
        <h1 className="disp font-extrabold text-[34px] lg:text-[52px] leading-[0.95] mt-1">Preparar la expedición</h1>
        <p className="text-hueso/75 text-[15px] mt-2 max-w-[52ch]">Sienta a la mesa de dos a cinco paleontólogos. Los asientos de bot juegan solos.</p>

        <div className="grid lg:grid-cols-[1.15fr_1fr] gap-4 lg:gap-6 mt-5 items-start">
          <section className="carta-fisica rounded-2xl p-3 lg:p-4 entra min-w-0">
            <h2 className="rotulo text-[11px] text-tenue px-1">La mesa · {mesa.length} de 5</h2>
            <ul className="grid gap-2 mt-2">
              {mesa.map((s,i)=>(
                <li key={i} className="flex items-center gap-2.5 rounded-xl border-[1.5px] border-borde bg-sedimento p-2">
                  <Peon color={COLORS[i]} letra={(s.name[0]||'?').toUpperCase()} s={32}/>
                  <input value={s.name} maxLength={14} size={1} onChange={e=>editar(i,{name:e.target.value})}
                    aria-label={'Nombre del asiento '+(i+1)}
                    className="min-w-0 flex-1 bg-transparent disp font-bold text-[16px] py-2 px-1 rounded-md"/>
                  <button onClick={()=>alternar(i)} disabled={!s.isAI && humanos<=1} aria-pressed={s.isAI}
                    title={!s.isAI && humanos<=1 ? 'Hace falta al menos una persona' : undefined}
                    className={'btn-fisico min-h-11 px-3 rounded-lg text-[13px] font-semibold border-[1.5px] shrink-0 '+
                      (s.isAI ? 'bg-esquisto text-hueso border-borde' : 'bg-cinta sobre-acento border-cinta')}>
                    {s.isAI ? 'Bot' : 'Persona'}</button>
                  <button onClick={()=>quitar(i)} disabled={mesa.length<=2 || (!s.isAI && humanos<=1)} aria-label={'Quitar a '+s.name}
                    className="w-9 h-11 rounded-lg text-[20px] leading-none text-tenue hover:text-hueso disabled:opacity-20 shrink-0">×</button>
                </li>))}
            </ul>
            {mesa.length<5 && <button onClick={sumar}
              className="mt-2 w-full min-h-11 rounded-xl border-[1.5px] border-dashed border-borde text-[14px] text-tenue hover:text-hueso hover:border-tenue transition-colors">
              + Añadir paleontólogo</button>}
          </section>

          <section className="carta-fisica rounded-2xl p-3 lg:p-4 entra min-w-0" style={{animationDelay:'.08s'}}>
            <h2 className="rotulo text-[11px] text-tenue px-1">Reglas</h2>
            {REGLAS.map(([k,t,d])=>(
              <button key={k} type="button" role="switch" aria-checked={opts[k]} onClick={()=>{ son('ui'); setOpts(o=>Object.assign({}, o, {[k]:!o[k]})); }}
                className="w-full flex items-center gap-3 py-2.5 px-1 min-h-11 text-left">
                <span className="flex-1 min-w-0"><span className="disp font-bold text-[14px] block">{t}</span>
                  <span className="text-[12px] text-tenue leading-snug block">{d}</span></span>
                <span className="palanca" aria-hidden="true"/>
              </button>))}
            <div className="flex items-center gap-2 py-2.5 px-1">
              <label htmlFor="semilla" className="flex-1 min-w-0"><span className="disp font-bold text-[14px] block">Semilla del montaje</span>
                <span className="text-[12px] text-tenue leading-snug block">El mismo número monta el mismo yacimiento</span></label>
              <input id="semilla" value={seed} onChange={e=>setSeed(e.target.value.replace(/\D/g,'').slice(0,6))} inputMode="numeric"
                className="w-24 bg-sedimento border-[1.5px] border-borde rounded-lg px-2.5 py-2 text-right text-[16px] tabular-nums"/>
              <button onClick={()=>{ son('yeso'); setSeed(Math.floor(Math.random()*99999)); }} aria-label="Otra semilla al azar"
                className="btn-fisico w-11 h-11 rounded-lg bg-sedimento border-[1.5px] border-borde flex items-center justify-center shrink-0"><Ico k="azar" s={19}/></button>
            </div>
            <div className="empezar">
              <button onClick={start} className="btn-fisico w-full bg-cinta sobre-acento disp font-extrabold text-[17px] py-3.5 rounded-xl active:scale-[.97] transition-transform">
                Abrir el yacimiento</button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
Object.assign(FG.ui, {Setup});
