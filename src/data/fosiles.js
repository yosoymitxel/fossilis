// Fossilis · fósiles, materiales y constantes del yacimiento.
const MAT = {
  sand : {id:'sand' , es:'Arena'  , dig:1, w:1, nf:1, bg:'#D9A05B', fg:'#3A2410'},
  clay : {id:'clay' , es:'Arcilla', dig:2, w:2, nf:2, bg:'#A8432E', fg:'#FFE6DC'},
  stone: {id:'stone', es:'Piedra' , dig:3, w:3, nf:3, bg:'#71818A', fg:'#0E1416'},
};

const BONE = {
  diente  :{es:'Diente'  , pl:2, end:2 , val:4},
  femur   :{es:'Fémur'   , pl:3, end:3 , val:5},
  costilla:{es:'Costilla', pl:4, end:4 , val:6},
  cadera  :{es:'Cadera'  , pl:5, end:5 , val:7},
  craneo  :{es:'Cráneo'  , pl:6, end:12, val:0},
};
const BONE_BOX = {craneo:3, cadera:6, costilla:9, femur:12, diente:15};
const HAMMERS = 9;

const CHAR = {
  carnivoro :{es:'Carnívoro' , set:3},
  herbivoro :{es:'Herbívoro' , set:4},
  bipedo    :{es:'Bípedo'    , set:5},
  cuadrupedo:{es:'Cuadrúpedo', set:5},
  acuatico  :{es:'Acuático'  , set:7},
  aereo     :{es:'Aéreo'     , set:7},
  triasico  :{es:'Triásico'  , set:6},
  jurasico  :{es:'Jurásico'  , set:6},
  cretacico :{es:'Cretácico' , set:6},
};
const CHAR_KEYS = Object.keys(CHAR);

const BONUS = [0,0,3,6];
const DINO_RAW = [
 ['Coelophysis',['carnivoro','bipedo','triasico'],['diente','femur'],'Depredador esbelto y de huesos huecos. En Ghost Ranch se hallaron cientos de ejemplares juntos.'],
 ['Plateosaurus',['herbivoro','bipedo','triasico'],['femur','costilla'],'Uno de los primeros herbívoros grandes. Se sostiene sobre dos patas con cuello largo.'],
 ['Placerias',['herbivoro','cuadrupedo','triasico'],['cadera'],'Dicinodonte del tamaño de un hipopótamo, más cercano a los mamíferos que a los dinosaurios.'],
 ['Eudimorphodon',['carnivoro','aereo','triasico'],['femur','femur'],'Pterosaurio temprano con dentición variada, adaptada a sujetar peces.'],
 ['Shonisaurus',['carnivoro','acuatico','triasico'],['costilla','cadera'],'Ictiosaurio gigantesco, de más de quince metros, con aletas largas y estrechas.'],
 ['Arizonasaurus',['carnivoro','cuadrupedo','triasico'],['diente','diente','cadera'],'Llevaba una vela dorsal sostenida por espinas neurales. Debe su nombre al estado donde se describió.'],
 ['Pisanosaurus',['herbivoro','bipedo','triasico'],['diente','diente','femur'],'Posible ornitisquio más antiguo conocido. Su clasificación lleva décadas discutida.'],
 ['Herrerasaurus',['carnivoro','bipedo','triasico'],['diente','femur','costilla'],'Cazador argentino con mandíbula de articulación deslizante para sujetar presas.'],
 ['Nothosaurus',['carnivoro','acuatico','triasico'],['diente','costilla'],'Reptil marino de patas palmeadas que probablemente salía a descansar a la orilla.'],
 ['Peteinosaurus',['carnivoro','aereo','triasico'],['diente','femur'],'Pterosaurio diminuto, de apenas sesenta centímetros de envergadura. Comedor de insectos.'],
 ['Riojasaurus',['herbivoro','cuadrupedo','triasico'],['femur','cadera'],'Saurópodomorfo primitivo de vertebras huecas y extremidades robustas.'],
 ['Allosaurus',['carnivoro','bipedo','jurasico'],['diente','cadera','cadera'],'Terópodo de casi diez metros con dientes aserrados. Pudo cazar en grupo.'],
 ['Stegosaurus',['herbivoro','cuadrupedo','jurasico'],['costilla','costilla','cadera'],'Placas dorsales alternadas y cuatro púas caudales. El cerebro era llamativamente pequeño.'],
 ['Apatosaurus',['herbivoro','cuadrupedo','jurasico'],['diente','cadera'],'Sacos aéreos en el cuello aligeraban su peso. La cola terminaba en un látigo fino.'],
 ['Diplodocus',['herbivoro','cuadrupedo','jurasico'],['femur','costilla','cadera'],'Uno de los animales más largos conocidos por esqueletos casi completos.'],
 ['Brachiosaurus',['herbivoro','cuadrupedo','jurasico'],['costilla','cadera','cadera'],'Patas delanteras más largas que las traseras, lo que inclinaba su cuerpo hacia arriba.'],
 ['Archaeopteryx',['carnivoro','aereo','jurasico'],['femur','femur'],'Plumas asimétricas, dientes y cola ósea. La pieza básica entre dinosaurios y aves.'],
 ['Ichthyosaurus',['carnivoro','acuatico','jurasico'],['femur','costilla'],'Con forma de delfín. Algunos fósiles conservan la silueta de la piel.'],
 ['Plesiosaurus',['carnivoro','acuatico','jurasico'],['costilla'],'Cuello larguisimo y cabeza pequeña. Más corto de lo que suele imaginarse.'],
 ['Dilophosaurus',['carnivoro','bipedo','jurasico'],['costilla','cadera'],'Dos crestas óseas en el cráneo. Ni colla-rín ni veneno: eso es invención del cine.'],
 ['Compsognathus',['carnivoro','bipedo','jurasico'],['diente'],'Del tamaño de un pavo. Un ejemplar conserva un lagarto entero en el estómago.'],
 ['Rhamphorhynchus',['carnivoro','aereo','jurasico'],['diente','femur'],'Cola larga rematada en un timón romboidal que le daba estabilidad en vuelo.'],
 ['Tyrannosaurus rex',['carnivoro','bipedo','cretacico'],['diente','costilla','cadera'],'Cráneo macizo y mordida más potente que la de cualquier animal terrestre conocido.'],
 ['Triceratops',['herbivoro','cuadrupedo','cretacico'],['diente','costilla','cadera'],'Tres cuernos y una gola ósea. Su pico córneo cortaba vegetación dura.'],
 ['Velociraptor',['carnivoro','bipedo','cretacico'],['diente','femur'],'Del tamaño de un pavo grande y cubierto de plumas. Garra retráctil en cada pie.'],
 ['Deinonychus',['carnivoro','bipedo','cretacico'],['diente','diente','costilla'],'Su estudio cambió la idea de los dinosaurios: rápidos, ágiles y activos.'],
 ['Ankylosaurus',['herbivoro','cuadrupedo','cretacico'],['costilla','cadera'],'Blindado con osteodermos y una maza ósea en la cola.'],
 ['Parasaurolophus',['herbivoro','bipedo','cretacico'],['femur','costilla','cadera'],'La cresta hueca funcionaba como caja de resonancia.'],
 ['Pteranodon',['carnivoro','aereo','cretacico'],['femur','femur','cadera'],'Pico sin dientes y cresta craneal variable. No es un dinosaurio, sino un pterosaurio.'],
 ['Quetzalcoatlus',['carnivoro','aereo','cretacico'],['femur','costilla','cadera'],'Envergadura comparable a la de una avioneta. Probablemente cazaba a pie.'],
 ['Mosasaurus',['carnivoro','acuatico','cretacico'],['diente','cadera','cadera'],'Lagarto marino de cola propulsora y mandíbulas con doble hilera de dientes.'],
 ['Kronosaurus',['carnivoro','acuatico','cretacico'],['femur','cadera'],'Plesiosaurio de cuello corto y cráneo de casi tres metros.'],
 ['Spinosaurus',['carnivoro','acuatico','cretacico'],['diente','costilla','cadera'],'Hocico de cocodrilo y vela dorsal. Pasaba buena parte del tiempo en el agua.'],
];
const DINOS = DINO_RAW.map((d,i)=>{
  const vals = d[2].map(b=>BONE[b].val);
  return {id:'D'+i, name:d[0], chars:d[1], bones:d[2], vals,
          perfect: vals.reduce((a,b)=>a+b,0) + BONUS[d[2].length], fact:d[3]};
});

const FR = ['ambar','huevo','huella'];
const FR_ES = {ambar:'Ámbar', huevo:'Huevo', huella:'Huella', comodin:'Comodín'};

const COLORS = ['#FFD23F','#4FB3A6','#E86A5E','#9C7BD6','#7FB55B'];
const CORNERS = [0,4,20,24];
const STONE_SPOTS = [6,8,16,18];
Object.assign(FG.data, {MAT, BONE, BONE_BOX, HAMMERS, CHAR, CHAR_KEYS, BONUS, DINO_RAW, DINOS, FR, FR_ES, COLORS, CORNERS, STONE_SPOTS});
