const {useState, useEffect, useMemo} = React;
const {CHAR, BONE} = FG.data;
const {EraIco, Emblema, eraDe, ERA_COL, buscarDino, IMG_URLS, rol, modo} = FG.ui;
const {Bone, Hammer, Yeso, Ico} = FG.ui;
const {Btn, Coste} = FG.ui;
const {chispasEn, flotanteEn, PALETA} = FG.fx;
/* ============================================================
   DinoCard · retrato de campo pegado con cinta sobre la ficha,
   con el emblema del yacimiento sellado en la esquina.
   ============================================================ */
function DinoCard({d, children, compact}){
  if(!d) return <div className="carta-fisica cuaderno rounded-2xl p-6 text-tenue text-[13px] text-center">Mazo agotado</div>;
  const era = eraDe(d), c = ERA_COL[era];

  const [imgUrl, setImgUrl] = useState(() => IMG_URLS.has(d.name) ? IMG_URLS.get(d.name) : null);
  const [falla, setFalla] = useState(false);

  useEffect(()=>{
    setFalla(false);
    if(IMG_URLS.has(d.name)){
      const u = IMG_URLS.get(d.name);
      if(u !== imgUrl) setImgUrl(u);
      return;
    }
    let vivo = true;
    buscarDino(d.name).then(u => { if(vivo) setImgUrl(u); });
    return ()=>{ vivo = false; };
  }, [d.name]);

  return (
    <div className="carta-fisica cuaderno relative rounded-2xl p-3 pt-2.5 flex flex-col items-center text-center overflow-hidden"
      style={{border:'1.5px solid '+c+'88'}}>

      <div className="w-full flex items-start justify-between gap-2">
        <span className="px-2 py-1 rounded-md text-[10px] font-medium tracking-wide"
          style={{border:'1.5px solid '+c+'80', color:c, background:c+'0F'}}>{CHAR[era].es}</span>
        <EraIco era={era}/>
      </div>

      <div className="relative mt-3 w-full">
        <div className="retrato w-full" style={{height: compact?96:150}}>
          {imgUrl && !falla
            ? <img
                key={imgUrl}
                src={imgUrl}
                alt=""
                aria-hidden="true"
                className="pointer-events-none select-none"
                onError={()=>setFalla(true)}
                style={{objectFit:'cover', width:'100%', height:'100%'}}/>
            : <span className="mano text-[15px] leading-snug text-tenue px-3">retrato en preparación</span>}
        </div>
        <div className="absolute bottom-1.5 right-1.5" style={{zIndex:2}}>
          <Emblema d={d} s={compact?50:58} valor={d.perfect}/>
        </div>
      </div>

      <h4 className="disp font-extrabold text-[19px] leading-tight mt-2.5 relative" style={{color:c, zIndex:1}}>{d.name}</h4>
      <p className="text-[12px] text-tenue mt-0.5 relative" style={{zIndex:1}}>{rol(d)} · {modo(d)}</p>

      <div className="mt-2.5 flex flex-wrap justify-center gap-1.5 relative" style={{zIndex:1}}>
        {d.bones.map((b,i)=>{
          const puesto = d.assigned && d.assigned.filter(x=>x===b).length >= d.bones.slice(0,i+1).filter(x=>x===b).length;
          return <span key={i} className={'flex items-center gap-1 px-2 py-1 rounded-lg border text-[11px] '+(puesto?'font-medium':'border-borde text-hueso/55')}
            style={puesto?{borderColor:c, color:c, background:c+'1A'}:{}}>
            <Bone t={b} s={13}/> {BONE[b].es} <span className="opacity-55">{BONE[b].val}</span></span>;
        })}
      </div>

      {!compact && <p className="mt-2.5 text-[11px] leading-snug text-tenue max-w-[46ch] relative" style={{zIndex:1}}>{d.fact}</p>}

      {children && <div className="w-full mt-3 grid gap-1.5 relative" style={{zIndex:1}}>{children}</div>}
    </div>
  );
}

function MarketCard({c, canBuy, on}){
  const herr = c.kind==='tool';
  return (
    <div className="carta-fisica rounded-xl p-3 flex gap-3 relative overflow-hidden"
      style={{border:'1.5px solid '+ (herr ? 'rgb(var(--piedra) / .5)' : 'rgb(var(--arena) / .55)')}}>
      <div className={'w-10 h-10 rounded-lg shrink-0 flex items-center justify-center border-[1.5px] '+(herr?'bg-piedra/15 text-piedra border-piedra/40':'bg-arena/15 text-arena border-arena/40')}>
        {herr ? <Hammer s={20}/> : <Yeso s={20}/>}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <h4 className="disp font-bold text-[14px] leading-tight">{c.n}</h4>
          {c.vp>0 && <span className="text-[11px] text-tenue shrink-0">{c.vp} PV</span>}
        </div>
        <p className="text-[11px] leading-snug text-hueso/75 mt-0.5">{c.d}</p>
        <div className="flex items-center justify-between gap-2 mt-2">
          <span className="text-[14px] text-cinta tracking-wide flex items-center"><Coste c={c.cost}/></span>
          <Btn on={e=>{chispasEn(e.currentTarget,'compra'); flotanteEn(e.currentTarget, c.n, PALETA.compra[0]); on();}}
            dis={!canBuy} tone={canBuy?'p':'n'}>Comprar</Btn>
        </div>
      </div>
    </div>
  );
}
Object.assign(FG.ui, {DinoCard, MarketCard});
