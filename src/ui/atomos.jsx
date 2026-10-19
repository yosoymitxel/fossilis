const {useRef, useEffect} = React;
const {FR} = FG.data;
const {FragIc, EraIco, eraDe, Ic, Ico} = FG.ui;
const {MOT} = FG.fx;
const Coste = ({c, s=13}) => {
  const ks = FR.concat('comodin').filter(k=>c[k]);
  if(!ks.length) return <span className="text-tenue">—</span>;
  return <span className="inline-flex items-center gap-1.5">{ks.map(k=><span key={k} className="inline-flex items-center gap-0.5">{c[k]}<FragIc f={k} s={s}/></span>)}</span>;
};

const Btn = ({on, dis, children, tone='n', cls=''}) => (
  <button onClick={on} disabled={dis}
    className={'px-3 py-2 rounded-lg text-[13px] font-medium transition-[transform,color,background-color,border-color,opacity,filter,box-shadow] active:scale-[.97] disabled:opacity-30 disabled:cursor-not-allowed disabled:active:scale-100 inline-flex items-center justify-center gap-1.5 btn-fisico '+
      (tone==='p' ? 'bg-cinta sobre-acento hover:brightness-110 ' : tone==='g' ? 'border-[1.5px] border-borde text-tenue hover:text-hueso hover:border-tenue ' : 'bg-borde sobre-borde hover:brightness-110 ')+cls}>
    {children}
  </button>
);
const Frags = ({t, s=12}) => <span className="inline-flex items-center gap-[2px]">{t.frags.map((f,i)=><FragIc key={i} f={f} s={s}/>)}</span>;

const Peon = ({color, letra, s=24, activo}) => (
  <svg viewBox="0 0 24 24" width={s} height={s} aria-hidden="true"
    className={'ficha '+(activo?'late':'')}>
    <circle cx="12" cy="13" r="8.6" fill={color} stroke="#0C1112" strokeWidth="2.2"/>
    <path d="M3.2 9.4c0-4.1 3.9-6.8 8.8-6.8s8.8 2.7 8.8 6.8z" fill="#0C1112" opacity=".9"/>
    <path d="M12 2.6c4.9 0 8.8 2.7 8.8 6.8h-2.2c0-3-2.9-5-6.6-5z" fill="#ffffff" opacity=".25"/>
    <text x="12" y="17.8" textAnchor="middle" fontSize="8.6" fontWeight="800" fill="#0C1112"
      fontFamily="Archivo, sans-serif">{letra}</text>
  </svg>
);

const BtnEra = ({color, on, dis, children}) => (
  <button onClick={on} disabled={dis}
    className="w-full py-3 rounded-xl disp font-bold text-[14px] transition-[transform,color,background-color,border-color,opacity,filter,box-shadow] active:scale-[.98] disabled:opacity-30 disabled:active:scale-100 btn-fisico"
    style={{background:color, color:'#0C1112'}}>{children}</button>
);
const BtnEraSec = ({color, on, dis, children}) => (
  <button onClick={on} disabled={dis}
    className="w-full py-2.5 rounded-xl font-medium text-[13px] transition-[transform,color,background-color,border-color,opacity,filter,box-shadow] active:scale-[.98] disabled:opacity-30"
    style={{border:'1.5px solid '+color+'99', color:color}}>{children}</button>
);

function Banda({banda}){
  const el = useRef(null);
  useEffect(()=>{
    const m = MOT(); if(!m || !el.current) return;
    m.animate(el.current, {transform:['translateY(-100%)','translateY(0px)']}, {type:'spring', stiffness:380, damping:30});
    const t = setTimeout(()=>{ if(el.current) m.animate(el.current,
      {transform:['translateY(0px)','translateY(-100%)']}, {duration:.3, ease:[.4,0,1,1]}); }, 1250);
    return ()=>clearTimeout(t);
  },[]);
  return <div ref={el} className={(MOT()?'':'banda ')+'fixed top-0 inset-x-0 z-[60] py-3 text-center'}
    style={{background:banda.color, color:'#0C1112', boxShadow:'0 6px 0 rgba(0,0,0,.4), 0 14px 22px -8px rgba(0,0,0,.8)'}}>
    <span className="disp font-extrabold text-[17px]">{banda.texto}</span></div>;
}

const BtnJ = ({on, dis, children, cls=''}) => (
  <button onClick={on} disabled={dis}
    className={'btn-fisico bg-cinta sobre-acento py-3 px-4 rounded-xl disp font-bold text-[14px] transition-[transform,color,background-color,border-color,opacity,filter,box-shadow] active:scale-[.98] disabled:opacity-30 inline-flex items-center justify-center gap-2 '+cls}>{children}</button>
);
const FICHAS_TEMA = [
  {id:'gabinete', nombre:'Gabinete', fondo:'#0D0F10', luz:'#CFE0E8', cuatro:['#0D0F10','#EAE7E1','#E7DEC6','#F1EDE3']},
  {id:'vitrina', nombre:'Vitrina', fondo:'#0D0F10', luz:'#CFE0E8'},
  {id:'modular', nombre:'Modular', fondo:'#EAE7E1', luz:'#3E7C8F'},
  {id:'libreta', nombre:'Libreta', fondo:'#E7DEC6', luz:'#A6382C'},
  {id:'seccion', nombre:'Sección', fondo:'#F1EDE3', luz:'#E4B054'},
];
const NOTA_TEMA = {
  gabinete:'Cada pantalla en su sala: vitrina, sistema, libreta y sección.',
  vitrina:'Toda la app en la sala a oscuras: luz de lámpara, vidrio y latón.',
  modular:'Toda la app en piso claro: bloques rectos y teja.',
  libreta:'Toda la app en papel pautado: grafito y rojo lápiz.',
  seccion:'Toda la app en cal: carbón, líneas y luz de sol.',
};
const NOMBRE_TEMA = Object.fromEntries(FICHAS_TEMA.map(t=>[t.id,t.nombre]));
function Temas(){
  const [tema,setTema] = FG.fx.useTema();
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Tema de la app">
      {FICHAS_TEMA.map(t=>{
        const on = tema===t.id;
        return (
          <button key={t.id} type="button" data-tema={t.id} aria-pressed={on}
            onClick={()=>setTema(t.id)}
            className={'btn-fisico min-h-11 inline-flex items-center gap-2 pl-2 pr-3 py-2 rounded-lg border-[1.5px] transition-colors '+
              (on ? 'bg-cinta sobre-acento border-cinta' : 'bg-sedimento text-hueso border-borde hover:bg-borde/10')}>
            <span className="inline-flex items-center justify-center gap-[2px] w-5 h-5 rounded border border-borde/40 shrink-0"
              style={{background:t.fondo}} aria-hidden="true">
              {t.cuatro
                ? t.cuatro.map(c=><span key={c} className="w-[3px] h-2.5 rounded-[1px]" style={{background:c}}/>)
                : <span className="w-1.5 h-1.5 rounded-full" style={{background:t.luz}}/>}
            </span>
            <span className="disp font-semibold text-[13px] leading-none">{t.nombre}</span>
          </button>);
      })}
    </div>);
}
Object.assign(FG.ui, {Coste, Btn, Frags, Peon, BtnEra, BtnEraSec, Banda, BtnJ, Temas, NOTA_TEMA, NOMBRE_TEMA});
