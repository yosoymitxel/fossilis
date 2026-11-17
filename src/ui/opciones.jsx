// Fossilis · opciones compartidas por la portada y la pausa. Todo se guarda al tocarlo.
const {useState, useEffect} = React;
const {AJUSTES, guardarAjustes, irPantallaCompleta, son, syncAnim, useTema, volumen, ambiente} = FG.fx;
const {Ico, Temas, NOTA_TEMA} = FG.ui;
const RITMOS = [['lento','Pausado'],['normal','Normal'],['rapido','Rápido']];
const Grupo = ({titulo, children}) => (
  <section className="rounded-xl border border-borde p-3">
    <h4 className="rotulo text-[11px] text-tenue mb-1">{titulo}</h4>{children}</section>);
const Palanca = ({on, titulo, nota, dis, cambiar}) => (
  <button type="button" role="switch" aria-checked={!!on} disabled={dis} onClick={cambiar}
    className="w-full flex items-center gap-3 py-2 min-h-11 text-left disabled:opacity-40">
    <span className="flex-1 min-w-0">
      <span className="disp font-bold text-[14px] block">{titulo}</span>
      <span className="text-[12px] text-tenue leading-snug block">{nota}</span></span>
    <span className="palanca" aria-hidden="true"/>
  </button>);
function Opciones(){
  const [tema] = useTema();
  const [aj,setAj] = useState({...AJUSTES});
  const cambiar = (k,v) => {
    AJUSTES[k] = v; guardarAjustes(); setAj({...AJUSTES});
    if(k==='animacion') syncAnim();
    if(k==='volumen') volumen();
    if(k==='sonido' || k==='ambiente') ambiente();
    if(k!=='volumen') son('ui');
  };
  const [full,setFull] = useState(typeof document!=='undefined' && !!document.fullscreenElement);
  useEffect(()=>{
    const f = () => setFull(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', f);
    return ()=>document.removeEventListener('fullscreenchange', f);
  },[]);
  const soporta = typeof document!=='undefined' &&
    !!(document.documentElement.requestFullscreen || document.documentElement.webkitRequestFullscreen);
  const alternar = () => document.fullscreenElement
    ? (document.exitFullscreen && document.exitFullscreen()) : irPantallaCompleta();

  return (
    <div className="grid gap-2">
      <Grupo titulo="Sonido">
        <Palanca on={aj.sonido} cambiar={()=>cambiar('sonido', !aj.sonido)} titulo="Efectos" nota="Golpes de terreno, hallazgos y avisos de evento"/>
        <label className="flex items-center gap-3 py-1">
          <span className="text-tenue shrink-0"><Ico k={aj.sonido && aj.volumen>0 ? 'sonido' : 'mudo'} s={18}/></span>
          <input type="range" min="0" max="1" step="0.05" value={aj.volumen} disabled={!aj.sonido} aria-label="Volumen"
            onChange={e=>cambiar('volumen', Number(e.target.value))} onPointerUp={()=>son('yeso')}
            className="desliza disabled:opacity-40"/>
          <span className="text-[12px] text-tenue w-9 text-right tabular-nums">{Math.round(aj.volumen*100)}</span>
        </label>
        <Palanca on={aj.ambiente} cambiar={()=>cambiar('ambiente', !aj.ambiente)} titulo="Ambiente del campamento" nota="Viento y notas sueltas de fondo" dis={!aj.sonido}/>
      </Grupo>
      <Grupo titulo="Imagen y movimiento">
        <Palanca on={aj.animacion} cambiar={()=>cambiar('animacion', !aj.animacion)} titulo="Animaciones" nota="Apágalas si el movimiento molesta o el equipo va justo"/>
        <Palanca on={aj.cinematicas} cambiar={()=>cambiar('cinematicas', !aj.cinematicas)} titulo="Escenas intermedias" nota="Apertura, eventos, hallazgos y cierre a pantalla completa"/>
        {soporta && <button type="button" onClick={alternar} className="w-full flex items-center gap-3 py-2 min-h-11 text-left">
          <span className="flex-1 disp font-bold text-[14px]">{full ? 'Salir de pantalla completa' : 'Pantalla completa'}</span>
          <span className="text-cinta"><Ico k={full?'salir':'pantalla'} s={19}/></span></button>}
      </Grupo>
      <Grupo titulo="Partida">
        <div className="py-2">
          <span className="disp font-bold text-[14px] block">Ritmo de los bots</span>
          <div className="flex gap-1 mt-1.5" role="group" aria-label="Ritmo de los bots">
            {RITMOS.map(([k,n])=><button key={k} type="button" aria-pressed={aj.ritmo===k} onClick={()=>cambiar('ritmo',k)}
              className={'btn-fisico flex-1 min-h-11 rounded-lg text-[13px] font-semibold border-[1.5px] transition-colors '+
                (aj.ritmo===k ? 'bg-cinta sobre-acento border-cinta' : 'bg-sedimento text-hueso border-borde')}>{n}</button>)}
          </div>
        </div>
        <Palanca on={aj.pistas} cambiar={()=>cambiar('pistas', !aj.pistas)} titulo="Pistas de aprendizaje" nota="Consejos que aparecen la primera vez que algo ocurre"/>
      </Grupo>
      <Grupo titulo="Tema">
        <div className="mt-1.5"><Temas/></div>
        <p className="text-[13px] text-tenue leading-snug mt-2">{NOTA_TEMA[tema]}</p>
      </Grupo>
    </div>);
}
Object.assign(FG.ui, {Opciones});
