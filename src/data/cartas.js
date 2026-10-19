// Fossilis · cartas: herramientas, suministros, habilidades y eventos.
const TOOL_DESIGNS = [
 {k:'cincel'  ,n:'Cincel'          ,cost:{comodin:2},vp:2,q:3,eff:{t:'slide',mat:'stone',dist:1},d:'Desliza 1 loseta de piedra 1 espacio, estés donde estés.'},
 {k:'cafe'    ,n:'Café caliente'    ,cost:{comodin:2},vp:0,q:3,eff:{t:'energy',n:2},d:'Gasta 2 puntos de energía extra este turno.'},
 {k:'cepillo' ,n:'Cepillo'         ,cost:{comodin:2},vp:4,q:3,eff:{t:'slide',mat:'sand',dist:1},d:'Desliza 1 loseta de arena 1 espacio, estés donde estés.'},
 {k:'pala'    ,n:'Pala de arcilla' ,cost:{ambar:1,comodin:2},vp:3,q:3,eff:{t:'slide',mat:'clay',dist:2},d:'Desliza 1 loseta de arcilla hasta 2 espacios en la misma dirección.'},
 {k:'piqueta' ,n:'Piqueta'         ,cost:{huella:1,comodin:2},vp:2,q:3,eff:{t:'remove',mat:'sand'},d:'Retira del yacimiento 1 loseta de arena y quédatela.'},
 {k:'cuerda'  ,n:'Cuerda'          ,cost:{huevo:1,comodin:2},vp:3,q:2,eff:{t:'move',n:4},d:'Mueve tu paleóntólogo hasta 4 espacios.'},
 {k:'gato'    ,n:'Gato hidráulico' ,cost:{comodin:4},vp:4,q:2,eff:{t:'removeTop'},d:'Retira la loseta superior de cualquier pila y quédatela.'},
 {k:'linterna',n:'Linterna'        ,cost:{comodin:5},vp:6,q:2,eff:{t:'lantern',n:3},d:'Devuelve al yacimiento hasta 3 losetas del descarte, donde quieras.'},
];
const SUPPLY_DESIGNS = [
 {k:'s1',n:'Cajas de yeso'     ,cost:{comodin:2},q:4,gain:{plaster:3},vp:0,d:'Gana 3 yesos.'},
 {k:'s2',n:'Cantimplora'       ,cost:{comodin:2},q:3,gain:{plaster:2},vp:2,d:'Gana 2 yesos.'},
 {k:'s3',n:'Cajón de dientes'  ,cost:{ambar:1,comodin:1},q:4,gain:{bone:'diente'},vp:0,d:'Gana 1 diente.'},
 {k:'s4',n:'Cajón de fémures'  ,cost:{huevo:1,comodin:2},q:4,gain:{bone:'femur'},vp:0,d:'Gana 1 fémur.'},
 {k:'s5',n:'Cajón de costillas',cost:{huella:1,comodin:3},q:3,gain:{bone:'costilla'},vp:0,d:'Gana 1 costilla.'},
 {k:'s6',n:'Cajón de caderas'  ,cost:{comodin:5},q:2,gain:{bone:'cadera'},vp:0,d:'Gana 1 cadera.'},
 {k:'s7',n:'Beca del museo'    ,cost:{comodin:4},q:2,gain:{plaster:1},vp:6,d:'Gana 1 yeso y 6 PV al final.'},
 {k:'s8',n:'Portada de revista',cost:{comodin:6},q:2,gain:{},vp:9,d:'9 PV al final de la partida.'},
];
const SKILLS = [
 {k:'lab2'    ,n:'Doble laboratorio'  ,d:'Conserva 2 dinosaurios en tu laboratorio.'},
 {k:'yeso2'   ,n:'Mezcla rápida'      ,d:'1 vez por turno: gasta 1 energía y gana 2 yesos.'},
 {k:'empujar' ,n:'Codazo'             ,d:'1 vez por turno: empuja 2 espacios a un paleóntólogo adyacente.',agg:true},
 {k:'herrPerf',n:'Reconocimiento'     ,d:'Roba la herramienta superior al puntuar un dinosaurio perfecto.'},
 {k:'diagExt' ,n:'Brazo largo'        ,d:'Extrae también de fosas en diagonal.'},
 {k:'diagCav' ,n:'Palanca oblicua'    ,d:'Cava también losetas en diagonal.'},
 {k:'arcilla1',n:'Az. de arcilla'     ,d:'Cavar arcilla cuesta 1 energía.'},
 {k:'piedra2' ,n:'Cuña'              ,d:'Cavar piedra cuesta 2 energías.'},
 {k:'diente5' ,n:'Coleccionista'      ,d:'Cada diente sobrante vale 5 PV al final.'},
 {k:'femur5'  ,n:'Archivo óseo'       ,d:'Cada fémur sobrante vale 5 PV al final.'},
 {k:'costilla5',n:'Vitrina'           ,d:'Cada costilla sobrante vale 6 PV al final.'},
 {k:'mover3'  ,n:'Botas nuevas'       ,d:'Mover cuesta 1 energía y llega a 3 espacios.'},
 {k:'arenaFree',n:'Sacos de arena'    ,d:'Colocar 1 loseta de arena cuesta 0 energía.'},
 {k:'yesoDesc',n:'Vendaje eficiente'  ,d:'Cada hueso cuesta 1 yeso menos, mínimo 1.'},
 {k:'energia5',n:'Cuadrilla'          ,d:'Empiezas cada turno con 5 energías.'},
 {k:'mercado2',n:'Buen regateo'       ,d:'Compra hasta 2 cartas de mercado por turno.'},
 {k:'martillo2',n:'Cinturón de obra' ,d:'Puedes extraer 2 martillos por turno.'},
 {k:'bonoPerf',n:'Prensa especializada',d:'+3 PV cada vez que puntuás un dinosaurio perfecto.'},
];
const SKILL_SLOT_VP = [0,3,4];

const EVENTS = [
 {k:'derrumbe' ,n:'Desprendimiento', d:'Caen 2 losetas pesadas del descarte sobre el yacimiento.'},
 {k:'suministro',n:'Llega el camión', d:'Cada paleóntologo gana 2 yesos de la reserva.'},
 {k:'subvencion',n:'Subvención', d:'Quien no lidere el marcador gana 3 PV.'},
 {k:'viento'  ,n:'Viento del desierto', d:'Se descarta el mercado entero y se repone.'},
 {k:'relevo'  ,n:'Relevo de equipo', d:'Cada jugador roba la herramienta superior del mazo.'},
 {k:'hallazgo',n:'Hallazgo inesperado', d:'Se descarta 1 dinosaurio del expositor y se repone.'},
 {k:'jornada' ,n:'Jornada larga', d:'Quien disparó el evento gana 3 yesos y 2 PV.'},
 {k:'inspeccion',n:'Inspección', d:'Quien tenga 6 o más yesos devuelve 2 a la reserva.'},
 {k:'temblor' ,n:'Temblor', d:'Todo paleóntologo fuera del yacimiento vuelve gratis.'},
 {k:'prensa'  ,n:'Prensa local', d:'Quien tenga más huesos en almacén gana 4 PV.'},
];
Object.assign(FG.data, {TOOL_DESIGNS, SUPPLY_DESIGNS, SKILLS, SKILL_SLOT_VP, EVENTS});
