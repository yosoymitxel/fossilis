# ARQUITECTURA.md · Fossilis

Mapa y contrato del código tras la modularización (fase 1b). El monolito original quedó como
referencia en `_respaldo/index.original.html`; nada del juego se reescribió: cada módulo es un
corte exacto del original más su cabecera de dependencias y su exportación.

## Cómo se carga (sin build)

`index.html` ya no contiene el juego: es la ficha de carga (225 líneas).

1. Librerías por `<script src>`: React 18, ReactDOM 18, anime.js v4 (UMD, único motor de
   movimiento) y Babel standalone.
2. Un cargador propio recorre la lista `MODULOS` (única fuente de orden en `index.html`), hace
   `fetch` de cada archivo, lo compila con `Babel.transform` (preset react, runtime classic,
   sourceType script) y lo ejecuta en orden. Si un módulo falla, lo dice en consola y en el
   splash, y se detiene.
3. Cada módulo publica su API en el espacio global `FG`: `FG.data`, `FG.core`, `FG.fx`, `FG.ui`.

Requiere servidor estático (los `fetch` no funcionan con `file://`):
`npx -y http-server -p 8123 -c-1` (o doble clic en `servir.cmd`).

## Reglas de la casa

- Orden de carga = lista `MODULOS` en `index.html`; un módulo solo lee buckets ya cargados.
- `data/`: solo datos. Nada ejecuta.
- `core/`: JS puro, sin DOM ni React. El azar entra por `sembrar / rnd / ri` (API de `core/azar`).
- `fx/`: efectos y audio. No conocen reglas del juego; reciben nodos o datos.
- `ui/`: presenta y reacciona. No define reglas; consume `FG.core` y `FG.data`.
- Dependencia nueva: se declara en la cabecera (`const {...} = FG.x;`) y en el pie (`Object.assign`).
  El auditor detecta lo que falte.

## Mapa (26 módulos)

| Módulo | Rol | Exporta (resumen) |
|---|---|---|
| data/fosiles.js | Materiales, huesos, dinos, constantes del montaje | MAT, BONE, DINOS, FR, COLORS, STONE_SPOTS |
| data/cartas.js | Herramientas, suministros, habilidades, eventos | TOOL_DESIGNS, SUPPLY_DESIGNS, SKILLS, EVENTS |
| core/azar.js | Semilla y azar reproducible | mulberry32, ri, shuffle, sembrar, rnd |
| core/geometria.js | Rejilla 5x5, vecindades, bordes | rc, ix, DIRS, step, ortho, diag, pasoHacia |
| core/partida.js | Montaje y consultas de partida | setupGame, makeTile, cur, has, caps, clone |
| core/tablero.js | Objetivos y planes de excavación | digTargets, moveTargets, planDig, applyOps, reach |
| core/economia.js | Pagos, mercado, yeso | applyTile, solvePayment, gainPlaster |
| core/eventos.js | Ronda, eventos, mazo de mercado | resolveEvent, drawMarket |
| core/puntuacion.js | Recuento final | finalScoring, PASOS |
| core/acciones.js | Despachador de acciones y fin de turno | act, endTurn |
| core/ia.js | Heurística de los bots | boneUtility, aiStep |
| fx/entorno.js | Pantalla completa, reduced motion, MOT (anime.js v4) y tema global | irPantallaCompleta, SUAVE, AJUSTES, quieto, syncAnim, MOT, MUELLE, TEMAS, TemaCtx, useTema, salaDe |
| fx/fx.js | Paleta, partículas, flotantes, sacudidas, gestos | PALETA, MAT_PAL, Chispas, flotanteEn, GESTO |
| fx/audio.js | WebAudio de la excavación | son, SON, tono, ruido, arpegio |
| ui/iconos.jsx | Iconografía y texturas SVG | ICONO, Ic, Bone, Hammer, TEX, Ico |
| ui/paleo.jsx | Retratos, siluetas, eras, emblemas | buscarDino, Silueta, ERA_COL, Emblema, Rayo |
| ui/atomos.jsx | Piezas compartidas de interfaz y selector de tema | Btn, BtnJ, BtnEra, Frags, Peon, Coste, Banda, Temas, NOTA_TEMA, NOMBRE_TEMA |
| ui/hoja.jsx | Hoja modal (foco, Escape, animación) | Hoja |
| ui/tablero.jsx | La casilla del tablero | Cell |
| ui/cartas.jsx | Cartas de dino y de mercado | DinoCard, MarketCard |
| ui/setup.jsx | Menú de partida | Setup |
| ui/pausa.jsx | Hoja de pausa | Pausa |
| ui/final.jsx | Pantalla final | Final |
| ui/hojas.jsx | Las hojas de consulta | Hojas |
| ui/juego.jsx | Tablero vivo: juego, turnos, animación | Game |
| app.jsx | Raíz React, estado de tema y montaje | (monta la app) |

El sistema visual vive en `estilos/gabinete.css`: tokens de las cuatro salas
(`data-sala`), base, piezas de sistema y recetas de material marcadas. `index.html`
lo carga antes que los módulos.

## Herramientas

- `herramientas/partir.mjs`: reparte el monolito por rangos verificados y regenera `src/` e
  `index.html` (idempotente: siempre lee `_respaldo/index.original.html`). Las correcciones de
  costura viven en sus especificaciones.
- `herramientas/auditar.mjs`: cruza las exportaciones `FG` contra el uso real de cada archivo.
  Hoy limpio (el falso positivo conocido de `puntuacion.js` vive en su lista de ignorados).
- `herramientas/vista-anchos.html`: collage de la app viva a 390 / 768 / 1440.
- `herramientas/vista-juego.html`: arnés de la partida (arranque automático en iframe,
  `?w=<px>&h=<px>`, `?tema=<id>`, `?paso=menu|tema|pausa` y `?solo=1` para capturas limpias);
  origen de las capturas de `docs/evidencia/juego/` y `docs/evidencia/temas/`.

## Verificación (fase 1b)

Partida real de humo con consola limpia (0 errores): montaje, 25 losetas, tres turnos de bots
con registro, mercado ("No comprar"), laboratorio ("Terminar turno"), modo Cavar, empuje de
loseta fuera del tablero (caída del peón, energía 4 a 3) y vuelta al tajo. Hojas abiertas y
cerradas: Dinos, Mercado, Equipo, Marcador y Pausa. Captura en `docs/evidencia/`.

## Verificación (fase 2)

Gates re-ejecutables (oct 2026): lint de taste 0 FAIL / 4 WARN; inspector 1440 / 768 / 390
0 FAIL / 4 WARN con `--allow shadow,button-fx,few-pictures`; `impeccable detect` 0
anti-patrones. Medición móvil a 390: sin desborde (scroll 390), navegación de 44px con
111px de aire sobre el CTA. E2E: montaje, movimiento con energía, hojas y pausa. Evidencia
en `docs/evidencia/` (menú y partida a tres anchos).

## Temas seleccionables (19 oct 2026)

El tema **Gabinete** por defecto es la sala oscura de la vitrina en toda la app;
**Modular**, **Libreta** y **Sección** visten toda la app con una sola sala. El estado del tema
vive en `app.jsx` y se comparte por `TemaCtx`; cada pantalla resuelve su sala con `salaDe(base,
tema)` y `html[data-sala]` sincroniza los tokens. El selector `Temas` está en el menú y en la
pausa; no hay persistencia entre recargas. La lógica de juego no cambia: el tablero se
re-materializa por CSS y conserva la altura de las losetas con cantos duros en las salas claras.
Evidencia en `docs/evidencia/temas/`; gates: lint 0 FAIL / 4 WARN, inspector 0 FAIL / 4 WARN,
`impeccable detect` 0 errores y 4 avisos preexistentes.

## Deuda viva

- Fase 2 cerrada (oct 2026): el mundo del gabinete está implementado, verificado y
documentado; `motion` quedó retirado de `index.html`.
- Retratos de dinosaurio: cargan paleoarte real; sin imagen, el placeholder de Kalam
con el Emblema es el estado correcto.
- Tailwind CDN y Babel en navegador avisan en consola (prototipo; aceptado).
- La partida no se persiste entre recargas (decisión de prototipo).
- Partida a 768: usa el layout móvil; la barra inferior fija puede tapar la primera fila
  de acciones hasta hacer scroll. Es comportamiento previo, no del sistema de temas; no
  se tocó el layout del juego.
