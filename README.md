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

## Temas

El tema se elige en el menú (`Tema · Elegir`) y en la pausa. **Gabinete** es el
reparto original de cuatro salas; **Modular** es el tema claro; **Vitrina**,
**Libreta** y **Sección** visten toda la app con una sola sala. El tema no se
guarda entre recargas.

## Documentación

- `DESIGN.md`: dirección visual y reglas de las salas.
- `CAMBIOS.md`: registro de cambios de las fases.
- `docs/ARQUITECTURA.md`: carga, módulos y deuda viva.
- `docs/evidencia/`: capturas de verificación.

## Estado

Juego jugable de principio a fin. El estado de la partida y los ajustes de
prototipo (tema, sonido, animación) no se persisten entre recargas.
