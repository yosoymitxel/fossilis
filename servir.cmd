@echo off
title Fossilis · servidor local
echo Sirviendo Fossilis en http://localhost:8123/
npx -y http-server -p 8123 -c-1 .
