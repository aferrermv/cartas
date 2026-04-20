const fs = require('fs');
const path = require('path');

const JSON_PATH = 'd:/cartas/Archive/cartas.json';
const IMG_DIR = 'd:/cartas/cartasporagregar/';
const START_ID = 7271;

const allData = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
const cartas = allData.filter(c => c.id < 7000); // only base cards
const files = fs.readdirSync(IMG_DIR).filter(f => f.endsWith('.webp') || f.endsWith('.jpeg') || f.endsWith('.jpg')).sort();

const manualMap = {
    'cantobelecarloko1': 'Canto de Bele',
    'minasdegruashcarloko1': 'Fergus Mor MacEric',
    'ferguscarloko1': 'Fergus Mor MacEric',
    'minerosdellapislazulicarloko1': 'Mineros de Lapislazuli',
    'fergus': 'Fergus Mor MacEric'
};

function normalize(str) {
    if (!str) return "";
    return str.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, "");
}

function findOriginalCard(filename) {
    const ext = path.extname(filename);
    const basename = filename.replace(ext, '').toLowerCase();

    // 1. Clean the raw basename of typical suffixes
    let cleanName = basename;
    cleanName = cleanName.replace(/_[\d_]*11zon$/i, '');
    cleanName = cleanName.replace(/_\d+$/i, '');
    cleanName = cleanName.replace(/-real$/i, '');
    cleanName = cleanName.replace(/-legendaria$/i, '');
    cleanName = cleanName.replace(/-promocional$/i, '');
    cleanName = cleanName.replace(/carloko\d*$/i, '');
    
    // Check manual map against raw basename or cleaned basename
    if (manualMap[basename]) {
        return cartas.find(c => normalize(c.nombre) === normalize(manualMap[basename]));
    }
    if (manualMap[cleanName]) {
        return cartas.find(c => normalize(c.nombre) === normalize(manualMap[cleanName]));
    }

    const normClean = normalize(cleanName);
    
    if (normClean) {
        let found = cartas.find(c => normalize(c.nombre) === normClean);
        if (found) return found;
    }
    
    const normBase = normalize(basename);
    let found = cartas.find(c => normalize(c.nombre) === normBase);
    if (found) return found;

    const sortedCartas = [...cartas].sort((a, b) => b.nombre.length - a.nombre.length);
    found = sortedCartas.find(c => {
        const normName = normalize(c.nombre);
        if (normClean && normName.length >= 4 && normClean.includes(normName)) {
            return true;
        }
        return false;
    });

    return found;
}

console.log(`\n🃏 Generando lote Carloko Nuevo - Bajo — ${files.length} archivos desde ID ${START_ID}...\n`);

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
    console.log(`❌ Fallidas (${failedFiles.length}): \n${failedFiles.join('\n')}`);
}

fs.writeFileSync('d:/cartas/cartasCarloko5.json', JSON.stringify(results, null, 2));
console.log(`\n📄 Archivo generado: cartasCarloko5.json (${results.length} cartas)`);
