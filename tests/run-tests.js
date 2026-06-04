const assert = require("node:assert");
const { MAP_PRESETS, findRescuePath, TERRAIN } = require("../app.js");

assert.equal(TERRAIN.D.cost, 2, "Dusman gemisi (D) maliyeti 2 olmali");

const enemyMap = ["SDH"];
const enemyResult = findRescuePath(enemyMap);
assert.equal(enemyResult.success, true, "Dusman gemisi gecilebilir olmali");
assert.equal(enemyResult.cost, 3, "S->D->H maliyeti 3 olmali (D=2 + H=1)");

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
