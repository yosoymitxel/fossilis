# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Miguel y quien se siente a la mesa. Partidas en el navegador con el móvil pasando de mano en
mano, y también en escritorio. De dos a cinco paleontólogos: todos humanos (pass-and-play) o
mezclados con bots. El trabajo: echar una partida completa de Fossilis sin montar nada y con la
sensación de estar jugando al juego físico.

## Product Purpose

Adaptación personal de Fossilis: el juego de mesa completo en una página web. Tablero 5x5 con
montaje por semilla, excavación con empuje de losetas, fósiles, laboratorio, mercado y eventos,
herramientas, habilidades, puntuación final con mayorías y lotes, y bots para los asientos
vacíos. Éxito: que una mesa juegue de principio a fin y sienta un juego terminado y profesional,
no un prototipo.

## Positioning

Adaptación sin ánimo de lucro y sin material del editor que lleva el juego completo al navegador
con experiencia de mesa física: no pide cuenta ni instalación, vive en el móvil de la mesa y
conserva reglas íntegras, ajustes de partida y montaje reproducible por semilla.

## Operating Context

- La partida se juega en la mesa, con el móvil o la tableta como tablero; el escritorio sirve
  tanto para jugar como para revisar.
- Proyecto sin git: los cambios se registran en `CAMBIOS.md`; la interfaz se documenta en
  `DESIGN.md` y la estructura en `docs/ARQUITECTURA.md`.
- Se sirve como sitio estático en local (`servir.cmd`, http-server en el puerto 8123); los
  módulos se cargan por fetch, así que `file://` no vale.
- La verificación es una partida real observada en el navegador; los gates de estilo acompañan,
  pero la prueba es jugar.

## Capabilities and Constraints

- Reglas completas: montaje 5x5 por semilla (arena, arcilla, piedra), excavación y empuje, caída
  y vuelta del peón, huesos, laboratorio, mercado, eventos, herramientas, suministros,
  habilidades y puntuación final.
- Ajustes de partida: de 2 a 5 paleontólogos, bots libres, habilidades de enfrentamiento, lotes
  y mayorías.
- Sonido WebAudio, pantalla completa y soporte de movimiento reducido.
- Interfaz en español; es el único idioma.
- Sin build: React y Babel en el navegador, Tailwind por CDN, y el juego repartido en 26 módulos
  con un cargador propio.
- Restricción legal y ética: sin material del editor y con atribuciones visibles (iconos
  CC BY 3.0 de game-icons.net; retratos desde Wikipedia/Wikimedia Commons).
- Abierto: plan de publicación (hoy consta como adaptación personal no comercial).

## Brand Commitments

- Nombre: Fossilis · yacimiento (adaptación personal del juego de David Díaz, publicado por Kids
  Table Board Gaming).
- Tono de expedición y museo: vinculante y elegido por el autor; no se cambia por un registro de
  fantasía o de videojuego arcade.
- Cuatro compromisos de experiencia que ninguna fase pierde: legibilidad y claridad, sensación de
  juego físico, velocidad y fluidez, tono de expedición y museo.
- Las atribuciones y la nota de adaptación se mantienen visibles; el vocabulario de la interfaz
  es el del oficio paleontológico (yacimiento, loseta, yeso, fragmentos, laboratorio, tajo).

## Evidence on Hand

- Juego funcional completo: `index.html` (ficha de carga) + 26 módulos en `src/`
  (mapa en `docs/ARQUITECTURA.md`).
- Monolito original de referencia: `_respaldo/index.original.html`.
- Registro de cambios: `CAMBIOS.md`; mundo visual de la fase 1: `DESIGN.md` (se reescribe al
  cierre de la fase 2).
- Evidencia de humo: `docs/evidencia/fase1b-humo.png`.
- Herramientas propias: `herramientas/partir.mjs` y `herramientas/auditar.mjs`.
- Ausencias que no se inventan: no hay material del editor, ni métricas de usuarios, ni
  testimonios, ni fotografías propias; el paleoarte llega de Wikimedia y los iconos de
  game-icons.net.

## Product Principles

1. La mesa manda: se decide y se verifica en una partida real, móvil en mano.
2. Lo que se toca se siente: materiales y gestos antes que controles de plantilla.
3. De un vistazo: claridad y legibilidad por encima del ornamento, a distancia de mesa.
4. Fluidez sin freno: la animación comunica estado, nunca bloquea el turno.
5. Crédito y respeto: sin ánimo de lucro, sin material del editor, atribuciones visibles.

## Accessibility & Inclusion

- Se respeta `prefers-reduced-motion` (pulsos, latidos y brotes se apagan).
- Contraste hueso sobre esquisto para la tinta principal; el gris tenue queda para notas.
- Objetivos táctiles de al menos 40px en controles densos y 44px en navegación y cierre.
- Foco visible global; las hojas son diálogos con foco inicial, trampa de tabulación, Escape y
  retorno de foco.
