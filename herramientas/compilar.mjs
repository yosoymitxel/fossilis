// Fossilis · compilar.mjs - genera la versión rápida que sirve index.html.
// · une los 32 módulos en un solo juego.js (JSX compilado y minificado, sin Babel en el navegador)
// · compila Tailwind a CSS estático y lo funde con gabinete.css y escena.css en estilos/app.css
// · las librerías (React, ReactDOM, anime, three) viven en vendor/, sin CDNs en el arranque
// Uso: npm run build
import { readFileSync, statSync, unlinkSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import * as esbuild from 'esbuild';

const RAIZ = fileURLToPath(new URL('..', import.meta.url));
const ruta = p => RAIZ + p;
const kb = p => Math.round(statSync(ruta(p)).size / 1024);

// La lista de módulos y su orden viven en el cargador de desarrollo: única fuente de verdad.
const desarrollo = readFileSync(ruta('desarrollo.html'), 'utf8');
const lista = desarrollo.match(/var MODULOS = (\[[^\]]+\]);/);
if (!lista) throw new Error('No encontré MODULOS en desarrollo.html');
const MODULOS = JSON.parse(lista[1]);

console.log('Fossilis · compilando ' + MODULOS.length + ' módulos');

// Cada módulo se evalúa aislado, como hacía el eval del cargador: sus const no se pisan.
const entrada = [
  '/* Fossilis · juego precompilado. Generado por herramientas/compilar.mjs. */',
  'window.FG = {data:{}, core:{}, fx:{}, ui:{}};',
  ...MODULOS.map(m => ';(function(){\n' + readFileSync(ruta(m), 'utf8') + '\n})();')
].join('\n');

const t0 = Date.now();
await esbuild.build({
  stdin: { contents: entrada, loader: 'jsx', resolveDir: RAIZ, sourcefile: 'fossilis.jsx' },
  bundle: true,
  minify: true,
  format: 'iife',
  target: ['es2020'],
  outfile: ruta('juego.js'),
  external: ['three', 'three/addons/*'],
  legalComments: 'none',
  logLevel: 'warning'
});
console.log('  juego.js      ' + kb('juego.js') + ' KB');

// Tailwind: una pasada con la config del proyecto.
execFileSync(process.execPath, [
  ruta('node_modules/tailwindcss/lib/cli.js'),
  '-c', ruta('tailwind.config.js'),
  '-i', ruta('estilos/tailwind-entrada.css'),
  '-o', ruta('estilos/.tailwind.css'),
  '--minify'
], { stdio: 'inherit', env: { ...process.env, BROWSERSLIST_IGNORE_OLD_DATA: '1' } });

// Una sola hoja: Tailwind primero, luego las salas y la escena (mismo orden que en el cargador).
const css = [
  readFileSync(ruta('estilos/fuentes.css'), 'utf8'),
  readFileSync(ruta('estilos/.tailwind.css'), 'utf8'),
  readFileSync(ruta('estilos/gabinete.css'), 'utf8'),
  readFileSync(ruta('estilos/escena.css'), 'utf8')
].join('\n');

await esbuild.build({
  stdin: { contents: css, loader: 'css', resolveDir: RAIZ, sourcefile: 'app.css' },
  minify: true,
  outfile: ruta('estilos/app.css'),
  logLevel: 'warning'
});
console.log('  estilos/app.css ' + kb('estilos/app.css') + ' KB');
unlinkSync(ruta('estilos/.tailwind.css'));

console.log('Listo en ' + ((Date.now() - t0) / 1000).toFixed(1) + ' s. Abre index.html (desarrollo: desarrollo.html).');
