const {useState, useRef, useEffect} = React;
const {MOT, MUELLE, useTema, salaDe} = FG.fx;
function Hoja({title, sub, onClose, children, wide, col, sala='libreta'}){
  const panel = useRef(null), velo = useRef(null), previo = useRef(null);
  const [saliendo, setSaliendo] = useState(false);
  const conMotion = !!MOT();
  const [tema] = useTema();
  const salaFinal = salaDe(sala, tema);

  const cerrar = () => {
    const m = MOT();
    if(!m || !panel.current || saliendo) return onClose();
    setSaliendo(true);
    m.animate(velo.current, {opacity:[1,0]}, {duration:.2});
    m.animate(panel.current, {transform:['translateY(0px)','translateY(100%)']},
      {duration:.26, ease:[.4,0,1,1]}).finished.then(onClose, onClose);
  };

  useEffect(()=>{
    const m = MOT(); if(!m || !panel.current) return;
    m.animate(velo.current, {opacity:[0,1]}, {duration:.22});
    m.animate(panel.current, {transform:['translateY(100%)','translateY(0px)']}, MUELLE);
    const hijos = panel.current.querySelectorAll('.scroll > *');
    if(hijos.length) m.animate(hijos,
      {opacity:[0,1], transform:['translateY(16px)','translateY(0px)']},
      {delay:m.stagger(0.04), duration:.42, ease:[.2,.9,.3,1]});
  },[]);

  useEffect(()=>{
    previo.current = document.activeElement;
    if(panel.current) panel.current.focus();
    return ()=>{ const p = previo.current; if(p && p.focus && document.contains(p)) p.focus(); };
  },[]);

  useEffect(()=>{
    const k = e => {
      if(e.key==='Escape') return cerrar();
      if(e.key!=='Tab' || !panel.current) return;
      const f = panel.current.querySelectorAll('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])');
      if(!f.length) return;
      const first = f[0], last = f[f.length-1];
      if(e.shiftKey && (document.activeElement===first || document.activeElement===panel.current)){ e.preventDefault(); last.focus(); }
      else if(!e.shiftKey && document.activeElement===last){ e.preventDefault(); first.focus(); }
    };
    window.addEventListener('keydown',k); return ()=>window.removeEventListener('keydown',k);
  },[saliendo]);

  return (
    <div data-sala={salaFinal} className="fixed inset-0 z-50 flex items-end sm:items-center justify-center text-hueso">
      <div ref={velo} className={(conMotion?'':'velo ')+'velo-fondo absolute inset-0'} onClick={cerrar}/>
      <div ref={panel} role="dialog" aria-modal="true" aria-label={title} tabIndex={-1}
        className={(conMotion?'':'hoja ')+'carta-fisica cuaderno relative w-full '+(wide?'max-w-3xl':'max-w-lg')+' max-h-[88vh] flex flex-col rounded-t-2xl sm:rounded-2xl overflow-hidden outline-none'}
        style={{border:'2px solid rgb(var(--borde))'}}>
        <div className="flex items-center gap-3 px-4 py-3 shrink-0">
          <div className="min-w-0 flex-1">
            <h3 className="disp font-extrabold text-[17px] leading-tight truncate"><span className="sello-punto" style={{background: col || 'rgb(var(--acento))'}}/>{title}</h3>
            {sub && <p className="text-[12.5px] text-tenue leading-tight mt-0.5">{sub}</p>}
          </div>
          <button onClick={cerrar} aria-label="Cerrar"
            className="hoja-cerrar w-11 h-11 rounded-full flex items-center justify-center text-xl leading-none shrink-0">×</button>
        </div>
        <div className="overflow-y-auto scroll px-4 py-3 pb-6">{children}</div>
      </div>
    </div>
  );
}
Object.assign(FG.ui, {Hoja});
