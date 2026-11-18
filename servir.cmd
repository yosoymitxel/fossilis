@echo off
title Fossilis · servidor local
if exist node_modules (
  echo Compilando la version rapida...
  call npm run build
) else (
  echo Aviso: sin node_modules. Sirvo lo ya compilado.
  echo Para compilar: npm install ^&^& npm run build
)
echo Sirviendo Fossilis en http://localhost:8123/
npx -y http-server -p 8123 -c-1 .
