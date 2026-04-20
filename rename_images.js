const fs = require('fs');
const path = require('path');

const JSON_PATH = 'd:/cartas/Archive/cartas.json';
const IMG_DIR = 'd:/cartas/cartasporagregar/';

console.log("Renombrando las 25 imágenes más recientes en la carpeta y actualizando el JSON...");

let mainDb = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
let renamedCount = 0;

function normalize(str) {
    if (!str) return "";
    return str.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, ""); // This removes spaces, symbols
}

mainDb.forEach(card => {
    // Las últimas 25 cartas agregadas (ID de 7271 a 7295)
    if (card.id >= 7271 && card.id <= 7295) {
        const oldUrl = card.imagen_url;
        const oldName = path.basename(oldUrl);
        
        const ext = path.extname(oldName);
        const rawName = oldName.replace(ext, '');
        
        // Remove spaces, dashes, convert to lowercase, no symbols
        const cleanName = normalize(rawName);
        const newName = cleanName + ext;
        const newUrl = "/img/store/cartas/" + newName;

        const oldPath = path.join(IMG_DIR, oldName);
        const newPath = path.join(IMG_DIR, newName);

        // Renombrar físicamente el archivo
        if (fs.existsSync(oldPath)) {
            // Renombrar si es diferente
            if (oldPath !== newPath) {
                fs.renameSync(oldPath, newPath);
                console.log(`✅ [OK] Renombrado: ${oldName.padEnd(40)} -> ${newName}`);
                renamedCount++;
            }
        } else {
            // Caso donde quizás ya lo renombré en un test
            if (fs.existsSync(newPath)) {
                console.log(`⚠️ [SKIP] Ya estaba renombrado: ${newName}`);
            } else {
                console.error(`❌ [ERROR] Archivo no encontrado: ${oldPath}`);
            }
        }

        // Actualizar URL
        card.imagen_url = newUrl;
    }
});

// Escribiendo la base de datos de vuelta
fs.writeFileSync(JSON_PATH, JSON.stringify(mainDb, null, 2));

console.log(`\n📄 Archivo 'Archive/cartas.json' ha sido actualizado con las nuevas URLs.`);
console.log(`🖼️ Total de imágenes renombradas exitosamente: ${renamedCount}/25`);
