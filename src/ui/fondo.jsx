// Fossilis · fondo de portada y escenas: el diorama 3D, y la ilustración SVG solo si el 3D no llega.
const {useState, useEffect} = React;
const {Escena, Diorama} = FG.ui;
const ESPERA_3D = 4500;   // ms antes de rendirse y enseñar la ilustración
let hay3D = null;          // lo aprendido en esta sesión: true, false o null (aún no se sabe)
function Fondo({hora, plano, paralaje}){
  const [estado,setEstado] = useState(hay3D===false ? 'fallo' : 'cargando');
  useEffect(()=>{
    if(estado!=='cargando') return;
    const t = setTimeout(()=>setEstado(e=>e==='cargando' ? 'tarde' : e), ESPERA_3D);
    return ()=>clearTimeout(t);
  },[]);
  const aviso = e => { hay3D = e==='listo'; setEstado(e); };
  const svg = estado==='fallo' || estado==='tarde';
  return <>
    <div className={'fondo-cielo'+(svg ? ' fuera' : '')} data-hora={hora}/>
    {svg && <div className="fondo-svg"><Escena pantalla hora={hora} paralaje={paralaje}/></div>}
    {hay3D!==false && <Diorama hora={hora} plano={plano} onEstado={aviso}/>}
  </>;
}
const sabe3D = () => hay3D;
Object.assign(FG.ui, {Fondo, sabe3D});
