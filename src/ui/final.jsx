const {useRef, useEffect, useState} = React;
const {DINOS} = FG.data;
const {ERA_COL, eraDe, Silueta, TEX, Peon} = FG.ui;
const {MOT, useTema, salaDe, quieto, son} = FG.fx;
const {PASOS} = FG.core;
/* Cuenta de 0 al total mientras crecen las barras. */
function Cuenta({n}){
  const [v,setV] = useState(quieto() ? n : 0);
  useEffect(()=>{
    if(quieto()) return;
    let raf, t0 = null;
    const paso = t => { if(t0===null) t0 = t; const k = Math.min((t-t0-300)/1100, 1);
      setV(Math.round(n*Math.max(0, 1-Math.pow(1-k, 3)))); if(k<1) raf = requestAnimationFrame(paso); };
    raf = requestAnimationFrame(paso);
    return ()=>cancelAnimationFrame(raf);
  },[n]);
  return v;
}
function Final({g,onRestart,onPortada}){
  const [tema] = useTema();
  const w = g.breakdown[0];
  const max = Math.max(...g.breakdown.map(r=>r.total),1);
  const caja = useRef(null);
  useEffect(()=>{
    const m = MOT(); if(!m || !caja.current) return;
    m.animate(caja.current.querySelectorAll('[data-e]'),
      {opacity:[0,1], transform:['translateY(18px)','translateY(0px)']},
      {delay:m.stagger(0.07), duration:.5, ease:[.2,.9,.3,1]});
    m.animate(caja.current.querySelectorAll('[data-barra]'),
      {transform:['scaleX(0)','scaleX(1)']},
      {delay:m.stagger(0.09, {startDelay:.3}), duration:.9, type:'spring', bounce:.28});
  },[]);
  useEffect(()=>{ const t = setTimeout(()=>son('esqueleto'), 1300); return ()=>clearTimeout(t); },[]);

  return (
    <div data-sala={salaDe('seccion', tema)} className="pantalla min-h-[100svh] lg:h-[100svh] lg:overflow-y-auto flex items-center justify-center bg-esquisto text-hueso px-4 py-8">
      <div ref={caja} className="max-w-2xl w-full mx-auto">
        <TEX/>
        <div className="flex items-end gap-2 text-cinta/25 h-20 overflow-hidden">
          {['Tyrannosaurus rex','Triceratops','Pteranodon','Stegosaurus'].map(n=>{
            const d=DINOS.find(x=>x.name===n);
            return <span key={n} style={{color:ERA_COL[eraDe(d)], opacity:.5}}><Silueta d={d} s={64}/></span>;})}
        </div>
        <p data-e className="text-arena rotulo text-[13px] mt-4">Lámina final · se cierra el yacimiento</p>
        <h1 data-e className="disp font-extrabold text-[38px] lg:text-[52px] leading-tight mt-1 flex items-center gap-3">
          <span className="corona shrink-0"><Peon color={w.color} letra={w.name[0].toUpperCase()} s={52}/></span>Gana {w.name}</h1>
        <p className="text-tenue text-[13px] mt-1">{w.total} puntos y {w.dinos} dinosaurios en la colección.</p>

        <div className="mt-5 grid gap-2">
          {g.breakdown.map((r,i)=>(
            <div key={i} className="flex items-center gap-3">
              <span className="w-28 text-[13px] truncate flex items-center gap-1.5"><Peon color={r.color} letra={r.name[0].toUpperCase()} s={22}/>{r.name}</span>
              <div className="flex-1 h-6 bg-borde/10 rounded-md overflow-hidden">
                <div data-barra className="h-full rounded-md origin-left" style={{width:(100*r.total/max)+'%', background:r.color, opacity:.9}}/>
              </div>
              <span className="disp font-extrabold text-[17px] w-10 text-right tabular-nums"><Cuenta n={r.total}/></span>
            </div>))}
        </div>

        <details data-e className="carta-fisica cuaderno mt-6 rounded-xl p-3">
          <summary className="text-[13px] cursor-pointer">Ver el desglose de los nueve pasos</summary>
          <div className="overflow-x-auto scroll mt-3">
            <table className="w-full text-[13px] border-collapse">
              <thead><tr className="text-tenue">
                <th className={'text-left font-medium py-2 pr-3 border-b border-borde'/* taste-skill-ignore: separador de tabla real */}>Paso</th>
                {g.breakdown.map((r,i)=><th key={i} className={'text-right font-medium py-2 px-2 border-b border-borde'/* taste-skill-ignore: separador de tabla real */}><span style={{color:r.color}}><span className="sello-punto" style={{background:r.color}}/>{r.name}</span></th>)}
              </tr></thead>
              <tbody>
                {PASOS.map(([k,l])=>(
                  <tr key={k}>
                    <td className={'py-1.5 pr-3 border-b border-borde/50 text-hueso/80'/* taste-skill-ignore: separador de tabla real */}>{l}</td>
                    {g.breakdown.map((r,i)=><td key={i} className={'text-right py-1.5 px-2 border-b border-borde/50 '+(r.b[k]?'text-hueso':'text-tenue/40')/* taste-skill-ignore: separador de tabla real */}>{r.b[k]}</td>)}
                  </tr>))}
                <tr><td className="py-2 pr-3 disp font-bold">Total</td>
                  {g.breakdown.map((r,i)=><td key={i} className="text-right py-2 px-2 disp font-extrabold text-arena text-lg">{r.total}</td>)}</tr>
              </tbody>
            </table>
          </div>
        </details>

        <button data-e onClick={onRestart} className="btn-fisico mt-6 w-full bg-cinta sobre-acento disp font-extrabold text-lg py-3.5 rounded-xl active:scale-[.99] transition-transform">
          Otra excavación</button>
        <button data-e onClick={onPortada} className="mt-2 w-full min-h-11 rounded-xl border-[1.5px] border-borde text-[14px] text-hueso/80 hover:text-hueso transition-colors">
          Volver a la portada</button>
      </div>
    </div>
  );
}
Object.assign(FG.ui, {Final});
