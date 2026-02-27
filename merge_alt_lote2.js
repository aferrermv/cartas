const fs = require('fs');

const JSON_PATH = '/Users/dmarambio/cartas/cartas.json';
const LOTE2_PATH = '/Users/dmarambio/cartas/cartasTiendaAltLote2.json';
const IMG_SRC = '/Users/dmarambio/cartas/cartasporagregar/';
const IMG_DEST = '/Users/dmarambio/cartas/img/store/cartas/';

const allData = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
const lote2 = JSON.parse(fs.readFileSync(LOTE2_PATH, 'utf8'));

// Verificar que no existan IDs duplicados
const existingIds = new Set(allData.map(c => c.id));
const duplicates = lote2.filter(c => existingIds.has(c.id));
if (duplicates.length > 0) {
    console.error(`❌ IDs duplicados encontrados: ${duplicates.map(c => c.id).join(', ')}`);
    process.exit(1);
}

// Fusionar
const merged = [...allData, ...lote2];

// Mover imágenes
if (!fs.existsSync(IMG_DEST)) {
    fs.mkdirSync(IMG_DEST, { recursive: true });
}

let movedCount = 0;
let skipCount = 0;

lote2.forEach(card => {
    const filename = card.imagen_url.split('/').pop();
    const srcPath = IMG_SRC + filename;
    const destPath = IMG_DEST + filename;

    if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, destPath);
        movedCount++;
        console.log(`  📁 Copiada: ${filename}`);
    } else {
        skipCount++;
        console.warn(`  ⚠️  No encontrada en origen: ${filename}`);
    }
});

// Guardar cartas.json
fs.writeFileSync(JSON_PATH, JSON.stringify(merged, null, 2));

console.log(`\n✅ Fusión completada.`);
console.log(`   Total cartas en cartas.json: ${merged.length}`);
console.log(`   Nuevas cartas añadidas: ${lote2.length}`);
console.log(`   Imágenes copiadas: ${movedCount}`);
if (skipCount > 0) console.log(`   Imágenes no encontradas: ${skipCount}`);
console.log(`\n🔜 Siguiente paso: Sube los cambios al repositorio.`);
