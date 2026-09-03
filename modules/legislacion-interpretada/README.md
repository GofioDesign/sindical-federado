# Legislación Interpretada

Módulo reutilizable para publicar normativa con texto legal, explicación en lenguaje claro, relaciones entre normas y enlaces estables a artículos, apartados y letras.

## Objetivo

Separar el motor de consulta jurídica de cada web concreta. Una instancia puede consumir uno o varios corpus (laboral, turismo, alojamientos, espacios naturales, urbanismo, etc.) y añadir capas locales sin modificar el texto común.

## Principios

1. **Texto legal e interpretación nunca se mezclan.**
2. **Toda norma conserva fuente, versión y vigencia.**
3. **Las unidades jurídicas tienen identificadores estables.**
4. **Las relaciones pueden conectar artículos de la misma norma o de normas distintas.**
5. **Las aportaciones al repertorio común deben poder revisarse antes de distribuirse.**
6. **Las notas locales de una instancia no pasan automáticamente al repertorio común.**

## Estructura

```text
modules/legislacion-interpretada/
├─ README.md
├─ registry.json
├─ schema/
│  └─ corpus.schema.json
├─ corpora/
│  └─ laboral/
│     └─ convenio-hosteleria-santa-cruz-tenerife-2025-2028/
│        ├─ metadata.json
│        └─ articulado.json
└─ docs/
   └─ CONTRIBUTING.md
```

## Estados de revisión

- `draft`: aportado, pendiente de contraste.
- `verified`: texto contrastado con la fuente indicada.
- `reviewed`: estructura, metadatos y referencias revisadas.
- `interpreted`: incorpora lenguaje claro revisado.

## Unidad jurídica

Cada artículo puede dividirse en apartados, letras y subapartados. Cada unidad puede contener:

```json
{
  "id": "articulo-28-1-2",
  "legal": "Texto literal de la norma.",
  "plain": "Explicación en palabras sencillas.",
  "editorialNote": null,
  "topics": ["permisos", "cuidados"],
  "related": ["estatuto-trabajadores:37.3"]
}
```

## Integración

Una web consumidora debería declarar qué corpus necesita, por ejemplo:

```json
{
  "legislation": [
    "estatuto-trabajadores",
    "lols",
    "lprl",
    "convenio-hosteleria-santa-cruz-tenerife-2025-2028"
  ]
}
```

El motor de interfaz puede permanecer en cada web o convertirse más adelante en un paquete independiente. Este directorio define primero el **formato común de datos y contribución**.
