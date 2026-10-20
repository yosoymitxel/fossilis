# CAMBIOS.md · Fossilis

Registro completo de la elevación UI/UX (octubre 2026). Proyecto sin git: este archivo
es el equivalente al diff. Autoridad visual: `DESIGN.md`. Único archivo intervenido:
`index.html` (más `DESIGN.md` y la carpeta de verificación `.taste-skill/`).

Alcance: elevar sin romper. El mundo visual (mesa de fieltro, marco de madera, losetas
físicas, paleta esquisto/ámbar/arcilla, Bricolage Grotesque + IBM Plex Sans) no cambia;
suben jerarquía, claridad de acciones, legibilidad, accesibilidad, móvil y microinteracciones.

## 1. Documento y arranque

- Quitado `maximum-scale=1` del viewport: el zoom ya no queda bloqueado (accesibilidad móvil).
- Añadido `theme-color #12191B` (barra del navegador integrada con el mundo).
- Favicon SVG embebido (hueso ámbar sobre esquisto; antes no había y daba 404).
- `<noscript>` honesto: "Necesitas activar JavaScript para jugar."
- Splash `.carga` estático dentro de `#root`: hueso con latido mientras Babel compila
  (antes: pantalla vacía en la primera carga). Respeta `prefers-reduced-motion`.
- `body min-h-[100svh]` y fondo a `100svh`: altura correcta en móvil.

## 2. CSS del mundo

- `touch-action: manipulation` en controles: sin retardo de 300 ms al tocar en móvil.
- Foco visible global: anillo cinta de 2 px (`*:focus-visible`).
- Pulsos de selección acotados a 3 ciclos (antes infinitos): señalan, no decoran.
- Peones del tablero escalados con `clamp()` vía CSS scoped (`.celda-3d .peon-3d`,
  `.peon-sombra`): antes 24 px fijos, ahora acompañan el tamaño de la celda.
- `prefers-reduced-motion` ampliado: apaga hojas, velo, pulsos, latido, brotes, banda,
  fondo que deriva, perspectiva y transformaciones 3D del tablero.
- Retirada la textura `.carta-fisica::after` (rayas al 0.6 % de blanco: invisibles, sin función).
- Retiradas rayas diagonales muertas del contenedor del tablero (las pisaba la capa siguiente).

## 3. Hojas de interfaz (todas, vía componente Hoja)

- `role="dialog"` + `aria-modal` + `aria-label` con el título.
- Foco al panel al abrir, retorno de foco al cerrar, trampa de Tab, cierre con Escape.
- Botón de cierre de 36 px a 44 px.
- Cabecera sin línea divisoria: superficie y aire en vez de hairline.
- Subtítulo de 11 px a 12.5 px.

## 4. Emojis fuera de la interfaz

- Eliminados los 6 emojis (calavera, estrella auspiciosa, copo, dos rayos, aviso).
- Costes de cartas: campo `ic` y `FR_IC` reemplazados por el componente `Coste` con SVG propio.
- Eras biológicas: `ERA_BIO` reemplazado por `EraIco` (volcán, pino, copo dibujados).
- Rayo de energía y aviso: componentes SVG `Rayo` y `AvisoIco`.

## 5. Casillas del tablero

- `aria-label` descriptivo por casilla; `aria-disabled` cuando la casilla está atenuada.
- Micro-etiquetas legibles: fragmentos 12 px, "+n" y "vacía" a 10 px con opacidad corregida.
- Flechas de dirección más grandes (17 px, fondo esquisto 95 %, borde y sombra).
- Empujar tocando la casilla vecina (objetivo táctil = casilla completa) además de cada flecha.
- Teclado: flechas del cursor mueven, Escape cancela la selección.
- Helper `pasoHacia`: el empuje nunca salta de fila.

## 6. Menú (Setup)

- Rótulo "Yacimiento abierto" plegado al párrafo de entrada: un solo bloque de lectura.
- Título escalado 44 / 54 / 80 / 100 px (antes 58 px fijos): la primera pantalla tiene dueño.
- Párrafo a 16 px, hueso al 80 %, medida máxima 46ch.
- Ilustración del yacimiento con crecimiento en pantallas grandes.
- Filas sin separadores de 1 px: aire (`py-3`) y `flex-wrap`.
- Etiquetas a 16 px; selecciones de 40 px; casillas nativas de 24 px.
- Semilla: pozo hundido sin borde (sombra interior), texto a 16 px (evita el zoom de iOS), `aria-label`.
- Descargo: de 13 px gris a 16 px hueso al 75 %, medida 64ch.
- Tarjeta de ajustes sin contorno de 1 px: superficie llena con sombra.

## 7. Navegación

- Botones de pestaña (riel y barra inferior): icono + etiqueta siempre visibles, alto mínimo 44 px,
  `title` descriptivo. Antes: 33 px de alto y etiqueta condicional.
- Retirados los 2 `backdrop-blur` que quedaban.
- Barra inferior sin línea superior (el relieve lo da su sombra de barra fija).
- Toast con `role="status"` y `aria-live="polite"`.

## 8. Lógica de juego

- `marketCap(p)`: el tope de compra respeta la fase también en el subtítulo de la hoja del mercado
  y en la pista de fase.
- `canBuy` excluye las cartas `vacio`: ya no se puede comprar una carta fantasma al agotarse el mazo.

## 9. Marca

- Splash y favicon: estrella genérica sustituida por el hueso, iconografía del propio juego.

## 10. Tabla del desglose (pantalla final)

- Separadores de fila conservados por ser una tabla real, con excepción
  `taste-skill-ignore` documentada en la línea (mecanismo del lint de taste-skill).

## Cómo revisar

- Servidor local en `http://localhost:8123/` (o abrir `index.html` directamente).
- Lint de taste (vía lean-ctx):
  `lean-ctx -c 'node "C:/Users/Mitxel/.config/opencode/skills/taste-skill/scripts/lint.mjs" "C:/Users/Mitxel/Desktop/Proyectos de desarrollo/Fossilis/index.html"'`
- Inspector con renders en `.taste-skill/inspect/` (desktop, tablet, mobile).
- `impeccable.cmd detect index.html --json`: 0 errores, 2 avisos advisory de texturas
  deliberadas (documentados en `DESIGN.md`).

## Resultado medido

- Lint: de gradient 18 / shadow 14 / emoji 6 / hairline 7 / transition-all 5 / glass 2
  a solo gradient 16 y shadow 15 (dispositivos aprobados del mundo), 1 aviso de guiones
  largos heredado del copy original.
- Inspector 1440/768/390: de 10 FAIL / 6 WARN a **0 FAIL / 1 WARN** (quietud del menú,
  defendida: el movimiento vive en la partida).
- Consola: 0 errores (2 avisos esperados del prototipo: Tailwind CDN y Babel en navegador).

## Abierto (decisión tuya)

- 10 guiones largos del copy original (separadores del registro y marcadores de vacío):
  se conservan porque son tu texto; puedo limpiarlos si lo pides.
- Vida extra en el menú (aviso still-page): una animación lenta del dinosaurio sería el
  siguiente paso; no la tomé por ser decisión de dirección.
- `PRODUCT.md` de impeccable: pendiente de tus respuestas de dirección de producto.

## Fase 1b · Modularización (misma fecha)

El monolito `index.html` (2.481 líneas) se partió en 26 módulos sin cambiar una línea de lógica
de juego: `index.html` queda como ficha de carga (225 líneas) con un cargador secuencial propio
(Babel por módulo, sin build). El espacio común `FG.data / FG.core / FG.fx / FG.ui` está
documentado en `docs/ARQUITECTURA.md`.

- Reparto por rangos verificados con `herramientas/partir.mjs` (respaldo: `_respaldo/index.original.html`).
- Auditoría de costuras con `herramientas/auditar.mjs` (exportaciones contra uso real).
- Correcciones de frontera (todas registradas en el script): el azar pasa a API (`sembrar/rnd/ri`),
  `openPit` en la IA, `DIR_ES` en acciones, `rol/modo` en cartas, `DIRS/reach` en juego,
  `MUELLE` en la hoja modal, `TEX_URL` en la casilla, `Rayo/AvisoIco` exportados por paleo.
- Verificación de humo real (turnos, empuje fuera del tablero, las seis hojas): 0 errores de
  consola. Captura en `docs/evidencia/fase1b-humo.png`.
- Nuevo `servir.cmd` para levantar el servidor local con doble clic.

## Fase 2 · El gabinete (misma fecha)

La fase 2 reemplaza el mundo visual de la fase 1 por **el gabinete** (cuatro salas)
sin tocar una linea de logica de juego. Alcance: `estilos/gabinete.css`, los modulos
de `src/ui` y `src/fx`, y `index.html` (libreria de movimiento).

- Cuatro salas con tokens en `estilos/gabinete.css` (fuente de verdad): vitrina (la
  partida, bajo vidrio y lampara), modular (carga, menu y pausa), libreta (las hojas)
  y seccion (el cierre). Cada pantalla declara la suya con `data-sala`.
- `motion` retirado de `index.html`: todo el movimiento pasa por **anime.js v4**
  (UMD). `FG.fx.MOT` traduce los fotogramas al API v4 (`anime.animate`) y `easeDe`
  mapea los eases del sistema (inQuart / outQuart / inOutQuart; muelle `outBack(1.35)`).
  El arranque que fallaba por la API antigua quedo corregido ("Fossilis, 26 modulos",
  consola limpia).
- Piezas nuevas: marco de laton con vidrio y haz de lampara, pozo de luz bajo el
  tablero, teclas fisicas de 44px en el menu, semilla en pozo hundido, retrato de
  campo de DinoCard v2 con cinta y sello (sin imagenes: el placeholder de Kalam es el
  estado correcto), pausa y cierre en sus salas.
- Excepciones de material: 39 lineas de `estilos/gabinete.css` (gradientes y sombras
  fisicas) mas `src/fx/fx.js`, `src/ui/juego.jsx` y `src/ui/setup.jsx` llevan
  `taste-skill-ignore` en la linea exacta, con la razon a la vista.

Gates (re-ejecutables):

- Lint de taste sobre `index.html estilos src`: **0 FAIL / 4 WARN** (marcos reales,
  campo de semilla y 9 guiones largos heredados del copy original).
- Inspector 1440 / 768 / 390 sobre la app: **0 FAIL / 4 WARN** con
  `--allow shadow,button-fx,few-pictures`; capturas en `docs/evidencia/taste-final/`.
- `impeccable detect`: 0 anti-patrones; 2 avisos advisory (texturas deliberadas).
- Medicion movil a 390: ancho de scroll 390 (sin desborde), navegacion de 44px,
  111px de aire sobre el CTA al final del scroll (36px en el minimo), fila de acciones
  que cierra a 378px.
- E2E real: montaje de 25 losetas, movimiento (peon 20 a 10, energia 4 a 3, registro
  correcto), hojas de dinos con 4 placeholders y pausa con sincronia de `data-anim`.

Evidencia y herramientas:

- `docs/evidencia/taste-final/`: menu a 1440 / 768 / 390 con `report.json`.
- `docs/evidencia/juego/`: la partida a 1440 / 768 / 390 (Edge headless).
- `herramientas/vista-juego.html`: arnes que abre la partida en un iframe y la deja
  jugando; acepta `?w=<px>&h=<px>`. `herramientas/vista-anchos.html`: collage de la
  app viva a tres anchos.

## Fase 2 · Coherencia de las cuatro salas (misma fecha)

Corrección de la mezcla reportada: el amarillo del jugador de fase 1 (`#FFD23F`) se
colaba en el cromo de todas las salas porque `juego.jsx` lo pasaba como `col` a
botones, pestañas, pistas y casillas. Ahora el acento de la sala manda en toda
superficie de sistema y el color de jugador queda en piezas y tablas.

- `src/ui/juego.jsx`: topbar, energía, CTA de pausa, pista, teclas, badge de pestaña
  y aviso de evento en acento de sala; `col` sobrevive solo para las hojas y la banda
  «Turno de».
- `src/ui/pausa.jsx`: pausa modular pura (CTA y Apagar en teja, fichas en tinta), sin
  prop `col`.
- `src/ui/hoja.jsx` y `hojas.jsx`: punto de título en acento de sala; las 8 hojas
  dejan de recibir `col`; el marcador conserva la fila propia en color de jugador.
- `src/ui/atomos.jsx`: `BtnJ` en `bg-cinta sobre-acento`; botón neutro con `bg-borde`
  y el nuevo token `--sobre-borde`.
- `src/ui/tablero.jsx`: realce, flechas y foco de casilla en acento de sala.
- `src/ui/setup.jsx`: casillas con `accent-cinta`.
- `estilos/gabinete.css`: `--sobre-borde` por sala (vitrina `#F4EFE4`, modular
  `#FFFFFF`, libreta `#EFE8D4`, seccion `#FAF7EE`) y clase `.sobre-borde`.

Gates: lint **0 FAIL / 4 WARN**; inspector a 1440 / 768 / 390 **0 FAIL / 4 WARN**;
`impeccable detect` **0 errores** y 4 avisos advisory deliberados (estratos diagonales
y tres muelles de pieza); consola sin errores de aplicación (solo el aviso de Tailwind
CDN). E2E: CTA del menú, pausa (seguir y apagar sonido), las cuatro pestañas con
cierre por botón, Escape en hoja asentada y paso al mercado. Capturas antes y después
a 1440, 768 y 390 en `docs/evidencia/coherencia-salas/`.

## Fase 3 · Temas seleccionables (19 oct 2026)

El mundo del gabinete deja de ser un reparto fijo y pasa a ser el tema **Gabinete**
por defecto, con cuatro temas más que visten toda la app con una sola sala. El tema
se elige en el menú (fila «Tema · Elegir» dentro de la tarjeta de ajustes) y en la
pausa (fichas siempre visibles); el mismo componente `Temas` manda en ambos sitios.

- `src/fx/entorno.js`: `TEMAS`, `TemaCtx`, `useTema` y `salaDe(base, tema)`;
  `salaDe` conserva el reparto de Gabinete y devuelve la sala del tema fijo en el
  resto.
- `src/app.jsx`: el tema vive en `App` (no en cada pantalla), se provee por contexto
  y sincroniza `document.documentElement.dataset.sala`; sin persistencia entre
  recargas, como los demás ajustes de prototipo.
- `src/ui/atomos.jsx`: `Temas` con cinco fichas de 44px (`aria-pressed`, muestra de
  color y `data-tema`) y las notas `NOTA_TEMA`/`NOMBRE_TEMA`.
- `src/ui/setup.jsx`: fila `Tema · <nombre> · Elegir` plegable en la tarjeta; al
  abrir muestra las fichas sin empujar el CTA fuera del primer pliegue móvil.
- `src/ui/pausa.jsx`: bloque de tema con las cinco fichas a la vista; cambiar de
  tema en pausa no reinicia ni cierra la partida.
- `src/ui/juego.jsx`, `hoja.jsx` y `final.jsx`: resuelven su sala con `salaDe`; el
  tablero se re-materializa por tema (sin vidrio, lámpara ni sombra de contacto en
  salas claras; cantos duros para conservar la altura de las losetas) y el desglose
  del cierre usa `cuaderno` para no quedar sobre vidrio en Libreta y Sección.
- `estilos/gabinete.css`: overrides de tablero por tema, fondo del encabezado y del
  tablero por tokens, textura de cuerpo oculta en salas claras y superficie de las
  hojas en Sección.
- `src/ui/setup.jsx` y `src/ui/atomos.jsx`: `bg-superficie` (clase inexistente en el
  tema Tailwind) pasa a `bg-sedimento`; la semilla y las selecciones dejan de quedar
  blancas en Libreta, Sección y Vitrina.
- `herramientas/vista-juego.html`: `?tema=<id>`, `?paso=menu|tema|pausa` y `?solo=1`
  para capturas limpias del tema y del tablero.

Gates: lint **0 FAIL / 4 WARN**; inspector 1440 / 768 / 390 **0 FAIL / 4 WARN** con
`--allow shadow,button-fx,few-pictures`; `impeccable detect` **0 errores** y 4 avisos
advisory preexistentes (estratos de la vitrina y tres muelles de pieza); consola sin
errores de aplicación. Verificación visual en `docs/evidencia/temas/` (menú, partida
Modular a 390 / 768 / 1440, Libreta, Sección, Vitrina y pausas). El tema por defecto
sigue siendo **Gabinete** (la partida oscura de la vitrina); para la app clara hay
que elegir **Modular**.

## Ajuste del tema por defecto (20 oct 2026)

Gabinete dejó de ser el reparto de cuatro salas y pasó a ser una sola sala oscura
(vitrina) en toda la app: arranque, partida, menú, pausa, hojas y cierre comparten
el mismo mundo. `salaDe` devuelve `vitrina` para `gabinete`, el arranque usa
`data-sala="vitrina"` y la ficha de Gabinete muestra un solo color. El resto de
temas (Modular, Libreta, Sección) no cambia.
