const assert = require("node:assert");
const { MAP_PRESETS, findRescuePath } = require("../app.js");

for (const preset of MAP_PRESETS) {
  const result = findRescuePath(preset.rows);
  assert.equal(result.success, true, `${preset.id} için rota bulunmalı`);
  assert.equal(result.collected, result.packages, `${preset.id} için tüm paketler toplanmalı`);
  assert.equal(result.path.at(-1).tile, "H", `${preset.id} kalede bitmeli`);
  assert.ok(result.cost > 0, `${preset.id} maliyeti pozitif olmalı`);
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
assert.equal(blockedResult.success, false, "Kapalı haritada rota bulunmamalı");

console.log("Tüm testler başarılı.");
