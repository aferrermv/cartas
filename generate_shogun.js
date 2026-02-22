const fs = require('fs');
const path = require('path');

const JSON_PATH = '/Users/dmarambio/cartas/cartas.json';
const IMG_DIR = '/Users/dmarambio/cartas/img/store/cartas/';
const START_ID = 2000;

const cartas = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
const files = fs.readdirSync(IMG_DIR).filter(f => f.endsWith('.webp'));

let currentId = START_ID;
const results = [];

const manualMap = {
    'milanorojo': 'Milano Rojo',
    'sirerec': 'Sir Erec',
    'ashrays': 'Ashrays',
    'becdecorbin': 'Bec de Corbin',
    'brianboru': 'Brian Boru',
    'cachtach': 'Cachtach',
    'carnwennan': 'Carnwennan',
    'corff': 'Corff',
    'coronadearturo': 'Corona de Arturo',
    'cuchulain': 'Cuchulain',
    'djedefhor': 'Djedefhor',
    'fesinlimite': 'Fe sin Límite',
    'fragarach': 'Fragarach',
    'fragarachshogun2': 'Fragarach',
    'fragarachshogun3': 'Fragarach',
    'guardiareal': 'Guardia Real',
    'hemera': 'Hemera',
    'llamaradaimpia': 'Llamarada Impia',
    'medusa': 'Medusa',
    'minasdegruagash': 'Minas de Gruagash',
    'morrigu': 'Morrigu',
    'oseye': 'Oseye',
    'perseo': 'Perseo',
    'pilarbotero': 'Pilar Botero',
    'taliesin': 'Taliesin',
    'tamis': 'Tamis',
    'teseodeatenas': 'Teseo de Atenas',
    'toroapis': 'Toro Apis',
    'traiciondebruto': 'Traicion de Bruto',
    'wyrmabismal': 'Wyrm Abismal'
};

function findOriginalCard(filename) {
    const clean = filename.replace('shogun4', '').replace('shogun', '').replace('.webp', '').toLowerCase();
    const targetName = manualMap[clean] || clean;

    return cartas.find(c => {
        const n1 = c.nombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const n2 = targetName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        return n1 === n2 || n1.replace(/ /g, '') === n2.replace(/ /g, '');
    });
}

files.forEach(file => {
    const original = findOriginalCard(file);
    if (original) {
        const newCard = JSON.parse(JSON.stringify(original));
        newCard.id = currentId++;

        // Mantener el nombre EXACTO de la carta original
        newCard.nombre = original.nombre;

        newCard.imagen_url = "/img/store/cartas/" + file;
        newCard.rareza = "Promo";
        newCard.descripcion = "Edición Especial Shogun";

        results.push(newCard);
    } else {
        console.error("Base card not found: " + file);
    }
});

fs.writeFileSync('cartasShogun.json', JSON.stringify(results, null, 2));
console.log(`Generated cartasShogun.json with ${results.length} cards.`);
