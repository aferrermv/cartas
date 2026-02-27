const fs = require('fs');
const path = require('path');

const JSON_PATH = '/Users/dmarambio/cartas/cartas.json';
const IMG_DIR = '/Users/dmarambio/cartas/cartasporagregar/';
const START_ID = 7082;

const allData = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
// Base de búsqueda: solo cartas originales (id < 7000)
const cartas = allData.filter(c => c.id < 7000);
const files = fs.readdirSync(IMG_DIR).filter(f => f.endsWith('.webp')).sort();

// Mapa manual para nombres que el algoritmo no detecta automáticamente
const manualMap = {
    'abusimbelalt': 'Abu Simbel',
    'anillosdebadburyalt': 'Anillos de Badbury',
    'ataudderamsesalt': 'Ataúd de Ramsés',
    'ceangalanfhanaighalt': 'Ceangal an-Fhanaigh',
    'clochafarmorealt': 'Clocha Farmore',
    'dragondemagmazombie': 'Dragón de Magma',
    'dumbartonalt': 'Dumbarton',
    'foceaalt': 'Focea',
    'formadelincealt': 'Forma de Lince',
    'guardiagozosaalt': 'Guardia Gozosa',
    'herreroalt': 'Herrero',
    'ibmutalt': 'Ib-Muit',
    'lallamadebrigitalt': 'La Llama de Brigit',
    'luzesmeraldaalt': 'Luz Esmeralda',
    'nacimientodepegasoalt': 'Nacimiento de Pegaso',
    'resplandordehekaalt': 'Resplandor de Heka',
    'sietecontratebasalt': 'Siete contra Tebas',
    'sirlamorakalt': 'Sir Lamorak',
    'tesorodemowaalt': 'Tesoro de Mowa',
    'tronodoradoalt': 'Trono Dorado',
    'vinculodelaullidoalt': 'Vínculo del Aullido',
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

    // 1. Manual map (priority)
    if (manualMap[basename]) {
        const target = manualMap[basename];
        const match = cartas.find(c => normalize(c.nombre) === normalize(target));
        if (match) return match;
        console.warn(`  [WARN] Manual map entry '${basename}' -> '${target}' NOT found in cartas.json`);
    }

    const normBase = normalize(basename);

    // 2. Normalized exact match (sin sufijo "alt"/"zombie"/etc)
    const cleanBase = normBase.replace(/alt$/, '').replace(/zombie$/, '');
    let found = cartas.find(c => normalize(c.nombre) === cleanBase);
    if (found) return found;

    // 3. Full normalized match
    found = cartas.find(c => normalize(c.nombre) === normBase);
    if (found) return found;

    // 4. Substring match (longest card name that matches)
    const sortedCartas = [...cartas].sort((a, b) => b.nombre.length - a.nombre.length);
    found = sortedCartas.find(c => {
        const normName = normalize(c.nombre);
        return normName.length >= 3 && normBase.includes(normName);
    });

    return found;
}

console.log(`\n🃏 Generando lote Alt 2 — ${files.length} archivos desde ID ${START_ID}...\n`);

const results = [];
let currentId = START_ID;
const failedFiles = [];

files.forEach(file => {
    const original = findOriginalCard(file);
    if (original) {
        const newCard = JSON.parse(JSON.stringify(original));
        newCard.id = currentId++;
        newCard.imagen_url = "/img/store/cartas/" + file;
        newCard.rareza = "Promo";
        newCard.descripcion = "Edición Especial Arte Alternativo";
        newCard.tier = "bajo";
        // Mantener el nombre original de la carta base
        newCard.nombre = original.nombre;

        results.push(newCard);
        console.log(`  ✅ [OK]   ${file.padEnd(38)} -> ${original.nombre} (ID: ${newCard.id})`);
    } else {
        failedFiles.push(file);
        console.error(`  ❌ [FAIL] No se encontró carta base para: ${file}`);
    }
});

console.log(`\n--- Resumen ---`);
console.log(`✅ Generadas: ${results.length} cartas`);
if (failedFiles.length > 0) {
    console.log(`❌ Fallidas (${failedFiles.length}): ${failedFiles.join(', ')}`);
    console.log(`\n⚠️  Agrega las entradas faltantes a 'manualMap' y vuelve a ejecutar.`);
    console.log(`   El JSON resultante NO incluirá estas cartas hasta que se corrijan.\n`);
}

// --- Guardar JSON parcial para revisión ---
fs.writeFileSync('cartasTiendaAltLote2.json', JSON.stringify(results, null, 2));
console.log(`\n📄 Archivo generado: cartasTiendaAltLote2.json (${results.length} cartas)`);
console.log(`   Revísalo y luego ejecuta 'merge_alt_lote2.js' para fusionarlo en cartas.json.`);
