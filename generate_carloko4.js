const fs = require('fs');
const path = require('path');

const JSON_PATH = 'd:/cartas/cartas.json';
const IMG_DIR = 'd:/cartas/cartasporagregar/';
const START_ID = 7245;

const allData = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
const cartas = allData.filter(c => c.id < 7000);
const files = fs.readdirSync(IMG_DIR).filter(f => f.endsWith('.webp') || f.endsWith('.jpeg') || f.endsWith('.jpg')).sort();

const manualMap = {
    'cantobelecarloko1': 'Canto de Bele',
    'minasdegruashcarloko1': 'Fergus Mor MacEric',
    'ferguscarloko1': 'Fergus Mor MacEric',
    'minerosdellapislazulicarloko1': 'Mineros de Lapislazuli'
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

    if (manualMap[basename]) {
        const target = manualMap[basename];
        const match = cartas.find(c => normalize(c.nombre) === normalize(target));
        if (match) return match;
    }

    const normBase = normalize(basename);
    const cleanBase = normBase.replace(/carloko\d*$/, '').replace(/_11zon$/, '').replace(/^apb2-\d+_\d+$/, '');
    
    if (cleanBase) {
        let found = cartas.find(c => normalize(c.nombre) === cleanBase);
        if (found) return found;
    }
    
    let found = cartas.find(c => normalize(c.nombre) === normBase);
    if (found) return found;

    const sortedCartas = [...cartas].sort((a, b) => b.nombre.length - a.nombre.length);
    found = sortedCartas.find(c => {
        const normName = normalize(c.nombre);
        if (cleanBase && normName.length >= 4 && cleanBase.includes(normName)) {
            return true;
        }
        return false;
    });

    return found;
}

console.log(`\n🃏 Generando lote Carloko Nuevo - Alto — ${files.length} archivos desde ID ${START_ID}...\n`);

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
        newCard.tier = "alto";
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

fs.writeFileSync('d:/cartas/cartasCarloko4.json', JSON.stringify(results, null, 2));
console.log(`\n📄 Archivo generado: cartasCarloko4.json (${results.length} cartas)`);
