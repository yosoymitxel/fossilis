const {MAT} = FG.data;
const {DIR_ES} = FG.core;
const {Ic, Bone, TEX_URL} = FG.ui;
const {Peon, Frags} = FG.ui;
const {repartir} = FG.ui;
function Cell({g, i, hi, dim, onClick, arrows, onArrow}){
  const stack = g.cells[i];
  const pawn = g.players.find(p=>p.pos===i);
  const open = stack.length===0;
  const top = stack[stack.length-1];
  const piezas = open ? repartir(g.pits[i], i) : [];
  return (
    <div className="celda-3d relative aspect-square" data-cell={i}>
      <div className={'capa w-full h-full '+(dim?'opacity-25':'')}>
        <div onClick={onClick} role={onClick?'button':undefined} tabIndex={onClick?0:-1}
          aria-label={open ? 'Fosa abierta, '+(g.pits[i].length ? g.pits[i].length+(g.pits[i].length===1?' pieza':' piezas') : 'vacía') : 'Loseta de '+MAT[top.mat].es+(stack.length===2?', apilada':'')+(pawn?', con '+pawn.name: '')}
          aria-disabled={onClick&&dim?true:undefined}
          onKeyDown={e=>{if(onClick&&(e.key==='Enter'||e.key===' ')){e.preventDefault();onClick();}}}
          data-tile={open?undefined:top.id}
          className={(open?'pit':'tile '+(stack.length===2?'h2':'h1'))+' relative w-full h-full '+(onClick?'pickable ':'')+(hi?'pulso ':'')}
          style={Object.assign({}, open?{}:{background:MAT[top.mat].bg, color:MAT[top.mat].fg},
            hi?{outline:'2.5px solid rgb(var(--acento))', outlineOffset:'1px'}:{})}>
          {!open && <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <rect width="100%" height="100%" fill={TEX_URL[top.mat]}/>
            <rect width="100%" height="100%" fill="url(#grBrillo)"/></svg>}
          {open
            ? <>{piezas.map((p,k)=>(
                  <span key={k} className="absolute ficha text-hueso/90"
                    style={{left:p.x+'%', top:p.y+'%', transform:'translate(-50%,-50%) rotate('+p.rot+'deg)'}}>
                    {p.o==='martillo' ? <Ic k="martillo" s={14}/> : <Bone t={p.o} s={14}/>}</span>))}
                {g.pits[i].length>4 && <span className="absolute bottom-0 right-0.5 text-[10px] text-hueso/70">+{g.pits[i].length-4}</span>}
                {g.pits[i].length===0 && <span className="absolute inset-0 flex items-center justify-center text-[10px] text-hueso/40">vacía</span>}</>
            : <span className="absolute bottom-[3px] right-[3px] opacity-90"><Frags t={top} s={11}/></span>}
        </div>
      </div>
      {pawn && <div className="peon-capa">
        <span className="peon-3d relative">
          <span className="peon-sombra" aria-hidden="true"/>
          <span data-peon={pawn.id}
            className={'relative block '+(stack.length===2?'-translate-y-[5px]':stack.length===1?'-translate-y-[1px]':'')}>
            <Peon color={pawn.color} letra={pawn.name[0].toUpperCase()} s={24} activo={pawn.id===g.turn}/></span>
        </span>
      </div>}
      {arrows && <div className="flechas-3d absolute -inset-2 sm:-inset-1 grid grid-cols-3 grid-rows-3 z-20">
        {[['','N',''],['O','','E'],['','S','']].flat().map((d,k)=> d
          ? <button key={k} onClick={e=>{e.stopPropagation(); onArrow(d);}} disabled={!arrows[d]}
              aria-label={'Empujar hacia '+DIR_ES[d]}
              className="brota flex items-center justify-center text-[17px] font-bold bg-esquisto/95 rounded-md disabled:opacity-10 disabled:border-transparent disabled:text-tenue"
              style={arrows[d]?{border:'1.5px solid rgb(var(--acento))', color:'rgb(var(--acento))', boxShadow:'0 2px 0 rgba(0,0,0,.5)'}:{}}>
              {d==='N'?'↑':d==='S'?'↓':d==='E'?'→':'←'}</button>
          : <span key={k}/>)}
      </div>}
    </div>
  );
}
Object.assign(FG.ui, {Cell});
