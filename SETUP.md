# Configuración y despliegue

## 1. Crear una instancia

Usa este repositorio como plantilla o copia la configuración a un repositorio nuevo. Cambia como mínimo `name`, `shortName`, `baseUrl`, enlaces, colores y fuentes RSS en `config/site.json`.

Los contenidos locales viven en `content/`. Cada noticia usa un `slug` único. El convenio se divide en capítulos y artículos con identificadores estables; esos identificadores forman las anclas compartibles.

## 2. Aviso global urgente

Edita `content/urgent.json`. Un aviso activo necesita `starts` y `ends`; el navegador lo oculta fuera de ese intervalo. Usa nivel `informative`, `important` o `urgent`. Mantén un solo aviso global activo.

## 3. Google Forms y Sheets

1. Crea formularios separados para consultas, encuestas y borradores editoriales.
2. Restringe las hojas de respuestas al equipo autorizado.
3. Publica solo una hoja/vista depurada, sin correos, nombres, texto libre sensible ni identificadores.
4. Copia las URLs públicas de los formularios en `config/site.json`.
5. Exporta noticias validadas al esquema de `content/news.json` y abre una propuesta de cambio. No conectes respuestas crudas directamente a producción.

Flujo recomendado: `respuesta → hoja privada → revisión → exportación depurada → build → publicación`.

## 4. Fuentes externas

`config/site.json` declara las fuentes de Sindicalistas de Base e Ius Laboralistas. La compilación recoge únicamente título, resumen, fecha, URL canónica y fuente, y conserva el enlace al original. Si una fuente no responde, la compilación continúa y mantiene disponible el contenido local. Los datos generados no se versionan.

## 5. GitHub Pages

En Settings → Pages selecciona **GitHub Actions** como origen. Cada envío a `main` compila, valida y publica `dist/`. Configura un dominio propio solo después de actualizar `baseUrl`.

## 6. Verificación local

Ejecuta `npm run build`, `npm run check` y después `npm run dev`. Revisa móvil, enlaces, fechas del aviso, URLs oficiales y formularios antes de anunciar la web.
