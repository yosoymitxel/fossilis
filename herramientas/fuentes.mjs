// Fossilis · fuentes.mjs - descarga una vez las familias de Google Fonts a vendor/fuentes
// y escribe estilos/fuentes.css con rutas locales. Solo subconjunto latin (cubre el español).
// Uso: node herramientas/fuentes.mjs
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const RAIZ = fileURLToPath(new URL('..', import.meta.url));
const CSS = 'https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700;800&family=Bodoni+Moda:ital,opsz,wght@1,6..96,400..500&family=Kalam:wght@400;700&family=Barlow+Condensed:ital,wght@0,500;0,600;1,600&display=swap';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

mkdirSync(RAIZ + 'vendor/fuentes', { recursive: true });

const css = await (await fetch(CSS, { headers: { 'User-Agent': UA } })).text();
const bloques = css.split('/* ').slice(1);           // cada bloque empieza con su subconjunto
const salida = [];
let bajadas = 0;

for (const bloque of bloques) {
  const fin = bloque.indexOf('*/');
  if (fin < 0 || !['latin', 'latin-ext'].includes(bloque.slice(0, fin).trim())) continue;
  const cara = bloque.slice(fin + 2).trim();
  const url = cara.match(/url\((https:[^)]+\.woff2)\)/);
  if (!url) continue;
  const nombre = url[1].split('/').pop();
  const resp = await fetch(url[1]);
  if (!resp.ok) throw new Error('No pude bajar ' + url[1]);
  writeFileSync(RAIZ + 'vendor/fuentes/' + nombre, Buffer.from(await resp.arrayBuffer()));
  salida.push(cara.replace(url[1], '../vendor/fuentes/' + nombre));
  bajadas++;
}

if (!bajadas) throw new Error('Google no devolvió caras woff2');
writeFileSync(RAIZ + 'estilos/fuentes.css', '/* Fossilis · Google Fonts servidas en local (generado por herramientas/fuentes.mjs). */\n' + salida.join('\n') + '\n');
console.log('Fossilis · ' + bajadas + ' fuentes en vendor/fuentes, estilos/fuentes.css escrito.');
