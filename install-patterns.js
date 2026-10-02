const path = require('path');

const GAME_ID = 'nivalisnights';
const MOD_TYPE_ID = 'nivalisnights-content';

const BEPINEX_TOP = new Set(['plugins', 'patchers', 'config']);
const MELON_TOP = new Set(['mods', 'userlibs', 'userdata']);

function segmentsOf(filePath) {
  return String(filePath).split(/[/\\]/).filter((segment) => segment && segment !== '.');
}

function isDirectoryEntry(filePath) {
  return !filePath || /[/\\]$/.test(filePath);
}

function isJunk(filePath) {
  const segments = segmentsOf(filePath).map((segment) => segment.toLowerCase());
  if (segments.length === 0) {
    return true;
  }
  if (segments.includes('__macosx') || segments.includes('.git')) {
    return true;
  }
  const base = segments[segments.length - 1];
  return base === '.ds_store' || base === 'thumbs.db' || base === 'desktop.ini';
}

function lowerSegments(filePath) {
  return segmentsOf(filePath).map((segment) => segment.toLowerCase());
}

function isLoaderFile(filePath) {
  const segments = lowerSegments(filePath);
  const base = segments[segments.length - 1];
  return base === 'winhttp.dll'
    || base === 'bepinex.unity.il2cpp.dll'
    || (base === 'bepinex.core.dll' && segments.includes('core'));
}

function isPayload(filePath) {
  const segments = lowerSegments(filePath);
  if (segments.length === 0) {
    return false;
  }
  const base = segments[segments.length - 1];
  if (path.extname(base) === '.dll') {
    return true;
  }
  if (segments.includes('bepinex') || segments.includes('melonloader')) {
    return true;
  }
  if (BEPINEX_TOP.has(segments[0]) || MELON_TOP.has(segments[0])) {
    return true;
  }
  return base === 'doorstop_config.ini' || base === '.doorstop_version';
}

function destinationFor(filePath, layout) {
  const segments = segmentsOf(filePath);
  const lower = segments.map((segment) => segment.toLowerCase());

  if (layout === 'loader') {
    const bepinexIdx = lower.indexOf('bepinex');
    if (bepinexIdx !== -1) {
      return segments.slice(bepinexIdx).join(path.sep);
    }
    const dotnetIdx = lower.indexOf('dotnet');
    if (dotnetIdx !== -1) {
      return segments.slice(dotnetIdx).join(path.sep);
    }
    return segments[segments.length - 1];
  }

  if (layout === 'melon') {
    const melonIdx = lower.indexOf('melonloader');
    if (melonIdx !== -1) {
      return segments.slice(melonIdx).join(path.sep);
    }
    if (MELON_TOP.has(lower[0])) {
      return segments.join(path.sep);
    }
    if (lower[lower.length - 1] === 'version.dll') {
      return 'version.dll';
    }
    return path.join('Mods', ...segments);
  }

  const bepinexIdx = lower.indexOf('bepinex');
  if (bepinexIdx !== -1) {
    return segments.slice(bepinexIdx).join(path.sep);
  }
  if (BEPINEX_TOP.has(lower[0])) {
    return path.join('BepInEx', ...segments);
  }
  if (MELON_TOP.has(lower[0])) {
    return segments.join(path.sep);
  }
  return path.join('BepInEx', 'plugins', ...segments);
}

function chooseLayout(files) {
  if (files.some(isLoaderFile)) {
    return 'loader';
  }
  const hasBepInEx = files.some((file) => lowerSegments(file).includes('bepinex'));
  const hasMelon = files.some((file) => {
    const segments = lowerSegments(file);
    return segments.includes('melonloader') || MELON_TOP.has(segments[0]);
  });
  if (hasMelon && !hasBepInEx) {
    return 'melon';
  }
  return 'bepinex';
}

/**
 * Map a mod archive's file list onto game-relative deploy paths.
 * Destinations are relative to the game directory (the folder that contains
 * "Nivalis Nights.exe"), which is also this extension's mod type path.
 */
function toInstructions(files, gameId) {
  if (gameId !== GAME_ID) {
    return { supported: false, instructions: [] };
  }

  const entries = (files || []).filter((file) => !isDirectoryEntry(file) && !isJunk(file));
  if (!entries.some(isPayload)) {
    return { supported: false, instructions: [] };
  }

  const layout = chooseLayout(entries);
  const instructions = [];
  entries.forEach((file) => {
    const destination = destinationFor(file, layout);
    if (!destination) {
      return;
    }
    instructions.push({
      type: 'copy',
      source: file,
      destination,
    });
  });

  if (instructions.length === 0) {
    return { supported: false, instructions: [] };
  }

  instructions.push({ type: 'setmodtype', value: MOD_TYPE_ID });
  return { supported: true, instructions };
}

module.exports = {
  GAME_ID,
  MOD_TYPE_ID,
  toInstructions,
};
