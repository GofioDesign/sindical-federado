# Sindical Federado

Motor web estático, configurable y replicable para comités de empresa y secciones sindicales. San Blas es la primera configuración de ejemplo.

Incluye noticias locales, ingestión federada, buscador global, panel de seguimiento y calendario, convenio HTML enlazable, prevención por puestos, encuestas, aviso global con caducidad, enlaces a N2 y WhatsApp, RSS, JSON Feed, sitemap y un acceso editorial orientado a Google Forms/Sheets.

## Inicio rápido

1. Instala Node.js 20 o superior.
2. Edita `config/site.json` y los JSON de `content/`.
3. Ejecuta `npm run build && npm run check`.
4. Publica la carpeta `dist/` o activa GitHub Pages con GitHub Actions.

No hay dependencias de producción ni base de datos. Consulta [SETUP.md](SETUP.md), [docs/MODELO-DE-DATOS.md](docs/MODELO-DE-DATOS.md) y [SECURITY.md](SECURITY.md).

## Estado

Versión 0.2.3 pública, con etiquetas visuales Local/RSS, imágenes remotas, extractos de ambas fuentes y carga progresiva de noticias. La autenticación y cualquier tratamiento de afiliación sindical quedan deliberadamente fuera de esta fase.
