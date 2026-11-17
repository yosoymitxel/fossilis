// Fossilis · momentos: escenas intermedias a pantalla completa (apertura, evento, hallazgo, relevo, cierre).
const {useState, useEffect, useRef} = React;
const {quieto, son, Chispas, PERFIL} = FG.fx;
const {Escena, Diorama, Fondo, tieneDino3D, Peon, Silueta, ERA_COL, eraDe, Ico, Ic, Yeso} = FG.ui;

const DURA = {apertura:3800, museo:3200, ultima:2300, cierre:3000};   // evento y relevo esperan al jugador
const ERA_ES = {triasico:'Triásico', jurasico:'Jurásico', cretacico:'Cretácico'};
const EFECTO_EVT = {derrumbe:'rocas', viento:'viento', suministro:'camion', prensa:'destello'};
const ICO_EVT = {derrumbe:'cavar', subvencion:'marcador', viento:'arena', relevo:'equipo', jornada:'turno',
  inspeccion:'pista', temblor:'mov', prensa:'pantalla'};
const SON_MOMENTO = {apertura:'abrir', evento:'sello', museo:'esqueleto', ultima:'sello', relevo:'turno', cierre:'cierre'};

function Momento({m, onFin}){
  const [sale,setSale] = useState(false);
  const hecho = useRef(false), boton = useRef(null);
  const espera = m.k==='evento' || m.k==='relevo';
  const cerrar = () => {
    if(hecho.current) return;
    hecho.current = true; setSale(true);
    setTimeout(onFin, quieto() ? 0 : 250);
  };
  useEffect(()=>{
    son(SON_MOMENTO[m.k]);
    if(m.k==='museo') Chispas(window.innerWidth/2, window.innerHeight*.42,
      Object.assign({}, PERFIL.esqueleto, {col:[ERA_COL[eraDe(m.dino)], '#F4EFE4', m.jugador.color]}));
    if(boton.current) boton.current.focus();
    const tecla = e => { if(e.key==='Enter' || e.key===' ' || e.key==='Escape'){ e.preventDefault(); e.stopPropagation(); cerrar(); } };
    window.addEventListener('keydown', tecla, true);
    const t = espera ? 0 : setTimeout(cerrar, DURA[m.k]);
    return ()=>{ window.removeEventListener('keydown', tecla, true); clearTimeout(t); };
  },[]);

  const cE = m.k==='museo' ? ERA_COL[eraDe(m.dino)] : null;
  const claro = m.k==='evento' || m.k==='ultima' || m.k==='relevo';
  const titulo = {apertura:'Se abre el yacimiento', evento:m.evento && m.evento.n, museo:m.dino && m.dino.name,
    ultima:'Última ronda', relevo:m.jugador && 'Turno de '+m.jugador.name, cierre:'Se cierra el yacimiento'}[m.k];
  return (
    <div role="dialog" aria-modal="true" aria-label={titulo} onClick={espera ? undefined : cerrar}
      className={'momento'+(claro?' claro':'')+(sale?' sale':'')}>
      {(m.k==='apertura' || m.k==='cierre') && <>
        <div className="mo-fondo"><Fondo hora={m.k==='cierre' ? 'noche' : 'ocaso'} plano={m.k}/></div>
        <div className="mo-barra a"/><div className="mo-barra b"/></>}
      {m.k==='museo' && <div className="mo-rayos" style={{'--c':cE}}/>}

      {m.k==='apertura' && <div className="mo-cuerpo">
        <p className="mo-rotulo">Montaje {m.g.seed} · {m.g.players.length} paleontólogos</p>
        <h2 className="mo-titulo">{titulo}</h2>
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-3 mt-6">
          {m.g.players.map((q,i)=>(
            <span key={q.id} className="mo-pop flex flex-col items-center gap-1 w-16" style={{animationDelay:(.35+i*.07)+'s'}}>
              <Peon color={q.color} letra={q.name[0].toUpperCase()} s={40}/>
              <span className="text-[12px] leading-tight truncate w-full">{q.name}</span>
            </span>))}
        </div>
        <p className="text-[15px] mt-5" style={{animationDelay:'.7s'}}>Empieza {m.g.players[m.g.turn].name}.</p>
      </div>}

      {m.k==='evento' && <div className="mo-cuerpo">
        <p className="mo-rotulo">Evento · depósito {Math.min(m.deposito,4)} de 4</p>
        <div className={'mo-vineta mt-3'+(m.evento.k==='temblor'||m.evento.k==='derrumbe' ? ' tiembla' : '')}>
          <Escena hora="ocaso" efecto={EFECTO_EVT[m.evento.k]}/>
          <span className="mo-emblema">{m.evento.k==='suministro' ? <Yeso s={22}/> : m.evento.k==='hallazgo' ? <Ic k="fosil" s={24}/>
            : <Ico k={ICO_EVT[m.evento.k] || 'pista'} s={22}/>}</span>
        </div>
        <h2 className="mo-titulo mo-sello !text-[clamp(24px,7vw,40px)] mt-5" style={{color:'#F0A35C'}}>{titulo}</h2>
        <p className="text-[15px] leading-relaxed mt-4 text-[#F4EFE4]/90">{m.evento.d}</p>
        {m.evento.efectos && m.evento.efectos.length>0 && <ul className="mt-3 grid gap-1 text-[13px] text-[#F4EFE4]/75 text-left max-w-sm mx-auto">
          {m.evento.efectos.map((e,i)=><li key={i} className="flex gap-2"><span aria-hidden="true">·</span><span>{e}</span></li>)}</ul>}
        <div className="mt-6"><button ref={boton} onClick={cerrar} className="mo-boton">Seguir excavando</button></div>
      </div>}

      {m.k==='museo' && <div className="mo-cuerpo">
        <p className="mo-rotulo" style={{color:cE}}>{ERA_ES[eraDe(m.dino)]} · esqueleto completo</p>
        {tieneDino3D(m.dino)
          ? <div className="mo-vitrina mt-2"><span className="mo-silueta" style={{color:cE}}><Silueta d={m.dino} s={150}/></span><Diorama dino={m.dino}/></div>
          : <div className="mt-3" style={{color:cE}}><span className="mo-silueta"><Silueta d={m.dino} s={168}/></span></div>}
        <h2 className="mo-titulo">{titulo}</h2>
        <p className="mo-pop disp font-extrabold text-[30px] mt-2" style={{color:cE, animationDelay:'.7s'}}>+{m.pv} PV</p>
        <p className="inline-flex items-center justify-center gap-2 text-[14px] mt-3 w-full">
          <Peon color={m.jugador.color} letra={m.jugador.name[0].toUpperCase()} s={24}/>Al museo de {m.jugador.name}</p>
      </div>}

      {m.k==='ultima' && <div className="mo-cuerpo">
        <p className="mo-rotulo">Depósito agotado</p>
        <h2 className="mo-titulo mo-sello mt-4" style={{color:'#F0685E'}}>{titulo}</h2>
        <p className="text-[15px] mt-5 text-[#F4EFE4]/85">Quedan los últimos turnos antes del recuento.</p>
      </div>}

      {m.k==='relevo' && <div className="mo-cuerpo">
        <p className="mo-rotulo">Pasa el dispositivo</p>
        <div className="mt-5 flex justify-center"><span className="mo-pop"><Peon color={m.jugador.color} letra={m.jugador.name[0].toUpperCase()} s={84}/></span></div>
        <h2 className="mo-titulo" style={{color:m.jugador.color}}>{titulo}</h2>
        <p className="text-[15px] mt-3 text-[#F4EFE4]/85">{m.jugador.vp} PV · {m.jugador.plaster} de yeso</p>
        <div className="mt-6"><button ref={boton} onClick={cerrar} className="mo-boton">Empezar turno</button></div>
      </div>}

      {m.k==='cierre' && <div className="mo-cuerpo">
        <p className="mo-rotulo">Fin de la temporada</p>
        <h2 className="mo-titulo">{titulo}</h2>
        <p className="text-[15px] mt-4">Se apagan los faroles. Toca contar huesos.</p>
      </div>}

      {!espera && <><span className="mo-salta">Toca para saltar</span>
        <span className="mo-tiempo" style={{animationDuration:DURA[m.k]+'ms'}}/></>}
    </div>
  );
}
Object.assign(FG.ui, {Momento});
