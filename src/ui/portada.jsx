// Fossilis · portada: la ilustración del yacimiento y el menú principal.
const {useState} = React;
const {son, useTema, salaDe, ambiente} = FG.fx;
const {Fondo, horaDe, Hoja, Opciones, Ico, Ic, Yeso, Peon} = FG.ui;

const PASOS_JUEGO = [
  ['turno',  'Tu turno',     'Empiezas con 4 de energía. Coger yeso, moverte, cavar, extraer y echar arena la gastan.'],
  ['cavar',  'Cavar',        'Empujas una loseta y todo lo que tenga detrás. Las que salen del tablero son tuyas: sus fragmentos pagan el mercado.'],
  ['extraer','Extraer',      'Donde ya no queda loseta hay fosa. Ponte al lado, saca el hueso y págalo con yeso.'],
  ['mercado','Mercado',      'Después de las acciones puedes comprar herramientas y suministros con tus fragmentos.'],
  ['laboratorio','Laboratorio',  'Con los huesos que pide una carta te la llevas al laboratorio, o la puntúas entera de golpe.'],
  ['pista',  'Eventos y final','Al vaciarse el depósito de yeso salta un evento. Cuatro vaciados y llega la última ronda. Gana quien sume más PV.'],
];

const Item = ({ico, titulo, nota, on, principal}) => (
  <button onClick={on} className={'menu-btn entra'+(principal?' principal':'')}>
    <span className="ico">{ico}</span>
    <span className="min-w-0"><span className="disp font-extrabold text-[16px] leading-tight block">{titulo}</span>
      {nota && <small className="truncate">{nota}</small>}</span>
  </button>);

function Portada({guardada, onContinuar, onNueva}){
  const [tema] = useTema();
  const [hoja,setHoja] = useState(null);
  const hora = horaDe(tema);
  const abrir = k => { son('ui'); setHoja(k); };
  const act = guardada && guardada.players[guardada.turn];
  return (
    <div data-sala={salaDe('vitrina', tema)} data-hora={hora} className="portada pantalla">
      <Fondo hora={hora} paralaje/>
      <div className="portada-sombra"/>
      <div className="relative z-10 flex-1 flex flex-col w-full max-w-[1100px] mx-auto px-5 lg:px-10 pt-[9svh] pb-5">
        <header>
          <p className="portada-lema entra rotulo text-[12px] opacity-80">Juego de excavación · de 2 a 5 paleontólogos</p>
          <h1 className="portada-titulo entra mt-2" style={{animationDelay:'.08s'}}>Fossilis</h1>
          <p className="portada-lema entra text-[16px] leading-snug mt-3 max-w-[30ch]" style={{animationDelay:'.16s'}}>
            Cuarenta y cinco huesos bajo la arena. Llévate el esqueleto antes que el resto.</p>
        </header>
        <nav aria-label="Menú principal" className="mt-auto pt-8 grid gap-2 w-full max-w-[380px]">
          {guardada && <Item principal on={()=>{ son('abrir'); onContinuar(); }}
              ico={<Peon color={act.color} letra={act.name[0].toUpperCase()} s={26}/>}
              titulo="Continuar la excavación"
              nota={'Turno de '+act.name+' · depósito '+Math.min(guardada.poolIndex,4)+' de 4'}/>}
          <Item principal={!guardada} on={()=>{ son('ui'); onNueva(); }} ico={<Ico k="cavar" s={19}/>}
            titulo="Nueva expedición" nota="Elige la mesa, las reglas y el montaje"/>
          <div className="grid grid-cols-3 gap-2">
            {[['como','pista','Cómo se juega'],['opciones','sonido','Opciones'],['creditos','creditos','Créditos']].map(([k,i,n])=>
              <button key={k} onClick={()=>abrir(k)} className="menu-btn entra !flex-col !items-center !gap-1 !px-2 !text-center">
                <Ico k={i} s={18}/><span className="text-[12px] font-semibold leading-tight">{n}</span></button>)}
          </div>
          <p className="text-[11px] leading-snug mt-2 text-[#F4EFE4]/70">
            Adaptación personal y sin ánimo de lucro del juego de David Díaz (Kids Table Board Gaming).</p>
        </nav>
      </div>

      {hoja==='como' && <Hoja title="Cómo se juega" sub="Lo justo para empezar; el resto se aprende cavando" onClose={()=>setHoja(null)}>
        <ol className="grid gap-2">
          {PASOS_JUEGO.map(([i,t,d],n)=>(
            <li key={t} className="flex gap-3 rounded-xl border border-borde p-3">
              <span className="w-10 h-10 rounded-lg bg-borde sobre-borde flex items-center justify-center shrink-0">
                <Ico k={i} s={20}/></span>
              <span className="min-w-0"><span className="disp font-bold text-[14px] block">{n+1}. {t}</span>
                <span className="text-[13px] text-hueso/80 leading-snug block">{d}</span></span>
            </li>))}
        </ol>
        <p className="text-[12px] text-tenue mt-3 leading-snug flex items-center gap-1.5"><Yeso s={13}/>Durante la partida aparecen pistas la primera vez que pasa algo nuevo.</p>
      </Hoja>}
      {hoja==='opciones' && <Hoja title="Opciones" sub="Se guardan en este dispositivo" sala="modular" onClose={()=>{ ambiente(); setHoja(null); }}>
        <Opciones/></Hoja>}
      {hoja==='creditos' && <Hoja title="Créditos" sub="Fossilis · yacimiento" onClose={()=>setHoja(null)}>
        <div className="grid gap-3 text-[14px] leading-relaxed text-hueso/90">
          <p>Adaptación personal del juego de mesa <b>Fossilis</b>, de David Díaz, publicado por Kids Table Board Gaming.
            Sin ánimo de lucro y sin material del editor.</p>
          <p>Siluetas e iconos de Lorc, Delapouite y Caro Asercion (game-icons.net), bajo licencia CC BY 3.0.</p>
          <p>Retratos en miniatura servidos por Wikipedia y Wikimedia Commons.</p>
          <p>Modelos 3D low-poly del campamento, los fósiles y los dinosaurios de polyfork.dev, enlazados desde su CDN.</p>
          <p className="text-tenue text-[13px]">Ilustración de respaldo, escenas y sonido hechos para esta adaptación.</p>
        </div>
      </Hoja>}
    </div>
  );
}
Object.assign(FG.ui, {Portada});
