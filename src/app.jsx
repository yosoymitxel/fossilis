const {useState, useEffect} = React;
const {setupGame} = FG.core;
const {Setup, Game} = FG.ui;
const {TemaCtx} = FG.fx;
function App(){
  const [g,setG] = useState(null);
  const [tema,setTema] = useState('gabinete');
  // Las capas fijas (fondo, textura, foco) leen los tokens del html.
  useEffect(()=>{
    const d = document.documentElement;
    if(tema==='gabinete') delete d.dataset.sala;
    else d.dataset.sala = tema;
  },[tema]);
  return (
    <TemaCtx.Provider value={[tema,setTema]}>
      {g ? <Game g={g} setG={setG} onRestart={()=>setG(null)}/>
         : <Setup onStart={cfg=>setG(setupGame(cfg))}/>}
    </TemaCtx.Provider>);
}
ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
