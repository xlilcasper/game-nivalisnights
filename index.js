const path = require('path');
const { fs, util } = require('vortex-api');
const { GAME_ID, MOD_TYPE_ID, toInstructions } = require('./install-patterns');

// Steam app 1488490. Nexus domain: nexusmods.com/nivalisnights
const STEAMAPP_ID = '1488490';
const BEPINEX_PACK_URL = 'https://www.nexusmods.com/nivalisnights/mods/25';
const BEPINEX_CORE = path.join('BepInEx', 'core', 'BepInEx.Unity.IL2CPP.dll');

function main(context) {
  context.registerGame({
    id: GAME_ID,
    name: 'Nivalis Nights',
    mergeMods: true,
    queryPath: findGame,
    supportedTools: [],
    queryModPath: () => '.',
    logo: 'gameart.png',
    executable: () => 'Nivalis Nights.exe',
    requiredFiles: [
      'Nivalis Nights.exe',
      'GameAssembly.dll',
      'UnityPlayer.dll',
    ],
    setup: (discovery) => prepareForModding(context.api, discovery),
    environment: {
      SteamAPPId: STEAMAPP_ID,
    },
    details: {
      steamAppId: STEAMAPP_ID,
      nexusPageId: GAME_ID,
    },
  });

  // Deploy into the game directory. Install instructions already include the
  // BepInEx or Mods folders, so this path must be the game root.
  context.registerModType(
    MOD_TYPE_ID,
    25,
    (gameId) => gameId === GAME_ID,
    (game) => {
      const discovery = context.api.getState().settings.gameMode.discovered[game.id];
      return discovery?.path;
    },
    () => Promise.resolve(false),
    {
      name: 'Nivalis Nights',
      mergeMods: true,
    },
  );

  context.registerInstaller(
    'nivalisnights-mod',
    25,
    testSupportedContent,
    installContent,
  );

  return true;
}

function findGame() {
  return util.GameStoreHelper.findByAppId([STEAMAPP_ID])
    .then((game) => game.gamePath);
}

function testSupportedContent(files, gameId) {
  const result = toInstructions(files, gameId);
  return Promise.resolve({
    supported: result.supported,
    requiredFiles: [],
  });
}

function installContent(files) {
  const result = toInstructions(files, GAME_ID);
  return Promise.resolve({ instructions: result.instructions });
}

async function prepareForModding(api, discovery) {
  const folders = [
    path.join(discovery.path, 'BepInEx', 'plugins'),
    path.join(discovery.path, 'BepInEx', 'patchers'),
    path.join(discovery.path, 'BepInEx', 'config'),
    path.join(discovery.path, 'Mods'),
  ];

  for (const folder of folders) {
    await fs.ensureDirWritableAsync(folder);
  }

  return fs.statAsync(path.join(discovery.path, BEPINEX_CORE))
    .catch(() => {
      api.sendNotification({
        id: 'nivalisnights-bepinex-missing',
        type: 'warning',
        title: 'BepInEx IL2CPP pack required',
        message: 'Most Nivalis Nights mods need the BepInEx IL2CPP pack installed into the game folder.',
        allowSuppress: true,
        actions: [
          {
            title: 'Get BepInEx',
            action: () => util.opn(BEPINEX_PACK_URL).catch(() => undefined),
          },
        ],
      });
    });
}

module.exports = {
  default: main,
};
