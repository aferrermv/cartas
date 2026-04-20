const fs = require('fs');

const files = [
    'd:/cartas/cartasCarloko5.json',
    'd:/cartas/cartasCarloko6.json',
    'd:/cartas/cartasCarloko7.json'
];

console.log("| ID | Carta | Tier |");
console.log("|----|-------|------|");

files.forEach(file => {
    if(fs.existsSync(file)) {
        const data = JSON.parse(fs.readFileSync(file, 'utf8'));
        data.forEach(c => {
            console.log(`| ${c.id} | ${c.nombre} | ${c.tier} |`);
            if (c.id === 7315) {
                // Inyectar manualmente la Antorcha Olímpica que hicimos con script propio
                console.log(`| 7316 | Antorcha Olimpica | medio |`);
            }
        });
    }
});
