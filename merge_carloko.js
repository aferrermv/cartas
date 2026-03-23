const fs = require('fs');

const fileNames = [
    'd:/cartas/cartasCarloko2.json',
    'd:/cartas/cartasCarloko3.json',
    'd:/cartas/cartasCarloko4.json'
];

let allCards = [];
let hasConflict = false;
const idSet = new Set();
const urlSet = new Set();

console.log("Iniciando unificación de archivos...");

fileNames.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`Leyendo ${file}...`);
        const data = JSON.parse(fs.readFileSync(file, 'utf8'));
        
        data.forEach(card => {
            // Check ID conflicts
            if (idSet.has(card.id)) {
                console.error(`❌ [CONFLICTO DE ID] La ID ${card.id} (Carta: ${card.nombre}) ya existe. Archivo: ${file}`);
                hasConflict = true;
            } else {
                idSet.add(card.id);
            }

            // Check URL conflicts
            if (urlSet.has(card.imagen_url)) {
                console.error(`❌ [CONFLICTO DE URL] La imagen ${card.imagen_url} (Carta: ${card.nombre}) ya está asignada a otra carta. Archivo: ${file}`);
                hasConflict = true;
            } else {
                urlSet.add(card.imagen_url);
            }

            allCards.push(card);
        });
    } else {
        console.error(`⚠️ Archivo no encontrado: ${file}`);
    }
});

if (hasConflict) {
    console.error("\n❌ Se encontraron conflictos. Por favor revisa los errores arriba. El archivo NO fue generado.");
} else {
    // Sort array by ID just to be clean
    allCards.sort((a, b) => a.id - b.id);
    
    const outputPath = 'd:/cartas/cartasCarlokoTotal.json';
    fs.writeFileSync(outputPath, JSON.stringify(allCards, null, 2));
    
    console.log(`\n✅ Unificación completada exitosamente sin conflictos.`);
    console.log(`📄 Archivo generado: ${outputPath} (${allCards.length} cartas en total).`);
    console.log(`Rango de IDs unificado: ${allCards[0].id} - ${allCards[allCards.length - 1].id}`);
}
