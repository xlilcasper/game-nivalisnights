const assert = require('assert');
const path = require('path');
const { GAME_ID, MOD_TYPE_ID, toInstructions } = require('../install-patterns');

function destinations(files) {
  const result = toInstructions(files, GAME_ID);
  assert.strictEqual(result.supported, true, `expected support for ${files.join(', ')}`);
  const copies = result.instructions.filter((instruction) => instruction.type === 'copy');
  const modType = result.instructions.find((instruction) => instruction.type === 'setmodtype');
  assert.strictEqual(modType.value, MOD_TYPE_ID);
  const mapped = {};
  copies.forEach((instruction) => {
    mapped[instruction.source] = instruction.destination;
  });
  return mapped;
}

function expectDest(files, expected) {
  const mapped = destinations(files);
  Object.keys(expected).forEach((source) => {
    assert.strictEqual(
      mapped[source],
      expected[source],
      `${source} -> ${mapped[source]}, expected ${expected[source]}`,
    );
  });
}

const plugin = path.join('BepInEx', 'plugins');
const bepinex = 'BepInEx';

expectDest(
  ['NivalisFifo.dll'],
  { 'NivalisFifo.dll': path.join(plugin, 'NivalisFifo.dll') },
);

expectDest(
  ['NivalisTrackedQuestsHUD/NivalisTrackedQuestsHUD.dll', 'NivalisTrackedQuestsHUD/README.txt'],
  {
    'NivalisTrackedQuestsHUD/NivalisTrackedQuestsHUD.dll': path.join(plugin, 'NivalisTrackedQuestsHUD', 'NivalisTrackedQuestsHUD.dll'),
    'NivalisTrackedQuestsHUD/README.txt': path.join(plugin, 'NivalisTrackedQuestsHUD', 'README.txt'),
  },
);

expectDest(
  ['BepInEx/plugins/NivalisTrackedQuestsHUD/NivalisTrackedQuestsHUD.dll', 'BepInEx/config/hvizeu.nivalis.trackedquestshud.cfg'],
  {
    'BepInEx/plugins/NivalisTrackedQuestsHUD/NivalisTrackedQuestsHUD.dll': path.join(bepinex, 'plugins', 'NivalisTrackedQuestsHUD', 'NivalisTrackedQuestsHUD.dll'),
    'BepInEx/config/hvizeu.nivalis.trackedquestshud.cfg': path.join(bepinex, 'config', 'hvizeu.nivalis.trackedquestshud.cfg'),
  },
);

expectDest(
  ['plugins/LongerIngredientShelfLife.dll'],
  { 'plugins/LongerIngredientShelfLife.dll': path.join(plugin, 'LongerIngredientShelfLife.dll') },
);

expectDest(
  ['Wrapped/BepInEx/plugins/NivalisUnstuck/NivalisUnstuck.dll'],
  {
    'Wrapped/BepInEx/plugins/NivalisUnstuck/NivalisUnstuck.dll': path.join(plugin, 'NivalisUnstuck', 'NivalisUnstuck.dll'),
  },
);

expectDest(
  ['BepInEx/patchers/Timestamp.dll'],
  { 'BepInEx/patchers/Timestamp.dll': path.join(bepinex, 'patchers', 'Timestamp.dll') },
);

expectDest(
  ['MyMod/config/settings.json', 'MyMod/MyMod.dll'],
  {
    'MyMod/config/settings.json': path.join(plugin, 'MyMod', 'config', 'settings.json'),
    'MyMod/MyMod.dll': path.join(plugin, 'MyMod', 'MyMod.dll'),
  },
);

expectDest(
  [
    'Pack/BepInEx/core/BepInEx.Unity.IL2CPP.dll',
    'Pack/BepInEx/core/BepInEx.Core.dll',
    'Pack/winhttp.dll',
    'Pack/doorstop_config.ini',
    'Pack/dotnet/coreclr.dll',
  ],
  {
    'Pack/BepInEx/core/BepInEx.Unity.IL2CPP.dll': path.join(bepinex, 'core', 'BepInEx.Unity.IL2CPP.dll'),
    'Pack/BepInEx/core/BepInEx.Core.dll': path.join(bepinex, 'core', 'BepInEx.Core.dll'),
    'Pack/winhttp.dll': 'winhttp.dll',
    'Pack/doorstop_config.ini': 'doorstop_config.ini',
    'Pack/dotnet/coreclr.dll': path.join('dotnet', 'coreclr.dll'),
  },
);

expectDest(
  ['Mods/NivalisTrainer.dll'],
  { 'Mods/NivalisTrainer.dll': path.join('Mods', 'NivalisTrainer.dll') },
);

const ignored = toInstructions([
  'NivalisFifo.dll',
  '__MACOSX/._NivalisFifo.dll',
  '.DS_Store',
], GAME_ID);
assert.strictEqual(
  ignored.instructions.some((instruction) => instruction.source === '__MACOSX/._NivalisFifo.dll'),
  false,
);
assert.strictEqual(
  ignored.instructions.some((instruction) => instruction.source === 'NivalisFifo.dll'),
  true,
);

assert.strictEqual(toInstructions(['README.txt'], GAME_ID).supported, false);
assert.strictEqual(toInstructions(['Foo.dll'], 'skyrim').supported, false);
assert.strictEqual(toInstructions(['BepInEx/plugins/'], GAME_ID).supported, false);

const windows = toInstructions(['BepInEx\\plugins\\Foo.dll'], GAME_ID);
assert.strictEqual(
  windows.instructions.find((instruction) => instruction.type === 'copy').destination,
  path.join(bepinex, 'plugins', 'Foo.dll'),
);

console.log('installer tests passed');
