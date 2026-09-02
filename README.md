# Sindical Federado

Motor web estático, configurable y replicable para comités de empresa y secciones sindicales. San Blas es la primera configuración de ejemplo.

Incluye noticias locales, ingestión federada, buscador global, panel de seguimiento y calendario, convenio HTML enlazable, prevención por puestos, encuestas, aviso global con caducidad, enlaces a N2 y WhatsApp, RSS, JSON Feed, sitemap y un acceso editorial orientado a Google Forms/Sheets.

Los artículos propios pueden escribirse en `content/articles/*.md`. La página `/publicar/` genera borradores Markdown mediante un editor enriquecido, con vista previa, imagen destacada, imágenes interiores y descarga.

## Inicio rápido

1. Instala Node.js 20 o superior.
2. Edita `config/site.json` y los JSON de `content/`.
3. Ejecuta `npm run build && npm run check`.
4. Publica la carpeta `dist/` o activa GitHub Pages con GitHub Actions.

No hay dependencias de producción ni base de datos. Consulta [SETUP.md](SETUP.md), [ROADMAP.md](ROADMAP.md), [docs/MODELO-DE-DATOS.md](docs/MODELO-DE-DATOS.md) y [SECURITY.md](SECURITY.md).

## Estado

Versión 0.3.5, con editor enriquecido, imágenes destacadas e interiores, instrucciones de subida a Drive, etiquetas configurables por fuente y formato de fecha configurable. La autenticación y cualquier tratamiento de afiliación sindical quedan deliberadamente fuera de esta fase.
