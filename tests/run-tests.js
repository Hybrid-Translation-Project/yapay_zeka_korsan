const assert = require("node:assert");
const { MAP_PRESETS, findRescuePath } = require("../app.js");

for (const preset of MAP_PRESETS) {
  const result = findRescuePath(preset.rows);
  assert.equal(result.success, true, `${preset.id} icin rota bulunmali`);
  assert.equal(result.collected, result.packages, `${preset.id} icin tum paketler toplanmali`);
  assert.equal(result.path.at(-1).tile, "H", `${preset.id} hastanede bitmeli`);
  assert.ok(result.cost > 0, `${preset.id} maliyeti pozitif olmali`);
}

const blockedMap = [
  "S###########",
  "############",
  "############",
  "############",
  "############",
  "############",
  "############",
  "############",
  "############",
  "############",
  "############",
  "###########H"
];

const blockedResult = findRescuePath(blockedMap);
assert.equal(blockedResult.success, false, "Kapali haritada rota bulunmamali");

console.log("Tum testler basarili.");
