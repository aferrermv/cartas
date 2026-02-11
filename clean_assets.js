const fs = require('fs');
const path = require('path');

const ROOT_DIR = __dirname;
const IMG_DIR = path.join(ROOT_DIR, 'img');
const JSON_FILE = path.join(ROOT_DIR, 'cartas.json');

// Función para generar nombre compacto + ID
// Ej: "Tadg el Druida" (ID 104) -> "tadgeldruida104"
const generateCompactName = (name, id) => {
    // Eliminar acentos
    const normalized = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    // Eliminar todo lo que no sea letra o número
    const cleanName = normalized.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
    return `${cleanName}${id}`;
};

async function main() {
    console.log('Iniciando RENOMBRADO COMPACTO DE ASSETS (Estilo: nombreid.ext)...');

    if (!fs.existsSync(JSON_FILE)) {
        console.error('No se encontró cartas.json');
        return;
    }

    const content = fs.readFileSync(JSON_FILE, 'utf8');
    let cards = JSON.parse(content);
    let updatedCount = 0;
    let errorCount = 0;

    // Mapa para evitar duplicados si algo raro pasa
    const usedNames = new Set();

    for (const card of cards) {
        if (!card.imagen_url || !card.id || !card.nombre) continue;

        // Ruta actual del JSON
        // Ej: /img/daana/Tadg-el-Druida.webp
        const currentUrl = card.imagen_url;

        // Determinar path físico actual
        // Quitamos la primera barra '/' si existe
        let relPath = currentUrl.startsWith('/') ? currentUrl.slice(1) : currentUrl;
        let fullPath = path.join(ROOT_DIR, relPath);

        // Verificar si existe el archivo
        if (!fs.existsSync(fullPath)) {
            // Intentar buscar variantes comunes (para no perder imágenes si el JSON ya estaba un poco roto)
            // Ej: buscar en minúsculas si el archivo real está en mayúsculas (o viceversa, aunque en Mac da igual)
            // O probar extensión diferente

            // Si no existe, no podemos renombrar nada. Pasamos.
            console.warn(`[SKIP] No existe archivo para "${card.nombre}": ${fullPath}`);
            errorCount++;
            continue;
        }

        // Generar nuevo nombre
        const ext = path.extname(fullPath); // .webp, .png, etc.
        const newFileName = generateCompactName(card.nombre, card.id) + ext; // tadgeldruida104.webp

        // Mantener la misma carpeta del archivo original
        const dirName = path.dirname(fullPath); // .../img/daana
        const newFullPath = path.join(dirName, newFileName);

        // Si el nombre ya es el correcto, saltar
        if (fullPath === newFullPath) continue;

        try {
            // Renombrar archivo físico
            fs.renameSync(fullPath, newFullPath);

            // Actualizar JSON
            // Reconstruir la URL relativa usando la carpeta original
            // Ojo: path.dirname devuelve ruta absoluta o relativa según input.
            // Queremos: /img/daana/tadgeldruida104.webp

            // Extraer partes relativas de nuevo
            const pathParts = relPath.split('/');
            // Reemplazar solo el último segmento (archivo)
            pathParts[pathParts.length - 1] = newFileName;
            const newUrl = '/' + pathParts.join('/'); // Asegurar / inicial si así se usa

            card.imagen_url = newUrl;
            updatedCount++;
            // console.log(`Renombrado: ${path.basename(fullPath)} -> ${newFileName}`);

        } catch (e) {
            console.error(`Error renombrando ${fullPath}:`, e);
            errorCount++;
        }
    }

    console.log(`\nResumen:`);
    console.log(`- Cartas actualizadas: ${updatedCount}`);
    console.log(`- Errores/Archivos no encontrados: ${errorCount}`);

    // Guardar JSON actualizado
    fs.writeFileSync(JSON_FILE, JSON.stringify(cards, null, 2));
    console.log('cartas.json guardado correctamente.');

    console.log('\n¡IMPORTANTE! Ahora ejecuta git add . y verás un montón de RENAMES.');
}

main();
