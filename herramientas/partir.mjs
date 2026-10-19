// Fossilis · partir.mjs - divide el monolito index.html en módulos src/* sin build.
// · corta por rangos de línea verificados (tokens de inicio/fin)
// · antepone cabecera de dependencias (seams FG.*) y pie de exportación
// · respalda el original y reescribe index.html con el cargador secuencial
// Uso: node herramientas/partir.mjs   (desde la raíz del proyecto)

import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs';
import { dirname } from 'node:path';

const lineas = readFileSync('_respaldo/index.original.html', 'utf8').split(/\r?\n/);
const L = n => lineas[n - 1];
const trozo = (a, b) => lineas.slice(a - 1, b).join('\n');

let fallos = 0;
const revisa = (ok, msg) => {
  if (ok) console.log('  ok    ' + msg);
  else { fallos++; console.error('  FALLO ' + msg); }
};

console.log('Origen: ' + lineas.length + ' líneas');
revisa(L(1).startsWith('<!DOCTYPE html>'), 'L1 DOCTYPE');
revisa(L(202).includes('useState'), 'L202 inicio del script del juego');
revisa(L(2478).includes('createRoot'), 'L2478 render');

const archivos = [
{
  ruta: 'src/data/fosiles.js',
  cab: '// Fossilis · fósiles, materiales y constantes del yacimiento.',
  bucket: 'data',
  exp: 'MAT, BONE, BONE_BOX, HAMMERS, CHAR, CHAR_KEYS, BONUS, DINO_RAW, DINOS, FR, FR_ES, COLORS, CORNERS, STONE_SPOTS',
  trozos: [[204, 273, 'const MAT', '});'], [345, 346, 'const FR', 'FR_ES'], [403, 405, 'const COLORS', 'STONE_SPOTS']],
},
{
  ruta: 'src/data/cartas.js',
  cab: '// Fossilis · cartas: herramientas, suministros, habilidades y eventos.',
  bucket: 'data',
  exp: 'TOOL_DESIGNS, SUPPLY_DESIGNS, SKILLS, SKILL_SLOT_VP, EVENTS',
  trozos: [[348, 388, 'const TOOL_DESIGNS', 'SKILL_SLOT_VP'], [390, 401, 'const EVENTS', '];']],
},
{
  ruta: 'src/core/azar.js',
  cab: '// Fossilis · azar reproducible por semilla.',
  bucket: 'core',
  exp: 'mulberry32, ri, shuffle, sembrar, rnd',
  trozos: [[407, 410, '', 'const shuffle']],
  mas: 'const sembrar = seed => { RNG = mulberry32(seed); };\nconst rnd = () => RNG();',
},
{
  ruta: 'src/core/geometria.js',
  cab: '// Fossilis · geometría del yacimiento: vecindades, bordes y pasos.',
  bucket: 'core',
  exp: 'rc, ix, DIRS, DIR_ES, step, ortho, diag, around8, edgeOf, cellsOnEdge, pasoHacia',
  trozos: [[412, 421, '', 'cellsOnEdge'], [500, 501, 'const pasoHacia', '']],
},
{
  ruta: 'src/core/partida.js',
  cab: 'const {MAT, BONE, BONE_BOX, HAMMERS, DINOS, TOOL_DESIGNS, SUPPLY_DESIGNS, SKILLS, EVENTS, FR, COLORS, CORNERS, STONE_SPOTS} = FG.data;\nconst {ix, rc, shuffle, ri, sembrar, rnd} = FG.core;',
  bucket: 'core',
  exp: 'makeTile, setupGame, cur, has, digCost, bonePlaster, labCap, marketCap, startEnergy, pawnAt, openPit, clone, totalBones',
  trozos: [[423, 489, 'let TID', ''], [491, 499, 'const cur', 'const openPit'], [694, 695, 'const clone', 'totalBones']],
  editar: [['RNG = mulberry32(cfg.seed);', 'sembrar(cfg.seed);', 1], ['RNG()<0.45', 'rnd()<0.45', 1]],
},
{
  ruta: 'src/core/tablero.js',
  cab: 'const {MAT} = FG.data;\nconst {step, ortho, diag, around8, edgeOf, cellsOnEdge, DIR_ES, has, pawnAt, openPit} = FG.core;',
  bucket: 'core',
  exp: 'digTargets, extractTargets, moveTargets, sandTargets, climbTargets, reach, planSlide, planDig, pushPawn, applyOps',
  trozos: [[503, 542, '', ''], [544, 586, '', ''], [1603, 1613, '', '']],
},
{
  ruta: 'src/core/economia.js',
  cab: 'const {FR} = FG.data;',
  bucket: 'core',
  exp: 'applyTile, solvePayment, gainPlaster',
  trozos: [[588, 618, '', ''], [625, 631, '', '']],
},
{
  ruta: 'src/core/eventos.js',
  cab: 'const {EVENTS, MAT} = FG.data;\nconst {ri, cur, climbTargets} = FG.core;',
  bucket: 'core',
  exp: 'resolveEvent, drawMarket',
  trozos: [[632, 687, '', ''], [688, 692, '', '']],
},
{
  ruta: 'src/core/puntuacion.js',
  cab: 'const {BONE, CHAR, CHAR_KEYS, SKILL_SLOT_VP} = FG.data;\nconst {has} = FG.core;',
  bucket: 'core',
  exp: 'finalScoring, PASOS',
  trozos: [[859, 893, '', ''], [2402, 2404, 'const PASOS', '']],
},
{
  ruta: 'src/core/acciones.js',
  cab: 'const {MAT, BONE} = FG.data;\nconst {cur, has, digCost, bonePlaster, labCap, marketCap, startEnergy, clone, planDig, planSlide, applyOps, pushPawn, solvePayment, gainPlaster, resolveEvent, drawMarket, finalScoring, step, edgeOf, DIR_ES} = FG.core;',
  bucket: 'core',
  exp: 'act, endTurn',
  trozos: [[697, 838, '', ''], [840, 857, '', '']],
},
{
  ruta: 'src/core/ia.js',
  cab: 'const {BONE} = FG.data;\nconst {cur, has, bonePlaster, marketCap, labCap, digCost, climbTargets, extractTargets, moveTargets, digTargets, planDig, openPit, solvePayment, rc, DIRS, ri, rnd} = FG.core;',
  bucket: 'core',
  exp: 'boneUtility, aiStep',
  trozos: [[895, 971, '', '']],
  editar: [['RNG()*0.4', 'rnd()*0.4', 1]],
},
{
  ruta: 'src/fx/entorno.js',
  cab: '// Fossilis · entorno: pantalla completa, movimiento reducido y muelle de UI.',
  bucket: 'fx',
  exp: 'irPantallaCompleta, SUAVE, AJUSTES, quieto, MOT, MUELLE',
  trozos: [[321, 343, '', ''], [1079, 1084, 'const SUAVE', 'MUELLE']],
},
{
  ruta: 'src/fx/fx.js',
  cab: '// Fossilis · efectos: paleta, partículas de canvas, flotantes y gestos.\nconst {quieto} = FG.fx;',
  bucket: 'fx',
  exp: 'PALETA, MAT_PAL, Chispas, PERFIL, Flotante, flotanteEn, Sacudida, Destello, chispasEn, GESTO',
  trozos: [[1086, 1098, 'const PALETA', ''], [1100, 1142, '', ''], [1144, 1159, '', ''], [1161, 1183, '', ''], [1185, 1204, '', ''], [1206, 1214, '', '']],
},
{
  ruta: 'src/fx/audio.js',
  cab: '// Fossilis · audio de la excavación (WebAudio).\nconst {AJUSTES} = FG.fx;',
  bucket: 'fx',
  exp: 'audio, tono, ruido, arpegio, SON, son',
  trozos: [[1216, 1263, '', 'const son']],
},
{
  ruta: 'src/ui/iconos.jsx',
  cab: '// Fossilis · iconografía y texturas SVG.',
  bucket: 'ui',
  exp: 'ICONO, Ic, Bone, Hammer, FragIc, Yeso, TEX, TEX_URL, ICO, Ico, IcoDino',
  trozos: [[973, 973, 'const ICONO', ''], [975, 1006, 'const Ic', 'TEX_URL'], [1635, 1655, '', '']],
},
{
  ruta: 'src/ui/paleo.jsx',
  cab: '// Fossilis · paleoarte: retratos, siluetas, eras y emblemas.\nconst {Ic} = FG.ui;',
  bucket: 'ui',
  exp: 'buscarDino, IMG_URLS, IMG_PROM, preload, ARQ_NOMBRE, arquetipo, Silueta, ERA_COL, EraIco, eraDe, modo, rol, Emblema, HUECOS, repartir, Rayo, AvisoIco',
  trozos: [[275, 319, '', ''], [1008, 1021, '', ''], [1023, 1045, '', ''], [1047, 1061, '', ''], [1063, 1077, '', '']],
},
{
  ruta: 'src/ui/atomos.jsx',
  cab: 'const {useRef, useEffect} = React;\nconst {FR} = FG.data;\nconst {FragIc, EraIco, eraDe, Ic, Ico} = FG.ui;\nconst {MOT} = FG.fx;',
  bucket: 'ui',
  exp: 'Coste, Btn, Frags, Peon, BtnEra, BtnEraSec, Banda, BtnJ',
  trozos: [[619, 623, 'const Coste', ''], [1280, 1287, '', ''], [1352, 1361, '', ''], [1490, 1499, '', ''], [1615, 1627, '', ''], [1629, 1633, '', '']],
},
{
  ruta: 'src/ui/hoja.jsx',
  cab: 'const {useState, useRef, useEffect} = React;\nconst {MOT, MUELLE} = FG.fx;',
  bucket: 'ui',
  exp: 'Hoja',
  trozos: [[1289, 1350, '', '']],
},
{
  ruta: 'src/ui/tablero.jsx',
  cab: 'const {MAT} = FG.data;\nconst {DIR_ES} = FG.core;\nconst {Ic, Bone, TEX_URL} = FG.ui;\nconst {Peon, Frags} = FG.ui;\nconst {repartir} = FG.ui;',
  bucket: 'ui',
  exp: 'Cell',
  trozos: [[1363, 1412, '', '']],
},
{
  ruta: 'src/ui/cartas.jsx',
  cab: 'const {useState, useEffect, useMemo} = React;\nconst {CHAR, BONE} = FG.data;\nconst {EraIco, Emblema, eraDe, ERA_COL, buscarDino, IMG_URLS, rol, modo} = FG.ui;\nconst {Bone, Hammer, Yeso, Ico} = FG.ui;\nconst {Btn, Coste} = FG.ui;\nconst {chispasEn, flotanteEn, PALETA} = FG.fx;',
  bucket: 'ui',
  exp: 'DinoCard, MarketCard',
  trozos: [[1414, 1488, '', ''], [1501, 1524, '', '']],
},
{
  ruta: 'src/ui/setup.jsx',
  cab: 'const {useState, useRef, useEffect} = React;\nconst {DINOS} = FG.data;\nconst {ERA_COL, eraDe, Silueta, TEX} = FG.ui;\nconst {MOT, irPantallaCompleta} = FG.fx;',
  bucket: 'ui',
  exp: 'Setup',
  trozos: [[1526, 1601, '', '']],
},
{
  ruta: 'src/ui/pausa.jsx',
  cab: 'const {useState, useEffect} = React;\nconst {AJUSTES, irPantallaCompleta, son} = FG.fx;\nconst {Ico, Hoja, Btn} = FG.ui;',
  bucket: 'ui',
  exp: 'Pausa',
  trozos: [[2338, 2400, '', '']],
},
{
  ruta: 'src/ui/final.jsx',
  cab: 'const {useRef, useEffect} = React;\nconst {DINOS} = FG.data;\nconst {ERA_COL, eraDe, Silueta, TEX} = FG.ui;\nconst {MOT} = FG.fx;\nconst {PASOS} = FG.core;',
  bucket: 'ui',
  exp: 'Final',
  trozos: [[2406, 2471, '', '']],
},
{
  ruta: 'src/ui/hojas.jsx',
  cab: 'const {useState, useMemo, useEffect} = React;\nconst {BONE, MAT, CHAR, CHAR_KEYS, SKILL_SLOT_VP, TEX_URL} = FG.data;\nconst {has, bonePlaster, labCap, marketCap, totalBones, step, DIRS, ortho} = FG.core;\nconst {ERA_COL, eraDe, Silueta} = FG.ui;\nconst {Hoja, DinoCard, MarketCard, Btn, BtnEra, BtnEraSec, Peon, Frags} = FG.ui;\nconst {Bone, Hammer, Yeso, Ico, IcoDino, AvisoIco} = FG.ui;\nconst {chispasEn, flotanteEn, PALETA} = FG.fx;\nconst {Pausa} = FG.ui;',
  bucket: 'ui',
  exp: 'Hojas',
  trozos: [[2118, 2336, '', '']],
},
{
  ruta: 'src/ui/juego.jsx',
  cab: 'const {useState, useMemo, useRef, useEffect, useLayoutEffect} = React;\nconst {MAT, BONE} = FG.data;\nconst {cur, has, digCost, digTargets, extractTargets, moveTargets, sandTargets, climbTargets, planDig, pasoHacia, marketCap, startEnergy, act, aiStep, totalBones, solvePayment, DIRS, reach} = FG.core;\nconst {ERA_COL, eraDe} = FG.ui;\nconst {Peon, Cell, Hoja, Btn, BtnJ, Banda, TEX, Ico, Ic, IcoDino, Yeso, Rayo, ICONO} = FG.ui;\nconst {Hojas, Final, Pausa} = FG.ui;\nconst {son, chispasEn, flotanteEn, Sacudida, Destello, Chispas, PERFIL, PALETA, MAT_PAL, GESTO, SUAVE, quieto, MUELLE} = FG.fx;',
  bucket: 'ui',
  exp: 'Game',
  trozos: [[1265, 1278, '', ''], [1657, 2116, '', '']],
},
{
  ruta: 'src/app.jsx',
  cab: 'const {useState} = React;\nconst {setupGame} = FG.core;\nconst {Setup, Game} = FG.ui;',
  bucket: 'ui',
  exp: '',
  trozos: [[2473, 2478, '', 'createRoot']],
},
];

// ---------------------------------------------------------------- ensamblado
const salidas = [];
for (const f of archivos) {
  const partes = [];
  for (const [a, b, t0, t1] of f.trozos) {
    if (t0) revisa(L(a).trim().startsWith(t0), f.ruta + ' inicio L' + a + ' «' + t0 + '»');
    if (t1) revisa(L(b).includes(t1), f.ruta + ' fin L' + b + ' «' + t1 + '»');
    partes.push(trozo(a, b));
  }
  let cuerpo = partes.join('\n\n');
  for (const [de, a2, n] of (f.editar || [])) {
    const cuenta = cuerpo.split(de).length - 1;
    revisa(cuenta === n, f.ruta + ' edición «' + de + '» x' + n + ' (vistas ' + cuenta + ')');
    cuerpo = cuerpo.split(de).join(a2);
  }
  if (f.mas) cuerpo += '\n' + f.mas;
  const pie = f.exp ? '\nObject.assign(FG.' + f.bucket + ', {' + f.exp + '});' : '';
  salidas.push({ ruta: f.ruta, texto: f.cab + '\n' + cuerpo + pie + '\n' });
}

// Costuras: primera y última línea de cada módulo para revisión visual.
for (const s of salidas) {
  const ls = s.texto.trim().split('\n');
  console.log('  · ' + s.ruta + ' [' + ls.length + '] ' + ls[0].slice(0, 50).trim() + ' ... ' + ls[ls.length - 1].slice(0, 50).trim());
}

// index.html nuevo: cabecera + scripts de librerías + cargador.
const iSrc = [];
for (let i = 150; i <= 215; i++) if (L(i) && L(i).trim().startsWith('<script src=')) iSrc.push(i);
revisa(iSrc.length === 4, '4 etiquetas <script src> (react, react-dom, motion, babel)');
const scripts = iSrc.map(L).join('\n');
revisa(scripts.includes('react'), 'script react');
revisa(scripts.includes('motion'), 'script motion');
revisa(scripts.includes('standalone'), 'script babel');
const cabecera = trozo(1, iSrc[0] - 1);

const modulos = archivos.map(f => f.ruta);
const cargador = [
  '<script>',
  '/* Fossilis · cargador secuencial de módulos (sin build).',
  '   Compila cada src/* con Babel y lo ejecuta en orden de dependencias.',
  '   Cada módulo publica su API en FG (FG.data / FG.core / FG.fx / FG.ui). */',
  '(function(){',
  '  var MODULOS = ' + JSON.stringify(modulos) + ';',
  '  var OPCIONES = {presets: [[Babel.availablePresets.react, {runtime: "classic"}]], sourceType: "script"};',
  '  function fallo(ruta, e){',
  '    console.error("Fossilis · error cargando " + ruta, e);',
  '    var raiz = document.getElementById("root");',
  '    if (raiz) raiz.textContent = "No se pudo cargar " + ruta + ". Revisa la consola.";',
  '  }',
  '  (async function(){',
  '    window.FG = {data: {}, core: {}, fx: {}, ui: {}};',
  '    var t0 = performance.now();',
  '    for (var i = 0; i < MODULOS.length; i++) {',
  '      var ruta = MODULOS[i];',
  '      try {',
  '        var resp = await fetch(ruta);',
  '        if (!resp.ok) throw new Error("HTTP " + resp.status);',
  '        var codigo = Babel.transform(await resp.text(), OPCIONES).code;',
  '        (0, eval)(codigo);',
  '      } catch (e) { fallo(ruta, e); return; }',
  '    }',
  '    console.info("Fossilis · " + MODULOS.length + " módulos en " + Math.round(performance.now() - t0) + " ms");',
  '  })();',
  '})();',
  '</script>',
].join('\n');

const nuevo = cabecera + '\n' + scripts + '\n' + cargador + '\n</body>\n</html>\n';

if (fallos) {
  console.error('\nABORTADO: ' + fallos + ' fallos. No se escribió nada.');
  process.exit(1);
}

for (const s of salidas) {
  mkdirSync(dirname(s.ruta), { recursive: true });
  writeFileSync(s.ruta, s.texto);
}
writeFileSync('index.html', nuevo);
console.log('\nListo: ' + salidas.length + ' módulos + index.html (' + nuevo.length + ' B). Original en _respaldo/.');

