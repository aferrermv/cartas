const fs = require('fs');

const idsToUpdate = [
  1699,1783,1281,1956,1876,1617,1989,2002,2283,1969,
  1650,1789,1962,1629,1830,1199,1268,1165,1175,1893,
  1679,1553,1575,2168,1131,1667,1615,722,727,723,
  1734,724,725,726
];

const jsonPath = '/Users/dmarambio/cartas/Archive/cartas.json';

const rawData = fs.readFileSync(jsonPath, 'utf8');
const cartas = JSON.parse(rawData);

let updatedCount = 0;

idsToUpdate.forEach(id => {
  const carta = cartas.find(c => c.id === id);
  if (!carta) return;

  carta.tier = "bajo";
  updatedCount++;
});

if (updatedCount > 0) {
  fs.writeFileSync(jsonPath, JSON.stringify(cartas, null, 2), 'utf8');
  console.log(`¡Actualizado! ${updatedCount} cartas ahora tienen "tier": "bajo"`);
}
