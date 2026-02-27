const fs = require('fs');
const path = require('path');

const ROOT_DIR = __dirname;
const IMG_DIR = path.join(ROOT_DIR, 'img');
const MANIFEST_FILE = path.join(ROOT_DIR, 'img_index.json');

function getAllFiles(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath).sort(); // Ordenar alfabéticamente para evitar inconsistencias

    arrayOfFiles = arrayOfFiles || [];

    files.forEach(function (file) {
        if (file.startsWith('.')) return; // Ignorar .DS_Store, .git, etc.
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
            arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
        } else {
            // Guardamos la ruta relativa desde la carpeta raíz (ej: img/Daana/Pwyl.webp)
            // path.relative puede devolver rutas con '\\' en Windows, reemplazamos por '/'
            const relativePath = path.relative(ROOT_DIR, fullPath).replace(/\\/g, '/');
            arrayOfFiles.push(relativePath);
        }
    });

    return arrayOfFiles;
}

try {
    console.log('Generando img_index.json...');
    const allFiles = getAllFiles(IMG_DIR);

    // Crear objeto JSON: clave = nombre en minúsculas para búsqueda fácil
    // valor = nombre real del archivo
    const manifest = {};

    allFiles.forEach(file => {
        // file es "img/Daana/Pwyl.webp"
        // key será "img/daana/pwyl.webp" (todo minúsculas)
        const key = file.toLowerCase();
        manifest[key] = file;
    });

    const output = JSON.stringify(manifest, null, 2);
    fs.writeFileSync(MANIFEST_FILE, output);
    console.log(`img_index.json generado con ${Object.keys(manifest).length} archivos.`);

    // Ejemplo de validación rápida
    console.log('Ejemplo de mapeo: key="img/daana/pwyl.webp" -> val=', manifest['img/daana/pwyl.webp']);

} catch (e) {
    console.error('Error generando manifest:', e);
}
