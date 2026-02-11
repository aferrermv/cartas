const fs = require('fs');
const path = require('path');

const ROOT_DIR = __dirname;
const IMG_DIR = path.join(ROOT_DIR, 'img');
const JSON_FILE = path.join(ROOT_DIR, 'cartas.json');

// Función para normalizar nombres (snake_case)
const normalizeName = (name) => {
    return name.toLowerCase().replace(/\s+/g, '_');
};

async function main() {
    console.log('Iniciando normalización de repositorio...');

    // 1. Leer y Renombrar Carpetas
    if (fs.existsSync(IMG_DIR)) {
        const dirs = fs.readdirSync(IMG_DIR);

        dirs.forEach(dirName => {
            const dirPath = path.join(IMG_DIR, dirName);
            if (!fs.lstatSync(dirPath).isDirectory()) return;

            const newName = normalizeName(dirName);
            if (dirName !== newName) {
                const newPath = path.join(IMG_DIR, newName);
                console.log(`Renombrando carpeta: "${dirName}" -> "${newName}"`);

                // En sistemas case-insensitive (Mac/Win), renombrar 'A' a 'a' puede fallar si no se hace en 2 pasos
                if (dirName.toLowerCase() === newName) {
                    // Paso intermedio
                    const tempPath = path.join(IMG_DIR, `${newName}_temp`);
                    fs.renameSync(dirPath, tempPath);
                    fs.renameSync(tempPath, newPath);
                } else {
                    fs.renameSync(dirPath, newPath);
                }
            }
        });
    } else {
        console.error('No se encontró la carpeta "img".');
        return;
    }

    // 2. Leer y Actualizar cartas.json
    if (fs.existsSync(JSON_FILE)) {
        console.log('Leyendo cartas.json...');
        const content = fs.readFileSync(JSON_FILE, 'utf8');
        let cards = JSON.parse(content);
        let updatedCount = 0;

        cards = cards.map(card => {
            if (!card.imagen_url) return card;

            // Analizar ruta actual
            // Ej: /img/ESPADA SAGRADA/44.png
            const parts = card.imagen_url.split('/');
            // parts[0] = "" (si empieza con /)
            // parts[1] = "img"
            // parts[2] = "ESPADA SAGRADA" (Carpeta)
            // parts[3] = "44.png" (Archivo)

            if (parts.length >= 4 && parts[1] === 'img') {
                const folderName = parts[2];
                const normalizedFolder = normalizeName(folderName);

                // Reconstruir ruta con carpeta normalizada
                // Mantenemos el nombre del archivo original, solo corregimos la carpeta
                // OJO: Si el archivo también tiene espacios/mayúsculas, GitHub podría fallar.
                // Idealmente normalizar todo, pero empecemos por carpetas que es lo crítico.

                // Normalizar ruta completa para evitar problemas en URL
                const fileName = parts[parts.length - 1]; // Mantener nombre archivo (por ahora)
                // Opcional: EncodeURI para espacios en nombre de archivo
                // const encodedFileName = encodeURIComponent(fileName).replace(/%20/g, '_'); // GitHub prefiere _ a %20? No, raw soporta %20.

                if (folderName !== normalizedFolder) {
                    // Reemplazamos la parte de la carpeta en la ruta
                    parts[2] = normalizedFolder;
                    const newUrl = parts.join('/');

                    if (card.imagen_url !== newUrl) {
                        card.imagen_url = newUrl;
                        updatedCount++;
                    }
                }
            }
            return card;
        });

        console.log(`Se actualizaron las rutas de ${updatedCount} cartas.`);

        // Guardar JSON
        fs.writeFileSync(JSON_FILE, JSON.stringify(cards, null, 2));
        console.log('cartas.json guardado correctamente.');

    } else {
        console.error('No se encontró cartas.json');
    }

    console.log('--- FIN ---');
    console.log('Siguientes pasos:');
    console.log('1. Ejecuta: node normalize_repo.js');
    console.log('2. Comprime cartas.json en Archive2.zip');
    console.log('3. Git add, commit y push.');
}

main();
