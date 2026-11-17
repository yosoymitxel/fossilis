# Fossilis

Adaptación web del juego de mesa Fossilis. Tablero 5x5 por semilla, excavación con
empuje de losetas, fósiles, laboratorio, mercado, eventos y bots. Sin build: HTML,
CSS y módulos JS que se cargan en el navegador.

## Jugar en local

Requiere un servidor estático (los módulos no cargan con `file://`):

```
npx -y http-server -p 8123 -c-1 .
```

O doble clic en `servir.cmd`. Abrir `http://localhost:8123/`.

## Pantallas

Portada con diorama 3D del yacimiento (modelos de polyfork.dev; si no hay red queda la ilustración
SVG), preparación de la mesa con nombres y bots por asiento, opciones (volumen, ambiente,
animaciones, escenas intermedias, ritmo de bots, pistas, tema) y escenas intermedias: apertura,
evento, esqueleto completo, relevo entre personas, última ronda y cierre.

## Temas

El tema se elige en el menú (`Tema · Elegir`) y en la pausa. **Gabinete** es el
tema oscuro por defecto; **Modular**, **Libreta** y **Sección** visten toda la app
con una sola sala.

## Documentación

- `DESIGN.md`: dirección visual y reglas de las salas.
- `CAMBIOS.md`: registro de cambios de las fases.
- `docs/ARQUITECTURA.md`: carga, módulos y deuda viva.
- `docs/evidencia/`: capturas de verificación.

## Estado

Juego jugable de principio a fin. Ajustes y partida en curso se guardan en este
dispositivo (`localStorage`); la portada ofrece continuar.
