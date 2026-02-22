const fs = require('fs');
const path = require('path');

const JSON_PATH = '/Users/dmarambio/cartas/cartas.json';
const IMG_DIR = '/Users/dmarambio/cartas/img/store/cartas/';
const START_ID = 2000;

const cartas = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
// Ordenar archivos para que la asignacion de IDs sea determinista
const files = fs.readdirSync(IMG_DIR).filter(f => f.endsWith('.webp')).sort();

let currentId = START_ID;
const results = [];

// Mapa de correccion manual para casos donde el nombre del archivo no se parece al de la carta
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
    'wyrmabismal': 'Wyrm Abismal'
};

function normalize(str) {
    if (!str) return "";
    return str.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Quitar acentos
        .replace(/[^a-z0-9]/g, "");     // Quitar espacios y caracteres raros
}

function findOriginalCard(filename) {
    const basename = filename.replace('.webp', '').toLowerCase();

    // 1. Intentar por mapa manual
    let targetName = manualMap[basename];

    // 2. Si no esta en el mapa, limpiar el nombre del archivo
    if (!targetName) {
        // Quitamos "shogun" y cualquier numero que le siga (ej: shogun, shogun4, shogun2)
        targetName = basename.replace(/shogun\d*/g, '');
    }

    const normalizedTarget = normalize(targetName);

    // Buscar en la base de datos de cartas
    return cartas.find(c => {
        const normalizedCard = normalize(c.nombre);
        // Coincidencia exacta o sin espacios
        return normalizedCard === normalizedTarget;
    });
}

console.log(`Searching for cards for ${files.length} files...`);

files.forEach(file => {
    const original = findOriginalCard(file);
    if (original) {
        // Clonamos la carta original
        const newCard = JSON.parse(JSON.stringify(original));

        // Asignamos nuevo ID
        newCard.id = currentId++;

        // Mantenemos su nombre original
        newCard.nombre = original.nombre;

        // Actualizamos imagen y metadatos de promo
        newCard.imagen_url = "/img/store/cartas/" + file;
        newCard.rareza = "Promo";
        newCard.descripcion = "Edición Especial Shogun";

        results.push(newCard);
    } else {
        console.error("Base card not found for file: " + file);
    }
});

fs.writeFileSync('cartasShogun.json', JSON.stringify(results, null, 2));
console.log(`Generated cartasShogun.json with ${results.length} cards.`);
