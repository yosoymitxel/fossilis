// Fossilis · genera estilos/losetas/*.png desde suelos de polyfork.dev (ver texturas.html).
// Uso: con el servidor en marcha (npm run dev), `node herramientas/texturas.mjs`. Necesita Playwright.
import { writeFileSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
// require y no import: así también vale un Playwright instalado global (NODE_PATH).
const { chromium } = createRequire(import.meta.url)('playwright');

const BASE = process.env.FOSSILIS_URL || 'http://localhost:8123/';
const TEXTURAS = {
  arena:   'dry-soft-sand-tile-4a1df7',     // dunas facetadas con alguna piedrita
  arcilla: 'wet-packed-sand-tile-913ddb',   // vetas en capas: se lee como estrato
  piedra:  'crypt-flagstone-floor-b86b1a',  // losa agrietada
};

mkdirSync('estilos/losetas', { recursive: true });
const navegador = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const pagina = await navegador.newPage();
await pagina.goto(BASE + 'herramientas/texturas.html');
await pagina.waitForFunction(() => window.listo);
for (const [nombre, id] of Object.entries(TEXTURAS)) {
  const url = await pagina.evaluate(id => window.textura(id), id);
  writeFileSync('estilos/losetas/' + nombre + '.png', Buffer.from(url.split(',')[1], 'base64'));
  console.log('  estilos/losetas/' + nombre + '.png  ← ' + id);
}
await navegador.close();
