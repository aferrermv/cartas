const fs = require('fs');
const path = require('path');

const JSON_PATH = '/Users/dmarambio/cartas/cartas.json';
const IMG_DIR = '/Users/dmarambio/cartas/img/store/cartas/';
const START_ID = 7000;

const allData = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
const cartas = allData.filter(c => c.id < 7000);
const files = fs.readdirSync(IMG_DIR).filter(f => f.endsWith('.webp')).sort();

const manualMap = {
    'milanorojoshogun4': 'Milano Rojo',
    'sirerecshogun4': 'Sir Erec',
    'cachtachshogun': 'Cathach',
    'becdecorbinshogun4': 'Bec de Corbin',
    'brianborushogun4': 'Brian Boru',
    'corffshogun4': 'Corff',
    'coronadearturoshogun4': 'Corona de Arturo',
    'djedefhorshogun4': 'Djedefhor',
    'fragarachshogun': 'Fragarach',
    'fragarachshogun2': 'Fragarach',
    'fragarachshogun3': 'Fragarach',
    'hemerashogun4': 'Hemera',
    'llamaradaimpiashogun4': 'Llamarada Impia',
    'minasdegruagash': 'Minas de Gruagash',
    'morrigushogun4': 'Morrigu',
    'pilarboteroshogun4': 'Pilar Botero',
    'taliesinshogun4': 'Taliesin',
    'teseodeatenasshogun4': 'Teseo de Atenas',
    'toroapisshogun4': 'Toro Apis',
    'traiciondebrutoshogun4': 'Traicion de Bruto',
    'wyrmabismal': 'Wyrm Abismal',
    'raalternativo': 'Ra',
    'ramsesaniversario': 'Ramses II',
    'toquedepercivalnacional': 'Toque de Persival'
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

    // 2. Exact or near-exact match (logic from shogun)
    let targetName = basename.replace(/shogun\d*/g, '');
    let found = cartas.find(c => normalize(c.nombre) === normalize(targetName));
    if (found) return found;

    // 3. Normalized exact match
    found = cartas.find(c => normalize(c.nombre) === normBase);
    if (found) return found;

    // 4. Substring match (robust version)
    const sortedCartas = [...cartas].sort((a, b) => b.nombre.length - a.nombre.length);
    found = sortedCartas.find(c => {
        const normName = normalize(c.nombre);
        return normName.length >= 3 && normBase.includes(normName);
    });

    return found;
}

console.log(`Processing ${files.length} store cards from 7000...`);

const results = [];
let currentId = START_ID;

files.forEach(file => {
    const original = findOriginalCard(file);
    if (original) {
        const newCard = JSON.parse(JSON.stringify(original));
        newCard.id = currentId++;
        newCard.imagen_url = "/img/store/cartas/" + file;
        newCard.rareza = "Promo";
        newCard.tier = "bajo";

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

        // Keep original name as requested
        newCard.nombre = original.nombre;

        results.push(newCard);
        console.log(`[OK] ${file} -> ${original.nombre} (ID: ${newCard.id})`);
    } else {
        console.error(`[FAIL] No base card for: ${file}`);
    }
});

fs.writeFileSync('cartasTiendaUnificada.json', JSON.stringify(results, null, 2));

// Ahora actualizamos cartas.json
const cleanCartas = cartas.filter(c => c.id < 7000 || c.id > 8000); // Rango de seguridad
// Tambien quitamos cualquier carta que use imagen de la tienda pero tenga ID viejo (2000-2081)
const filteredCartas = cleanCartas.filter(c => {
    if (c.id >= 2000 && c.id <= 2081) {
        if (c.imagen_url && c.imagen_url.includes('/img/store/cartas/')) return false;
    }
    // Tambien quitamos cualquier 'tier' que haya quedado
    delete c.tier;
    return true;
});

const finalCartas = [...filteredCartas, ...results];
fs.writeFileSync(JSON_PATH, JSON.stringify(finalCartas, null, 2));

console.log(`\nUpdated ${JSON_PATH}. Total cards: ${finalCartas.length}`);
console.log(`Generated unified store JSON with ${results.length} cards.`);
