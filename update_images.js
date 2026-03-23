const fs = require('fs');
const path = require('path');

const idsToUpdate = [
  1699,1783,1281,1956,1876,1617,1989,2002,2283,1969,
  1650,1789,1962,1629,1830,1199,1268,1165,1175,1893,
  1679,1553,1575,2168,1131,1667,1615,722,727,723,
  1734,724,725,726
];

const jsonPath = '/Users/dmarambio/cartas/Archive/cartas.json';
const oldStoreDir = '/Users/dmarambio/cartas/img/store';
const newStoreDir = '/Users/dmarambio/cartas/img/store/cartas';

if (!fs.existsSync(newStoreDir)) {
  fs.mkdirSync(newStoreDir, { recursive: true });
}

const rawData = fs.readFileSync(jsonPath, 'utf8');
const cartas = JSON.parse(rawData);

let updatedCount = 0;

idsToUpdate.forEach(id => {
  const carta = cartas.find(c => c.id === id);
  if (!carta) return;

  const currentImgUrl = carta.imagen_url;
  let extension = '.webp'; 
  
  if (currentImgUrl) {
     extension = path.extname(currentImgUrl) || '.webp';
  }

  const fileName = `${id}${extension}`;
  const oldPath = path.join(oldStoreDir, fileName);
  const newPath = path.join(newStoreDir, fileName);

  if (fs.existsSync(oldPath)) {
    try {
      // Move to correct dir
      fs.copyFileSync(oldPath, newPath);
      fs.unlinkSync(oldPath); 
      console.log(`Reubicado: ${fileName} a /img/store/cartas/`);
    } catch (e) {
      console.error('Error moviendo archivo:', e);
    }
  } else if (!fs.existsSync(newPath)) {
    console.log(`Advertencia: No se encontró la imagen ${fileName} para el id ${id}.`);
  }

  carta.imagen_url = `/img/store/cartas/${fileName}`;
  updatedCount++;
});

if (updatedCount > 0) {
  fs.writeFileSync(jsonPath, JSON.stringify(cartas, null, 2), 'utf8');
  console.log(`¡Actualizado! ${updatedCount} cartas apuntan ahora a /img/store/cartas`);
}
