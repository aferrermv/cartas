const fs = require('fs');
const path = require('path');

const JSON_PATH = 'd:/cartas/Archive/cartas.json';
const IMG_DIR = 'd:/cartas/cartasporagregar/';

const allData = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
const baseCard = allData.find(c => c.nombre === "Antorcha Olimpica" && c.id < 7000);

if (!baseCard) {
    console.error("Base card Antorcha Olimpica not found in DB");
    process.exit(1);
}

const newCard = JSON.parse(JSON.stringify(baseCard));
newCard.id = 7316;
newCard.imagen_url = "/img/store/cartas/antorchaolympicacarloko1.webp";
newCard.rareza = "Promo";
newCard.descripcion = "Edición Especial Arte Alternativo";
newCard.tier = "medio";

// Rename file to lower case if needed
const oldFile = path.join(IMG_DIR, "antorchaolympicacarloko1.webp");
const newFile = path.join(IMG_DIR, "antorchaolympicacarloko1.webp");

if (fs.existsSync(oldFile) && oldFile !== newFile) {
    fs.renameSync(oldFile, newFile);
}

allData.push(newCard);
fs.writeFileSync(JSON_PATH, JSON.stringify(allData, null, 2));

console.log("✅ Añadida Antorcha Olimpica exitosamente con la ID 7316 con tier medio.");
console.log("Total de cartas en DB:", allData.length);
