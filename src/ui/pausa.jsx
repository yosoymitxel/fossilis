const {Ico, Hoja, Opciones} = FG.ui;
function Pausa({onClose, verLog, onRestart}){
  const Fila = ({icono, titulo, nota, accion, texto}) => (
    <button onClick={accion} disabled={!accion}
      className="w-full flex items-center gap-3 rounded-xl border border-borde p-3 text-left hover:border-tenue transition-colors disabled:opacity-40 active:scale-[.99]">
      <span className="w-10 h-10 rounded-lg bg-borde text-esquisto flex items-center justify-center shrink-0">
        <Ico k={icono} s={19}/></span>
      <span className="flex-1 min-w-0">
        <span className="disp font-bold text-[14px] block">{titulo}</span>
        <span className="text-[11px] text-tenue leading-snug">{nota}</span></span>
      {texto && <span className="text-[12px] text-cinta shrink-0">{texto}</span>}
    </button>
  );
  return (
    <Hoja title="Partida en pausa" sub="Nadie juega mientras esto esté abierto" sala="modular" onClose={onClose}>
      <div className="grid gap-2">
        <Fila icono="pausa" titulo="Ver el registro"
          nota="Todo lo que ha pasado, de lo último a lo primero" accion={verLog}/>
        <Opciones/>
      </div>
      <button onClick={onRestart}
        className="w-full mt-3 py-2.5 rounded-xl border border-borde text-tenue text-[13px] hover:text-hueso hover:border-tenue transition-colors">
        Salir a la portada · la excavación queda guardada</button>
      <button onClick={onClose} className="btn-fisico bg-cinta sobre-acento w-full mt-3 py-3 rounded-xl disp font-bold text-[14px] active:scale-[.98] transition-transform">Seguir excavando</button>
    </Hoja>
  );
}
Object.assign(FG.ui, {Pausa});
