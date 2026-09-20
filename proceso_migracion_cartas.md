# Proceso de Migración, Estandarización y Asignación de Precios de Cartas

Este documento describe el flujo de trabajo estandarizado que utilizamos para migrar nuevas tandas de cartas desde las carpetas temporales del frontend hacia la base de datos principal (`Archive/cartas.json`) y la carpeta definitiva del backend (`cartas`).

## 1. Origen y Normalización de Imágenes

Las nuevas cartas suelen ingresarse primero en el repositorio del frontend, en carpetas temporales o de trabajo como:
- `/img/nuevascartas`
- `/img/nuevasCartas`
- `/img/Primera_era`

### Lógica de Normalización de Nombres
Para evitar problemas de compatibilidad (especialmente en servidores Linux, que son sensibles a mayúsculas y minúsculas), todos los nombres de los archivos de imagen se normalizan siguiendo estas reglas antes de guardarlos definitivamente:
1. **Minúsculas**: Todo el nombre pasa a letras minúsculas (ej: `CartaNueva` -> `cartanueva`).
2. **Sin Tildes ni Acentos**: Se remueven acentos (NFD normalization).
3. **Sin Caracteres Especiales**: Se eliminan espacios, guiones y cualquier otro símbolo. Sólo se conservan letras `a-z` y números `0-9`.
4. **Extensión Mantenida**: La extensión del archivo (usualmente `.webp`, `.png` o `.jpg`) se conserva en minúsculas.

## 2. Destino de las Imágenes

Dependiendo del propósito de las cartas, las imágenes normalizadas se copian físicamente a una de estas dos carpetas en el repositorio `cartas`:
- **Cartas de Tienda (Store)**: Van a `img/store/cartas/`. Estas son las cartas que los jugadores pueden comprar en el juego.
- **Cartas de Set Base/Primera Era**: Si se determina que son puramente de set, pueden ir a `img/primera_era/`. Sin embargo, la tendencia reciente es que incluso las cartas de Primera Era que se van liberando progresivamente se incluyan en la tienda (`img/store/cartas/`).

## 3. Asignación de Precios (Tier System)

En la base de datos maestra (`Archive/cartas.json`), **no guardamos un campo "precio" directamente**. En su lugar, utilizamos el sistema de **Tiers** (Rarezas/Niveles). 

El backend del juego lee el `tier` asignado a cada carta en el JSON y, en base a su propia lógica interna, calcula y asigna automáticamente el valor en Oros para la tienda de AegisTCG.

### Niveles de Tier Utilizados
Durante la migración masiva, se asigna uno de los siguientes valores al campo `"tier"` en el objeto JSON de la carta:

- `"muy bajo"`: Tier por defecto. Se asigna automáticamente si no se especifica ninguna rareza para la carta durante la migración. Resulta en el precio más accesible.
- `"bajo"`: Cartas comunes.
- `"medio"`: Cartas poco comunes.
- `"alto"`: Cartas exclusivas o muy raras.

## 4. Actualización del JSON (`Archive/cartas.json`)

Una vez validada la imagen y el tier, el script actualiza la base de datos maestra:
1. Localiza el objeto de la carta usando su `id`.
2. Actualiza la ruta `"imagen_url"` apuntando al nuevo destino normalizado (ej: `/img/store/cartas/nombrenormalizado.webp`).
3. Crea o actualiza la propiedad `"tier"` con el nivel correspondiente (`"muy bajo"`, `"bajo"`, `"medio"`, `"alto"`).

## 5. El Script de Automatización

Para procesar tandas grandes de cartas sin errores manuales, construimos un script en Node.js que realiza los siguientes pasos automáticamente:
1. Lee `Archive/cartas.json`.
2. Itera sobre un arreglo de las cartas a migrar `[{ id: 123, tier: "bajo" }, ...]`.
3. Busca la imagen en las diversas carpetas origen del frontend.
4. Aplica la normalización al nombre.
5. Copia la imagen al destino correspondiente (`/img/store/cartas/`).
6. Actualiza el JSON.
7. Guarda los cambios.

### Ejemplo Simplificado de la Lógica del Script

```javascript
// Normalizador de nombre
function normalizeName(name) {
  const ext = path.extname(name);
  const base = path.basename(name, ext);
  return base
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "") + ext.toLowerCase();
}

// Asignación de Tier
card.tier = tierSolicitado || "muy bajo"; 

// Asignación de nueva URL
card.imagen_url = `/img/store/cartas/${normFileName}`;
```

## 6. Sincronización Final

Una vez que el script finaliza y se verifica que los archivos de imagen fueron copiados exitosamente a sus nuevas rutas y el JSON actualizado:
1. Se realiza un `git add .`
2. Se comitea con la nueva versión (ej: `git commit -m "add v 3.0.X"`)
3. Se realiza `git push` para sincronizar los cambios con la base de datos de producción de cartas.
