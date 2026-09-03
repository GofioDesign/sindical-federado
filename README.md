# Sindical Federado

Motor web estático, configurable y replicable para comités de empresa y secciones sindicales. San Blas es la primera configuración de ejemplo.

Incluye noticias locales y federadas, buscador, seguimiento, calendario, convenio HTML, prevención por puestos, encuestas, avisos globales, enlaces de contacto, RSS, JSON Feed, sitemap y un editor orientado a personas no técnicas.

Los artículos propios se guardan en `content/articles/*.md`. La página `/publicar/`, enlazada desde el pie del sitio, genera borradores Markdown con vista previa, imagen destacada, imágenes interiores y descarga.

## Inicio rápido

1. Instala Node.js 20 o superior.
2. Edita `config/site.json` y los JSON de `content/`.
3. Ejecuta `npm run build && npm run check`.
4. Publica `dist/` o activa GitHub Pages con GitHub Actions.

No hay dependencias de producción ni base de datos. Consulta [SETUP.md](SETUP.md), [ROADMAP.md](ROADMAP.md), [docs/MODELO-DE-DATOS.md](docs/MODELO-DE-DATOS.md) y [SECURITY.md](SECURITY.md).

## Estado

Versión 0.5.1, con consulta del convenio vigente 2025-2028 contrastada con el registro del Ministerio, buscador por artículos, actuaciones posteriores y una explicación en lenguaje claro pendiente de validación. La autenticación y cualquier tratamiento de afiliación sindical quedan fuera de esta fase.
