# Modelo de datos

La arquitectura separa tres capas:

1. **Motor**: generador y estilos compartidos.
2. **Configuración**: identidad, enlaces, fuentes y tema de cada instancia.
3. **Contenido**: noticias, convenio, puestos, encuestas y aviso global.

Las publicaciones usan estados editoriales fuera del sitio: `draft`, `review`, `published`, `archived`. Solo `published` se exporta a los JSON públicos.

Taxonomías recomendadas: tipo (`news`, `statement`, `document`, `survey`, `incident`), tema (`worktime`, `salary`, `leave`, `prl`, `conciliation`, `discipline`, `agreement`) y puesto (`kitchen`, `housekeeping`, `maintenance`, `gardens`, `reception`, `all`).

Los agregados de encuestas deben incluir periodo, tamaño de muestra y umbral de publicación. Nunca se versionan respuestas individuales.
