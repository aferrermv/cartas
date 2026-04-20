const fs = require('fs');

const mainDbPath = 'd:/cartas/Archive/cartas.json';
const newCardsPath = 'd:/cartas/cartasCarloko7.json';

console.log("Iniciando fusión final con Archive/cartas.json...");

let mainDb = [];
let newCards = [];

try {
    mainDb = JSON.parse(fs.readFileSync(mainDbPath, 'utf8'));
} catch (e) {
    console.error("❌ Error leyendo Archive/cartas.json:", e);
    process.exit(1);
}

try {
    newCards = JSON.parse(fs.readFileSync(newCardsPath, 'utf8'));
} catch (e) {
    console.error("❌ Error leyendo cartasCarlokoTotal.json:", e);
    process.exit(1);
}

const idSet = new Set(mainDb.map(c => c.id));
const urlSet = new Set(mainDb.map(c => c.imagen_url));

let hasConflict = false;
let cardsAdded = 0;

newCards.forEach(card => {
    let cardConflict = false;
    
    // Check ID conflict
    if (idSet.has(card.id)) {
        console.error(`❌ [CONFLICTO DE ID] La ID ${card.id} (Carta: ${card.nombre}) ya existe en 'Archive/cartas.json'.`);
        cardConflict = true;
    }

    // Check URL conflict
    if (urlSet.has(card.imagen_url)) {
        console.error(`❌ [CONFLICTO DE URL] La imagen ${card.imagen_url} (Carta: ${card.nombre}) ya existe en 'Archive/cartas.json'.`);
        cardConflict = true;
    }
    
    if (cardConflict) {
        hasConflict = true;
    } else {
        idSet.add(card.id);
        urlSet.add(card.imagen_url);
        mainDb.push(card);
        cardsAdded++;
    }
});

if (hasConflict) {
    console.error("\n❌ Se encontraron conflictos graves. NO se ha sobrescrito 'Archive/cartas.json'. Por favor resuelve los errores de ID o URL.");
} else {
    // Escrito en el archivo
    fs.writeFileSync(mainDbPath, JSON.stringify(mainDb, null, 2));
    console.log(`\n✅ Fusión exitosa y sin ningún tipo de conflicto.`);
    console.log(`Cartas originales en DB: ${mainDb.length - cardsAdded}`);
    console.log(`Nuevas cartas añadidas: ${cardsAdded}`);
    console.log(`Total de cartas actual: ${mainDb.length}`);
    console.log(`📄 Archivo guardado y actualizado: ${mainDbPath}`);
}
