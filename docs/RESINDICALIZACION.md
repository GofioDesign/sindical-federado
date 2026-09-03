# Contrato de resindicalización

La taxonomía pública está disponible en `/taxonomy.json`. Cada publicación propia debe tener exactamente una categoría base del catálogo y puede tener cero o más etiquetas libres.

## Markdown

```yaml
category: prl
tags: [cocina, formacion]
```

El generador rechaza categorías vacías, mal formadas o que no pertenezcan al catálogo. El composer presenta las categorías como una lista cerrada y obligatoria. Las etiquetas libres se normalizan a minúsculas y guiones.

## RSS

La categoría base y las etiquetas libres usan elementos `<category>`, diferenciados mediante `domain`:

```xml
<category domain="https://gofiodesign.eu/sindical-federado/taxonomy.json#category">prl</category>
<category domain="https://gofiodesign.eu/sindical-federado/taxonomy.json#tag">cocina</category>
```

Una web consumidora debe filtrar la categoría base por el dominio terminado en `#category`. No debe deducirla a partir del título ni de una etiqueta libre.

## JSON Feed

El campo estándar `tags` contiene la categoría base y las etiquetas para lectores genéricos. La extensión `_sindical` conserva la separación estricta:

```json
{
  "tags": ["prl", "cocina", "formacion"],
  "_sindical": {
    "category": "prl",
    "tags": ["cocina", "formacion"]
  }
}
```

La raíz del JSON Feed declara la URL y versión de la taxonomía en `_sindical.taxonomy` y `_sindical.taxonomy_version`.

## Compatibilidad

- Los códigos de categoría son identificadores estables y no deben traducirse.
- Las interfaces pueden mostrar la etiqueta humana definida en `taxonomy.json`.
- Añadir categorías requiere aumentar la versión de la taxonomía si el cambio afecta a consumidores.
- Las noticias externas agregadas no se incluyen en los feeds propios.
