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
  canvas.simplefog.draw();
});

Hooks.on('canvasInit', () => {
  canvas.simplefog.init();

  let theLayers = Canvas.layers;
  theLayers.simplefog = SimplefogLayer;

  Object.defineProperty(Canvas, 'layers', {get: function() {
      return theLayers
  }})
});

/*
 * Apply compatibility patches
 */
Hooks.once('ready', () => {
  // Check if any migrations need to be performed
  SimplefogMigrations.check();

  //ooks.on('sightRefresh', sightLayerUpdate);
  canvas.sight.refresh();
});
