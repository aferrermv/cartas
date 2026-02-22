const fs = require('fs');
const path = require('path');

const JSON_PATH = '/Users/dmarambio/cartas/cartas.json';
const IMG_DIR = '/Users/dmarambio/cartas/cartasporagregar';

const cartas = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
const files = fs.readdirSync(IMG_DIR).filter(f => f.endsWith('.webp')).sort();

function normalize(str) {
    if (!str) return "";
    return str.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, "");
}

console.log(`Checking ${files.length} files...`);

files.forEach(file => {
    const basename = file.replace('.webp', '');
    const normBase = normalize(basename);

    // Try to find by name match
    let matches = cartas.filter(c => normalize(c.nombre) === normBase);

    if (matches.length === 0) {
        // Try to find if the basename contains a name
        matches = cartas.filter(c => {
            const normName = normalize(c.nombre);
            return normName.length > 3 && normBase.includes(normName);
        });
    }

    if (matches.length > 0) {
        console.log(`[MATCH] ${file} -> ${matches[0].nombre} (Expansion: ${matches[0].expansion})`);
    } else {
        // Try to find by number if it's just a number
        const numMatch = basename.match(/^(\d+)$/);
        if (numMatch) {
            const num = numMatch[1];
            const numMatches = cartas.filter(c => c.imagen_url.includes(num + '.') || c.imagen_url.endsWith(num));
            if (numMatches.length > 0) {
                console.log(`[NUMBER MATCH] ${file} -> ${numMatches[0].nombre} (${numMatches[0].expansion})`);
            } else {
                console.log(`[FAIL] ${file}`);
            }
        } else {
            console.log(`[FAIL] ${file}`);
        }
    }
});
