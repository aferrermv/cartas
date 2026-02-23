const fs = require('fs');
const path = require('path');

const DORSOS_DIR = '/Users/dmarambio/cartas/img/store/dorsos/';

function renameDorsos() {
    const files = fs.readdirSync(DORSOS_DIR)
        .filter(file => file.endsWith('.webp'))
        .sort(); // Sorting to have a consistent order

    console.log(`Encontrados ${files.length} dorsos para renombrar...`);

    files.forEach((file, index) => {
        const extension = path.extname(file);
        const newName = `dorso${String(index + 1).padStart(3, '0')}${extension}`;
        const oldPath = path.join(DORSOS_DIR, file);
        const newPath = path.join(DORSOS_DIR, newName);

        fs.renameSync(oldPath, newPath);
        console.log(`Renombrado: ${file} -> ${newName}`);
    });

    console.log('¡Misión cumplida! Todos los dorsos han sido renombrados.');
}

renameDorsos();
