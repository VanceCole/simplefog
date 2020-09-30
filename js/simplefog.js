import SimplefogLayer from '../classes/SimplefogLayer.js';
import sightLayerUpdate from './sightLayerUpdate.js';
import SimplefogMigrations from '../classes/SimplefogMigrations.js';
import config from './config.js';
import { simplefogLog } from './helpers.js';

Hooks.once('init', () => {
  // eslint-disable-next-line no-console
  simplefogLog('Initializing simplefog', true);

  // Register global module settings
  config.forEach((cfg) => {
    game.settings.register('simplefog', cfg.name, cfg.data);
  });
});

Hooks.once('canvasInit', () => {
  // Add SimplefogLayer to canvas
  const layerct = canvas.stage.children.length;
  canvas.simplefog = canvas.stage.addChildAt(new SimplefogLayer(), layerct);
});

Hooks.on('canvasInit', () => {
  canvas.simplefog.init();
});

/*
 * Apply compatibility patches
 */
Hooks.once('ready', () => {
  // Check if any migrations need to be performed
  SimplefogMigrations.check();
  // Monkeypatch SightLayer to check simplefog vision on updates
  if (game.data.version.startsWith('0.6')) {
    const origUpdate = canvas.sight.update;
    canvas.sight.update = function update(...args) {
      origUpdate.call(this, ...args);
      sightLayerUpdate();
    };
    canvas.sight.update();
  }
  else {
    const origUpdate = canvas.sight.refresh;
    canvas.sight.refresh = function refresh(...args) {
      origUpdate.call(this, ...args);
      sightLayerUpdate();
    };
    canvas.sight.refresh();
  }
});
