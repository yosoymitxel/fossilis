# DESIGN.md · Fossilis

Adaptación web del juego de mesa de paleontología. El sistema visual se llama
**el gabinete**: un museo con cuatro salas. Este documento fija el mundo para que
cualquier cambio futuro lo respete. La fuente de verdad de los tokens es
`estilos/gabinete.css`.

## El gabinete

Cada pantalla declara su sala con `data-sala` y hereda su paleta. La partida vive
bajo la vitrina: losetas de excavación con relieve, marco de latón, vidrio y la
lámpara cayendo desde arriba. Las hojas de consulta son papel pautado; el menú, el
sistema imprimido; el cierre de temporada, una lámina de sección.

Ese reparto es el tema **Gabinete**, el de por defecto. La app también puede vestirse
entera con una sola sala: **Vitrina**, **Modular**, **Libreta** o **Sección**. El tema
se elige en el menú y en la pausa; Modular es la referencia clara.

Todo lo que se pulsa *se puede tocar*: las piezas llevan borde bajo, sombra de
contacto dura y se hunden al presionar. La interfaz no imita una app: imita objetos
sobre una mesa de museo.

Referencias: diorama de excavación (arena, arcilla, yeso, hueso) + señalética de
museo de historia natural + libreta de campo.

## Las cuatro salas (tokens en `estilos/gabinete.css`)

- **vitrina · la partida** (juego): piso `#0D0F10`, tinta `#F4EFE4`, luz
  `#CFE0E8`, latón `#A97F3C`, pozo `#090B0C`; materia del yacimiento re-tonada
  (arena 201 174 131 · arcilla 176 119 92 · piedra 147 156 164).
- **modular · el sistema** (carga, menú, pausa): piso `#EAE7E1`, superficie
  blanca, tinta y borde `#17181A`, teja `#3E7C8F`, roja `#C24B3A`.
- **libreta · las hojas** (dinos, mercado, equipo, marcador): papel `#E7DEC6`,
  superficie `#EFE8D4`, grafito `#2A2A27`, rojo lápiz `#A6382C`.
- **seccion · el cierre** (final): cal `#F1EDE3`, carbón `#26292D`, sol `#E4B054`,
  sombra `#7A8CA8`.

Regla: la materia del yacimiento existe en todas las salas, re-tonada a su luz.
Tailwind consume los tripletes con `rgb(var(--x) / <alpha>)`; `--sobre-acento` es la
tinta que se posa sobre el acento de cada sala.

**El acento de la sala manda en el sistema.** CTA, pausa, pestaña activa, energía,
pista, foco, realces y flechas usan `rgb(var(--acento))`, `bg-cinta` o `text-cinta`,
con `--sobre-acento` como tinta encima. El botón neutro usa `bg-borde` y el token
`--sobre-borde`, que también cambia por sala; no hay hueso fijo. El color de jugador
no pinta cromo: vive solo en piezas y tablas (peón, banda «Turno de», PV flotante,
fila propia del marcador, eras y materiales). Así cada sala se lee como un tema
limpio y no como una mezcla.

## Temas seleccionables

- **Gabinete** (por defecto): conserva el reparto de las cuatro salas.
- **Vitrina**: toda la app en la sala a oscuras.
- **Modular**: toda la app en piso claro; referencia clara.
- **Libreta**: toda la app en papel pautado.
- **Sección**: toda la app en cal.

El selector `Temas` vive en la tarjeta del menú (fila `Tema · <nombre> · Elegir`,
plegable para no empujar el CTA del primer pliegue móvil) y en la pausa (fichas a la
vista). Cada ficha es un botón de 44px con `aria-pressed`, muestra de color y
`data-tema`; la nota explica el tema activo.

El estado vive en `App` (`TemaCtx`, `useTema`) y cada pantalla resuelve su sala con
`salaDe(base, tema)`: en Gabinete devuelve el reparto de siempre; en un tema fijo
devuelve esa sala. `App` sincroniza `html[data-sala]`, de modo que fondo, tinta,
foco, textura y acento cambian a la vez. No hay persistencia entre recargas, como el
resto de ajustes de prototipo; el tema se mantiene al reiniciar la partida porque vive
por encima de `Setup` y `Game`.

El tablero se re-materializa por tema sin tocar la lógica: en las salas claras se
ocultan el vidrio, la lámpara y la sombra de contacto, el marco pierde la perspectiva
y las losetas conservan su altura con cantos duros (sombra inferior o contorno
interior). Los colores de material, piezas y tablas no cambian.

## Tipografía

- Display y texto: **Archivo** (700/800/900 en titulares; 400/500 en lectura).
- Mano: **Kalam**, solo para el placeholder del retrato de campo y marcas de la
  libreta. Nunca para texto de lectura.
- Cuerpo ≥13px; por debajo solo micro-etiquetas de pieza (contador de energía,
  "+n" del yacimiento). Rótulos en mayúsculas con tracking 0.16em (`.rotulo`).
- Titular del menú: 100px en escritorio; 54 / 44 en tableta y móvil.

## Dials

- **ENERGY 3/10** — calma de vitrina. El dramatismo vive en las acciones (empujes,
  eventos, fichas), nunca en el marco.
- **RHYTHM 2/10** — densidad de tablero y riel lateral; es aire de partida, no de
  landing.
- **MOTION 3/10** — micromovimientos con muelle (hojas, fichas, chispas). Nada se
  mueve sin comunicar estado; los pulsos señalan y se acotan (3 ciclos).

## Materiales y desviaciones deliberadas del house style

El mundo material *exige* estos dispositivos; están marcados con
`taste-skill-ignore` en su línea exacta (39 en `estilos/gabinete.css` y 3 sueltos)
y el inspector corre con `--allow shadow,button-fx,few-pictures`:

- `gradient` + `shadow` + `button-fx`: vidrio, latón, lámpara y losetas son
  físicos; las teclas y las fichas se hunden. No es decoración: es la identidad.
- `text-shadow`: el número flotante sobre el tablero necesita separarse del fondo
  (`src/fx/fx.js`).
- Radial del charco de luz bajo la vitrina (`src/ui/juego.jsx`) y niebla del hero
  sobre las siluetas (`src/ui/setup.jsx`), ambos marcados.
- `palette-cream`: el piso modular `#EAE7E1` es piedra cálida, no crema amarilla.
- `few-pictures` + `no-footage`: el mundo está dibujado en CSS y SVG; los retratos
  de dinosaurio cargan paleoarte real en las cartas. Sin imagen, el retrato cae en
  el placeholder de Kalam con el Emblema como sello. No se añaden fotos ni video.
- `outlined-box`: el marco de latón y el pozo de la semilla son piezas reales, no
  cajas dibujadas.
- `em-dash` heredado: 9 guiones del copy original (registro y marcador de vacío),
  conservados por decisión del autor.
- `still-page`: el menú entra en calma por diseño; el movimiento pertenece a la
  partida.

## Movimiento (anime.js v4)

- Único motor: **anime.js v4** (UMD). `motion` quedó retirado del `index.html`.
- `FG.fx.MOT` traduce los fotogramas `{propiedad:[desde,hasta]}` a la API v4
  (`anime.animate`); `easeDe` mapea los eases del sistema a `inQuart / outQuart /
  inOutQuart` y el rebote de casa a `outBack(1.35)`.
- Pulsos de selección acotados a 3 ciclos; nada se mueve sin comunicar estado.
- `prefers-reduced-motion` (o el interruptor de ajustes) apaga todo:
  `data-anim="off"` corta los respaldos CSS y `MOT()` devuelve un motor quieto.

## Accesibilidad

- Foco visible global (anillo del acento de la sala); hojas como `role="dialog"`
  con foco inicial, trampa de Tab, cierre con Escape y retorno de foco.
- Objetivos táctiles ≥44px en navegación, cierres y selecciones del menú; la pista
  se cierra con un botón de 25px (sobre el mínimo AA de 24px); casillas nativas de
  24px.
- Teclado: flechas del cursor mueven, Escape cancela; el empuje también se toca en
  la casilla vecina (objetivo = toda la casilla).
- Zoom permitido en móvil; campos de formulario a 16px para evitar el zoom de iOS.
- Contraste: tinta sobre el fondo de su sala; los grises tenues quedan para notas.

## Verificación (fase 2, oct 2026)

- Lint de taste-skill sobre `index.html estilos src`: **0 FAIL / 4 WARN** (avisos
  de arriba, defendidos).
- Inspector a 1440 / 768 / 390 sobre la app: **0 FAIL / 4 WARN** con
  `--allow shadow,button-fx,few-pictures`; capturas en `docs/evidencia/taste-final/`.
- `impeccable detect` sobre los archivos de UI: **0 errores**; 4 avisos advisory
  deliberados (estratos diagonales de la vitrina y tres muelles de pieza).
- Partida real medida a 390: ancho de scroll 390 (sin desborde), navegación de 44px
  con 111px de aire sobre el CTA al final del scroll (36px en el caso más justo) y
  fila de acciones que cierra a 378px. Capturas en `docs/evidencia/juego/`
  (Edge headless a 390 / 768 / 1440).
- E2E: montaje de 25 losetas, movimiento (peón 20 a 10, energía 4 a 3), hojas de
  dinos con 4 placeholders correctos y pausa con sincronía de `data-anim`.

### Temas (19 oct 2026)

- Selector verificado en menú y pausa; cambiar de tema en pausa no reinicia ni cierra
  la partida.
- Capturas en `docs/evidencia/temas/`: menú con el selector plegado y desplegado,
  partida Modular a 390 / 768 / 1440, partida Libreta / Sección / Vitrina a 390 y
  pausas Modular / Libreta / Sección / Vitrina.
- Lint **0 FAIL / 4 WARN**; inspector 1440 / 768 / 390 **0 FAIL / 4 WARN**;
  `impeccable detect` **0 errores** y 4 avisos advisory preexistentes.
- La semilla y las selecciones usan `bg-sedimento` (la clase `bg-superficie` no
  existía en el tema Tailwind); en Libreta, Sección y Vitrina ya no quedan campos
  blancos.
- El tema por defecto es Gabinete; para la app clara hay que elegir Modular.

## Registro de decisiones

Fase 1 (conservado): rótulos plegados al párrafo, títulos escalados, filas sin
hairlines, hojas unificadas como diálogos, iconos SVG sin emoji, texturas sin
función retiradas, tarjeta del menú sin contorno.

Fase 2:

- Las cuatro salas y su reparto: vitrina para la partida, modular para el sistema,
  libreta para las hojas, seccion para el cierre.
- Archivo sustituye a Bricolage Grotesque e IBM Plex Sans; Kalam queda para la mano.
- `motion` retirado; todo el movimiento pasa por anime.js v4.
- DinoCard v2: retrato de campo pegado con cinta y sello; sin imágenes todavía, el
  placeholder de Kalam es el estado correcto.
- Las recetas de material se marcan `taste-skill-ignore` en la línea exacta: el
  gate queda verde y re-verificable, la excepción queda visible donde importa.
- Coherencia de salas (19 oct 2026): el acento de la sala gobierna todo el cromo de
  sistema y el color de jugador queda en piezas y tablas. Evidencia antes/después en
  `docs/evidencia/coherencia-salas/`.

Fase 3:

- Temas seleccionables (19 oct 2026): Gabinete por defecto (cuatro salas) y cuatro
  temas de sala única; selector en menú y pausa; sin persistencia entre recargas; el
  tablero se re-materializa por CSS sin tocar la lógica.
