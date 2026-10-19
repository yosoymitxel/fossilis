// Fossilis · auditar.mjs - busca referencias a APIs de FG usadas sin importar.
// Uso: node herramientas/auditar.mjs
import { readFileSync } from 'node:fs';

const definidores = {
  'src/data/fosiles.js': ['MAT','BONE','BONE_BOX','HAMMERS','CHAR','CHAR_KEYS','BONUS','DINO_RAW','DINOS','FR','FR_ES','COLORS','CORNERS','STONE_SPOTS'],
  'src/data/cartas.js': ['TOOL_DESIGNS','SUPPLY_DESIGNS','SKILLS','SKILL_SLOT_VP','EVENTS'],
  'src/core/azar.js': ['mulberry32','ri','shuffle','sembrar','rnd'],
  'src/core/geometria.js': ['rc','ix','DIRS','DIR_ES','step','ortho','diag','around8','edgeOf','cellsOnEdge','pasoHacia'],
  'src/core/partida.js': ['makeTile','setupGame','cur','has','digCost','bonePlaster','labCap','marketCap','startEnergy','pawnAt','openPit','clone','totalBones'],
  'src/core/tablero.js': ['digTargets','extractTargets','moveTargets','sandTargets','climbTargets','reach','planSlide','planDig','pushPawn','applyOps'],
  'src/core/economia.js': ['applyTile','solvePayment','gainPlaster'],
  'src/core/eventos.js': ['resolveEvent','drawMarket'],
  'src/core/puntuacion.js': ['finalScoring','PASOS'],
  'src/core/acciones.js': ['act','endTurn'],
  'src/core/ia.js': ['boneUtility','aiStep'],
  'src/fx/entorno.js': ['irPantallaCompleta','SUAVE','AJUSTES','quieto','MOT','MUELLE'],
  'src/fx/fx.js': ['PALETA','MAT_PAL','Chispas','PERFIL','Flotante','flotanteEn','Sacudida','Destello','chispasEn','GESTO'],
  'src/fx/audio.js': ['audio','tono','ruido','arpegio','SON','son'],
  'src/ui/iconos.jsx': ['ICONO','Ic','Bone','Hammer','FragIc','Yeso','TEX','TEX_URL','ICO','Ico','IcoDino'],
  'src/ui/paleo.jsx': ['buscarDino','IMG_URLS','IMG_PROM','preload','ARQ_NOMBRE','arquetipo','Silueta','ERA_COL','EraIco','eraDe','modo','rol','Emblema','HUECOS','repartir','Rayo','AvisoIco'],
  'src/ui/atomos.jsx': ['Coste','Btn','Frags','Peon','BtnEra','BtnEraSec','Banda','BtnJ'],
  'src/ui/hoja.jsx': ['Hoja'],
  'src/ui/tablero.jsx': ['Cell'],
  'src/ui/cartas.jsx': ['DinoCard','MarketCard'],
  'src/ui/setup.jsx': ['Setup'],
  'src/ui/pausa.jsx': ['Pausa'],
  'src/ui/final.jsx': ['Final'],
  'src/ui/hojas.jsx': ['Hojas'],
  'src/ui/juego.jsx': ['Game'],
  'src/app.jsx': [],
};

let fallos = 0;
for (const [ruta, propios] of Object.entries(definidores)) {
  const texto = readFileSync(ruta, 'utf8');
  const destruct = new Set();
  for (const m of texto.matchAll(/const \{([^}]*)\} = FG\./g)) m[1].split(',').forEach(n => destruct.add(n.trim()));
  const locales = new Set(propios);
  const ignorar = new Set(['has', 'endTurn', 'step']);
  for (const m of texto.matchAll(/(?:const|function) ([A-Za-z_$][\w$]*)/g)) locales.add(m[1]);
  const faltan = [];
  for (const [origen, nombres] of Object.entries(definidores)) {
    if (origen === ruta) continue;
    for (const n of nombres) {
      if (destruct.has(n) || locales.has(n) || ignorar.has(n)) continue;
      if (new RegExp('\\b' + n + '\\b').test(texto)) faltan.push(n + ' ← ' + origen);
    }
  }
  if (faltan.length) { fallos++; console.log(ruta + '\n  ' + faltan.join('\n  ')); }
}
console.log(fallos ? '\n' + fallos + ' archivos con referencias sin importar.' : 'Todo importado.');
