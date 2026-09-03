# Contribuir al repertorio de Legislación Interpretada

## Qué se puede aportar

- nuevas normas o convenios;
- nuevas versiones o correcciones oficiales;
- mejora de metadatos;
- división más precisa en artículos, apartados, letras o subapartados;
- relaciones entre normas;
- lenguaje claro;
- notas editoriales justificadas.

## Qué no debe incorporarse automáticamente al repertorio común

- notas específicas de una empresa o centro de trabajo;
- campañas o posicionamientos locales;
- datos personales;
- interpretaciones sin identificar como tales;
- texto legal sin fuente verificable.

## Flujo recomendado

1. La instancia local crea o modifica un corpus.
2. Se valida que el JSON cumple el esquema común.
3. Se contrasta el texto legal con la fuente indicada.
4. Se propone la incorporación al repertorio central mediante Pull Request.
5. La revisión distingue entre texto legal, lenguaje claro y nota editorial.
6. Tras la aceptación, el corpus pasa a estar disponible para las demás instancias.

## Estados

### draft
Aportación inicial. Puede estar incompleta.

### verified
El texto legal y los metadatos principales se han contrastado con la fuente indicada.

### reviewed
También se han revisado estructura, relaciones y posibles anomalías de edición.

### interpreted
Incluye lenguaje claro revisado además del texto verificado.

## Identificadores

Los identificadores deben ser estables y describir la unidad jurídica, no su posición visual.

Ejemplos:

- `articulo-28`
- `articulo-28-1`
- `articulo-28-1-2`
- `articulo-15-3-a`

No usar como identificador permanente una simple numeración de párrafos (`p1`, `p2`) cuando exista una estructura jurídica explícita.

## Texto legal

El campo `legal` reproduce el texto de la fuente utilizada. Las correcciones tipográficas, aclaraciones o dudas deben ir en `editorialNote`, nunca introducidas silenciosamente en `legal`.

## Lenguaje claro

El campo `plain` explica la unidad jurídica correspondiente. Debe evitar ampliar o restringir el derecho descrito por la norma. Cuando una afirmación dependa de otra norma, interpretación administrativa o jurisprudencia, debe indicarse mediante relaciones o notas.

## Relaciones

Se recomienda utilizar identificadores internos cuando la norma relacionada esté disponible en el repertorio:

```json
"related": ["estatuto-trabajadores:37.3"]
```

Si todavía no existe como corpus interno, puede utilizarse un enlace oficial:

```json
"related": [
  {
    "label": "Estatuto de los Trabajadores · artículo 37",
    "href": "https://www.boe.es/buscar/act.php?id=BOE-A-2015-11430"
  }
]
```

## Capas locales

Las webs consumidoras pueden añadir contenido propio sin modificar el corpus común. Por ejemplo:

```text
Norma estatal
  ↓
Convenio sectorial
  ↓
Acuerdo de empresa
  ↓
Nota local del comité
```

Solo las capas que tengan valor general deberían proponerse al repertorio central.
