const fs = require('fs');

const filesToUpdate = [
    '/Users/dmarambio/cartas/cartas.json',
    '/Users/dmarambio/cartas/cartasShogun.json',
    '/Users/dmarambio/cartas/cartasTiendaExtra.json'
];

filesToUpdate.forEach(filePath => {
    if (!fs.existsSync(filePath)) {
        console.warn(`File not found: ${filePath}`);
        return;
    }

    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    let count = 0;

    data.forEach(card => {
        if (card.id >= 2000 && card.id <= 2081) {
            if (!card.tier) {
                card.tier = "bajo";
                count++;
            }
        } else if (card.tier) {
            // Remove tier if it shouldn't be there
            delete card.tier;
            count++;
        }
    });

    if (count > 0) {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        console.log(`Updated ${count} cards in ${filePath} with tier: "bajo"`);
    } else {
        console.log(`No cards updated in ${filePath}`);
    }
});
