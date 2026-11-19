const {useState, useEffect} = React;
const {setupGame, sembrar} = FG.core;
const {Portada, Setup, Game, Final, Momento} = FG.ui;
const {TemaCtx, AJUSTES, guardarAjustes, TEMAS, guardarPartida, partidaGuardada, quieto} = FG.fx;
function App(){
  const [g,setG] = useState(null);
  const [vista,setVista] = useState('portada');          // portada | setup (sin partida en curso)
  const [cierre,setCierre] = useState(false);            // la escena de cierre ya se vio
  const [tema,setTemaLocal] = useState(TEMAS.includes(AJUSTES.tema) ? AJUSTES.tema : 'gabinete');
  const setTema = t => { AJUSTES.tema = t; guardarAjustes(); setTemaLocal(t); };
  // Las capas fijas (fondo, textura, foco) leen los tokens del html.
  useEffect(()=>{
    const d = document.documentElement;
    if(tema==='gabinete') delete d.dataset.sala;
    else d.dataset.sala = tema;
  },[tema]);
  useEffect(()=>{ if(g) guardarPartida(g); },[g]);
  const salir = () => { setG(null); setCierre(false); setVista('portada'); };
  const continuar = () => {
    const s = partidaGuardada(); if(!s) return;
    sembrar((Date.now() ^ s.seed) >>> 0);                // el azar sigue, ya no desde la semilla original
    s.fx = null; s.reanudada = true; setG(s);
  };
  let pantalla;
  if(g && g.over) pantalla = !cierre && AJUSTES.cinematicas && !quieto()
    ? <Momento m={{k:'cierre'}} onFin={()=>setCierre(true)}/>
    : <Final g={g} onRestart={()=>{ setG(null); setCierre(false); setVista('setup'); }} onPortada={salir}/>;
  else if(g) pantalla = <Game g={g} setG={setG} onRestart={salir}/>;
  else if(vista==='setup') pantalla = <Setup onVolver={()=>setVista('portada')} onStart={cfg=>setG(setupGame(cfg))}/>;
  else pantalla = <Portada guardada={partidaGuardada()} onContinuar={continuar} onNueva={()=>setVista('setup')}/>;
  return <TemaCtx.Provider value={[tema,setTema]}>{pantalla}</TemaCtx.Provider>;
}
ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
// Marca de arranque: útil para comparar el cargador de desarrollo con juego.js.
if(typeof performance!=='undefined' && performance.mark) performance.mark('fossilis:listo');
console.info('Fossilis · listo en ' + Math.round(performance.now()) + ' ms');
