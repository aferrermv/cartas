const fs = require('fs');
const path = require('path');

const JSON_PATH = '/Users/dmarambio/cartas/cartas.json';
const IMG_DIR = '/Users/dmarambio/cartas/cartasporagregar/';
const START_ID = 2052;

const cartas = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
const files = fs.readdirSync(IMG_DIR).filter(f => f.endsWith('.webp')).sort();

let currentId = START_ID;
const results = [];

const manualMap = {
    'raalternativo': 'Ra',
    'ramsesaniversario': 'Ramses II',
    'toquedepercivalnacional': 'Toque de Persival' // Encontrada! Se escribe con S
};

function normalize(str) {
    if (!str) return "";
    return str.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, "");
}

function findOriginalCard(filename) {
    const basename = filename.replace('.webp', '').toLowerCase();

    // 1. Manual map
    if (manualMap[basename]) {
        const target = manualMap[basename];
        const match = cartas.find(c => normalize(c.nombre) === normalize(target));
        if (match) return match;
    }

    const normBase = normalize(basename);

    // 2. Exact or near-exact match
    let found = cartas.find(c => normalize(c.nombre) === normBase);
    if (found) return found;

    // 3. Substring match
    // Sort cards by length descending to find the most specific match first
    const sortedCartas = [...cartas].sort((a, b) => b.nombre.length - a.nombre.length);
    found = sortedCartas.find(c => {
        const normName = normalize(c.nombre);
        // Only consider reasonably unique names
        return normName.length >= 2 && normBase.includes(normName);
    });

    return found;
}

console.log(`Processing ${files.length} cards starting from ID ${START_ID}...`);

files.forEach(file => {
    const original = findOriginalCard(file);
    if (original) {
        const newCard = JSON.parse(JSON.stringify(original));
        newCard.id = currentId++;
        newCard.imagen_url = "/img/store/cartas/" + file;
        newCard.rareza = "Promo";

        // Determine description based on filename
        if (file.includes('shogun')) {
            newCard.descripcion = "Edición Especial Shogun";
        } else if (file.includes('aniversario') || file.includes('25anos')) {
            newCard.descripcion = "Edición Especial Aniversario";
        } else if (file.includes('fullart')) {
            newCard.descripcion = "Edición Especial Full Art";
        } else if (file.includes('alt')) {
            newCard.descripcion = "Edición Especial Arte Alternativo";
        } else {
            newCard.descripcion = "Edición Especial";
        }

        results.push(newCard);
        console.log(`[OK] ${file} -> ${original.nombre} (ID: ${newCard.id})`);
    } else {
        console.error(`[FAIL] No base card found for: ${file}`);
    }
});

fs.writeFileSync('cartasTiendaExtra.json', JSON.stringify(results, null, 2));
console.log(`\nGenerated cartasTiendaExtra.json with ${results.length} cards.`);
