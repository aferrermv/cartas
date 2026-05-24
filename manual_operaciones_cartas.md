# Manual de Operaciones: Migración, Normalización e Integración de Cartas
## MylOnline — Sistema de Gestión de Activos y Base de Datos de Cartas

Este manual documenta el procedimiento operativo estándar para la importación, normalización de nombres de archivos, migración de imágenes físicas y asignación de Tiers de precios de cartas en el ecosistema de **MylOnline**. El cumplimiento estricto de estas directrices garantiza que el frontend, el backend y los empaquetados finales (como la APK de Android) carguen correctamente todos los recursos visuales sin errores de enlaces rotos o inconsistencias de base de datos.

---

## 1. Fundamentos y Objetivos del Proceso

El ecosistema de MylOnline utiliza un archivo maestro de cartas ubicado en `/Users/dmarambio/cartas/Archive/cartas.json` (así como su contraparte sincronizada en el servidor/frontend). Para evitar comportamientos anómalos, el proceso tiene los siguientes objetivos:

* **Evitar Mismatch por Case-Sensitivity**: Los sistemas operativos móviles (Android/APK) y los servidores Linux son estrictamente sensibles a mayúsculas y minúsculas (*case-sensitive*). Si el JSON referencia `/img/store/cartas/myl123.webp` pero el archivo en disco se llama `MYL-123.webp` o `Myl123.webp`, la imagen fallará en cargar.
* **Normalización de Caracteres**: Los espacios, guiones (`-`), guiones bajos (`_`) y otros caracteres no alfanuméricos generan URLs codificadas ilegibles y propensas a errores. Toda imagen integrada debe tener un nombre limpio.
* **Integridad del Catálogo**: Cada carta en el sistema debe poseer un Tier asignado para interactuar correctamente con la economía del juego (Creación con Cristales, Tienda de Oros, etc.).

---

## 2. Mapa de Directorios (Rutas de Origen y Destino)

Es fundamental identificar con precisión dónde residen las imágenes y a dónde deben migrarse según el tipo de carta:

### Directorio de Origen General
Las nuevas imágenes provistas desde el desarrollo frontend o repositorios de desarrollo suelen ubicarse temporalmente en:
* `src_dir`: `/Users/dmarambio/mylOnline/MylOnline/frontend/img/nuevascartas/`

### Directorios de Destino en el Repositorio Local (`/Users/dmarambio/cartas/`)

| Propósito / Destino | Carpeta Física Local | Ruta de Acceso URL (`imagen_url`) |
| :--- | :--- | :--- |
| **Tienda / Store General** | `/Users/dmarambio/cartas/img/store/cartas/` | `/img/store/cartas/nombre_normalizado.webp` |
| **Primera Era / Ira del Nahual** | `/Users/dmarambio/cartas/img/primera_era/` | `/img/primera_era/nombre_normalizado.webp` |
| **Nuevas Cartas / Especiales** | `/Users/dmarambio/cartas/img/nuevascartas/` | `/img/nuevascartas/nombre_normalizado.webp` |

---

## 3. Reglas Estrictas de Normalización de Archivos

Al procesar cualquier activo de imagen (usualmente archivos `.webp` o `.png`), se debe aplicar una transformación de nombre de dos pasos tanto al **archivo en disco** como al campo **`imagen_url`** dentro del archivo `cartas.json`.

### Reglas de Conversión
1. **Minúsculas Absolutas**: Todo carácter alfabético debe convertirse a minúsculas (`A-Z` $\rightarrow$ `a-z`).
2. **Remover Símbolos y Espacios**: Se debe purgar el nombre de cualquier carácter que no sea una letra (`a-z`) o un número (`0-9`). Se eliminan espacios, guiones (`-`), guiones bajos (`_`), paréntesis y cualquier otro símbolo.

### Ejemplos Prácticos de Conversión:

| Nombre de Archivo Original | Nombre de Archivo Normalizado | Ruta URL final en JSON |
| :--- | :--- | :--- |
| `MYL-1775.webp` | `myl1775.webp` | `/img/store/cartas/myl1775.webp` |
| `luna_de_sangre.webp` | `lunadesangre.webp` | `/img/nuevascartas/lunadesangre.webp` |
| `totem sidhe.webp` | `totemsidhe.webp` | `/img/store/cartas/totemsidhe.webp` |
| `Escudo Tryamour.webp` | `escudotryamour.webp` | `/img/store/cartas/escudotryamour.webp` |
| `Stoorn Worm.webp` | `stoornworm.webp` | `/img/store/cartas/stoornworm.webp` |

---

## 4. Estructura de Tiers y Precios en `cartas.json`

Cada carta que forma parte de la tienda o del sistema de intercambio debe tener asignada la propiedad `"tier"` a nivel de raíz del objeto de la carta en `cartas.json`.

### Valores de Tier Válidos
* `"tier": "muy bajo"`
* `"tier": "bajo"`
* `"tier": "medio"`
* `"tier": "alto"`

### Ejemplo de Bloque JSON Válido y Estandarizado:
```json
  {
    "id": 757,
    "nombre": "Stoorn Worm",
    "tipo": "Aliado",
    "coste_oro": 4,
    "imagen_url": "/img/store/cartas/stoornworm.webp",
    "habilidad_texto_descriptivo": "Puede atacar cuando entra en juego. Si lo hace, en tu Fase Final Destruyelo.",
    "descripcion": null,
    "expansion": "Espada Sagrada",
    "rareza": "Común",
    "fecha_creacion": null,
    "fuerza": 5,
    "raza": "Dragon",
    "leyenda": null,
    "danio": null,
    "durabilidad": null,
    "cantidad_generada": null,
    "salud": null,
    "habilidades": [
      {
        "inherent": [
          "canAttackOnEnterPlay"
        ],
        "description": "Puede atacar cuando entra en juego.",
        "id_habilidad": "stoorn_worm_haste"
      }
    ],
    "tier": "bajo"
  }
```

---

## 5. Procedimientos Paso a Paso

### Opción A: Flujo Manual (Para 1 o 2 cartas)
1. Ubica la imagen de la carta en la carpeta de origen.
2. Renombra manualmente el archivo de imagen aplicando las **Reglas de Normalización** (ejemplo: cambiar `MYL-1009.webp` a `dragondeaire1009.webp`).
3. Copia el archivo renombrado al directorio de destino correspondiente en `/Users/dmarambio/cartas/img/...`.
4. Abre `/Users/dmarambio/cartas/Archive/cartas.json`.
5. Busca el objeto de la carta mediante su campo `"id"`.
6. Actualiza el campo `"imagen_url"` con la nueva ruta relativa normalizada en minúsculas.
7. Añade o modifica la propiedad `"tier"` en la raíz del objeto de la carta con el valor acordado.
8. Guarda el archivo `cartas.json`.

---

### Opción B: Flujo Automatizado (Para migraciones por lotes)
Para procesar múltiples cartas de forma segura y veloz, se utiliza un script de automatización en Python. A continuación se presenta el script estándar que puedes ejecutar desde la terminal.

#### Script en Python (`/Users/dmarambio/cartas/Archive/migrar_lote.py`):
```python
import json
import os
import shutil
import re

# Configuración de Rutas
JSON_PATH = '/Users/dmarambio/cartas/Archive/cartas.json'
SRC_DIR = '/Users/dmarambio/mylOnline/MylOnline/frontend/img/nuevascartas'
DST_DIR = '/Users/dmarambio/cartas/img/store/cartas'

# ==================== CONFIGURACIÓN DEL LOTE ====================
# Define aquí los IDs de las cartas y sus respectivos tiers
LOTE_CARTAS = {
    758: "alto",
    759: "medio",
    760: "medio"
}
# ================================================================

def normalizar_nombre(filename):
    name, ext = os.path.splitext(filename)
    # Pasa a minúsculas y elimina caracteres no alfanuméricos
    nombre_limpio = re.sub(r'[^a-zA-Z0-9]', '', name).lower()
    return nombre_limpio + ext

def ejecutar_migracion():
    if not os.path.exists(DST_DIR):
        os.makedirs(DST_DIR)

    with open(JSON_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)

    contador = 0
    target_ids = set(LOTE_CARTAS.keys())

    for card in data:
        card_id = card.get('id')
        if card_id in target_ids:
            old_url = card.get('imagen_url', '')
            if old_url:
                filename_original = os.path.basename(old_url)
                filename_nuevo = normalizar_nombre(filename_original)
                
                # Intentar localizar el archivo de origen (búsqueda insensible a mayúsculas)
                ruta_origen = os.path.join(SRC_DIR, filename_original)
                if not os.path.exists(ruta_origen):
                    for f_name in os.listdir(SRC_DIR):
                        if f_name.lower() == filename_original.lower():
                            ruta_origen = os.path.join(SRC_DIR, f_name)
                            break

                ruta_destino = os.path.join(DST_DIR, filename_nuevo)
                
                # Copiar archivo si existe
                if os.path.exists(ruta_origen):
                    shutil.copy2(ruta_origen, ruta_destino)
                    print(f"[OK] Copiado: {ruta_origen} -> {ruta_destino}")
                else:
                    print(f"[ALERTA] Archivo no encontrado en origen para: {card.get('nombre')} (ID: {card_id})")

                # Actualizar JSON
                card['imagen_url'] = f"/img/store/cartas/{filename_nuevo}"
                card['tier'] = LOTE_CARTAS[card_id]
                print(f"[JSON] Actualizado ID {card_id} ({card.get('nombre')}): URL={card['imagen_url']}, Tier={card['tier']}")
                contador += 1

    # Guardar cambios
    with open(JSON_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"\n[PROCESO TERMINADO] Se han actualizado {contador} entradas en cartas.json.")

if __name__ == '__main__':
    ejecutar_migracion()
```

---

## 6. Reglas de Seguridad y Buenas Prácticas (Guardrails)

> [!WARNING]
> **REGLA DE ORO DE DESPLIEGUE**
> **JAMÁS** ejecutes `npm run build` o `node backend/server.js` en representación del usuario. Estas acciones de infraestructura y arranque de producción son competencia exclusiva del usuario en su terminal activa.

* **Copias de Seguridad**: Realiza siempre un commit en git antes de ejecutar migraciones masivas en `cartas.json`. Si hay algún error en el JSON, podrás hacer un rollback inmediato mediante `git checkout Archive/cartas.json`.
* **Verificación de IDs**: Valida siempre que los IDs listados por el usuario correspondan con los nombres esperados antes de re-escribir metadatos importantes.
* **Control de Duplicados en Disco**: El script de Python maneja la sobreescritura de forma limpia, pero ante cambios manuales drásticos, asegura limpiar archivos huérfanos para no saturar el peso final de la aplicación/APK.
