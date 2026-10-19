const {useState, useEffect} = React;
const {AJUSTES, irPantallaCompleta, son, syncAnim, useTema} = FG.fx;
const {Ico, Hoja, Btn, Temas, NOTA_TEMA} = FG.ui;
function Pausa({onClose, verLog, onRestart}){
  const [tema] = useTema();
  const [aj,setAj] = useState({...AJUSTES});
  const cambiar = (k,v) => { AJUSTES[k]=v; setAj({...AJUSTES}); if(k==='sonido'&&v) son('turno'); if(k==='animacion') syncAnim(); };
  const [confirma,setConfirma] = useState(false);
  const [full,setFull] = useState(
    typeof document!=='undefined' && !!document.fullscreenElement);
  useEffect(()=>{
    const f = () => setFull(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', f);
    return ()=>document.removeEventListener('fullscreenchange', f);
  },[]);
  const alternar = () => {
    if(document.fullscreenElement){
      if(document.exitFullscreen) document.exitFullscreen();
    } else {
      irPantallaCompleta();
    }
  };
  const soporta = typeof document!=='undefined' &&
    !!(document.documentElement.requestFullscreen || document.documentElement.webkitRequestFullscreen);
  const Fila = ({icono, titulo, nota, accion, texto}) => (
    <button onClick={accion} disabled={!accion}
      className="w-full flex items-center gap-3 rounded-xl border border-borde p-3 text-left hover:border-tenue transition-colors disabled:opacity-40 active:scale-[.99]">
      <span className="w-10 h-10 rounded-lg bg-borde text-esquisto flex items-center justify-center shrink-0">
        <Ico k={icono} s={19}/></span>
      <span className="flex-1 min-w-0">
        <span className="disp font-bold text-[14px] block">{titulo}</span>
        <span className="text-[11px] text-tenue leading-snug">{nota}</span></span>
      {texto && <span className="text-[12px] text-cinta shrink-0">{texto}</span>}
    </button>
  );
  return (
    <Hoja title="Partida en pausa" sub="Nadie juega mientras esto esté abierto" sala="modular" onClose={onClose}>
      <div className="grid gap-2">
        <Fila icono={full?'salir':'pantalla'}
          titulo={full?'Salir de pantalla completa':'Pantalla completa'}
          nota={soporta ? 'El tablero ocupa toda la ventana' : 'Tu navegador no lo permite aquí'}
          accion={soporta ? alternar : null}/>
        <Fila icono={aj.sonido?'sonido':'mudo'} titulo={aj.sonido?'Sonido activado':'Sonido apagado'}
          nota="Golpes de terreno, arpegios al hallar hueso y avisos de evento"
          texto={aj.sonido?'Apagar':'Activar'} accion={()=>cambiar('sonido', !aj.sonido)}/>
        <Fila icono="mov" titulo={aj.animacion?'Animaciones activadas':'Animaciones apagadas'}
          nota="Apágalas si el movimiento te molesta o si el equipo va justo"
          texto={aj.animacion?'Apagar':'Activar'} accion={()=>cambiar('animacion', !aj.animacion)}/>
        <div className="rounded-xl border border-borde p-3">
          <span className="disp font-bold text-[14px] block">Tema</span>
          <div className="mt-2"><Temas/></div>
          <p className="text-[13px] text-tenue leading-snug mt-2">{NOTA_TEMA[tema]}</p>
        </div>
        <Fila icono="pausa" titulo="Ver el registro"
          nota="Todo lo que ha pasado, de lo último a lo primero" accion={verLog}/>
      </div>
      {confirma
        ? <div className="mt-3 rounded-xl border border-arcilla/50 bg-arcilla/10 p-3">
            <p className="text-[12px] text-hueso mb-2">Se pierde la excavación en curso. ¿Seguro?</p>
            <div className="flex gap-2">
              <Btn cls="flex-1" on={()=>setConfirma(false)}>No, seguir</Btn>
              <button onClick={onRestart} className="flex-1 py-2 rounded-lg bg-arcilla sobre-acento text-[13px] font-medium">Sí, abandonar</button>
            </div>
          </div>
        : <button onClick={()=>setConfirma(true)}
            className="w-full mt-3 py-2.5 rounded-xl border border-borde text-tenue text-[13px] hover:text-hueso hover:border-tenue transition-colors">
            Abandonar la partida</button>}
      <button onClick={onClose} className="btn-fisico bg-cinta sobre-acento w-full mt-3 py-3 rounded-xl disp font-bold text-[14px] active:scale-[.98] transition-transform">Seguir excavando</button>
    </Hoja>
  );
}
Object.assign(FG.ui, {Pausa});
