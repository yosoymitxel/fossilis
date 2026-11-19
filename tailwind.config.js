// Fossilis · configuración de Tailwind para el CSS precompilado.
// El cargador de desarrollo inyectaba esta misma extensión desde index.html;
// ahora vive aquí y se compila una vez con `npm run build`.
module.exports = {
  content: [
    './index.html',
    './desarrollo.html',
    './src/**/*.{js,jsx}',
    './herramientas/**/*.html'
  ],
  theme: {
    extend: {
      colors: {
        esquisto: 'rgb(var(--fondo) / <alpha-value>)',
        sedimento: 'rgb(var(--superficie) / <alpha-value>)',
        borde: 'rgb(var(--borde) / <alpha-value>)',
        tenue: 'rgb(var(--tenue) / <alpha-value>)',
        hueso: 'rgb(var(--tinta) / <alpha-value>)',
        cinta: 'rgb(var(--acento) / <alpha-value>)',
        arena: 'rgb(var(--arena) / <alpha-value>)',
        arcilla: 'rgb(var(--arcilla) / <alpha-value>)',
        piedra: 'rgb(var(--piedra) / <alpha-value>)'
      },
      fontFamily: {
        display: ['Archivo', 'system-ui', 'sans-serif'],
        sans: ['Archivo', 'system-ui', 'sans-serif']
      }
    }
  }
};
