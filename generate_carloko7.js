const fs = require('fs');
const path = require('path');

const JSON_PATH = 'd:/cartas/Archive/cartas.json';
const IMG_DIR = 'd:/cartas/cartasporagregar/';
const START_ID = 7317;

const allData = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
const cartas = allData.filter(c => c.id < 7000); // base cards
const files = fs.readdirSync(IMG_DIR).filter(f => f.endsWith('.webp') || f.endsWith('.jpeg') || f.endsWith('.jpg')).sort();

const manualMap = {
    'fergus': 'Fergus Mor MacEric'
};

function normalize(str) {
    if (!str) return "";
    return str.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, ""); // Lowercase and alphanumeric only
}

function findOriginalCard(filename) {
    const ext = path.extname(filename);
    const rawBase = filename.replace(ext, '');
    const cleanBaseLower = normalize(rawBase);

    // Clean standard suffixes to match the base name easily
    let cleanName = rawBase;
    cleanName = cleanName.replace(/_[\d_]*11zon$/i, '');
    cleanName = cleanName.replace(/_\d+$/i, '');
    cleanName = cleanName.replace(/-real$/i, '');
    cleanName = cleanName.replace(/-legendaria$/i, '');
    cleanName = cleanName.replace(/-promocional$/i, '');
    cleanName = cleanName.replace(/carloko\d*$/i, '');

    if (manualMap[cleanBaseLower]) {
        return cartas.find(c => normalize(c.nombre) === normalize(manualMap[cleanBaseLower]));
    }
    if (manualMap[cleanName.toLowerCase()]) {
        return cartas.find(c => normalize(c.nombre) === normalize(manualMap[cleanName.toLowerCase()]));
    }

    const normClean = normalize(cleanName);
    
    if (normClean) {
        let found = cartas.find(c => normalize(c.nombre) === normClean);
        if (found) return found;
    }
    
    let found = cartas.find(c => normalize(c.nombre) === cleanBaseLower);
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

console.log(`\n🃏 Generando lote Carloko Nuevo 7 - ALTO — ${files.length} archivos desde ID ${START_ID}...\n`);

const results = [];
let currentId = START_ID;
const failedFiles = [];

files.forEach(file => {
    const original = findOriginalCard(file);
    if (original) {
        // Renaming Image Logic
        const ext = path.extname(file);
        const rawBase = file.replace(ext, '');
        const normalizedName = normalize(rawBase) + ext;
        
        const oldFile = path.join(IMG_DIR, file);
        const newFile = path.join(IMG_DIR, normalizedName);
        
        if (oldFile !== newFile && fs.existsSync(oldFile)) {
            fs.renameSync(oldFile, newFile);
        }

        const newCard = JSON.parse(JSON.stringify(original));
        newCard.id = currentId++;
        newCard.imagen_url = "/img/store/cartas/" + normalizedName;
        newCard.rareza = "Promo";
        newCard.descripcion = "Edición Especial Arte Alternativo";
        newCard.tier = "alto";
        newCard.nombre = original.nombre;

        results.push(newCard);
        console.log(`  ✅ [OK]   ${file.padEnd(38)} -> ${original.nombre} (ID: ${newCard.id}) -> RENOMBRADO A: ${normalizedName}`);
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

fs.writeFileSync('d:/cartas/cartasCarloko7.json', JSON.stringify(results, null, 2));
console.log(`\n📄 Archivo generado: cartasCarloko7.json (${results.length} cartas)`);
