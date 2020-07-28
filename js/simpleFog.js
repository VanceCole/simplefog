import SimplefogLayer from '../classes/SimplefogLayer.js';
import SimplefogSightLayer from '../classes/SimplefogSightLayer.js';
import config from './config.js';

Hooks.once('init', () => {
  console.log('simplefog | Initializing simplefog');
  // Register global module settings
  config.forEach((cfg) => {
    game.settings.register('simplefog', cfg.name, cfg.data);
  });
});

// Replace sight layer with our extended version that will check token visibility
SightLayer = SimplefogSightLayer;

Hooks.once('canvasInit', () => {
  canvas.simplefog = canvas.stage.addChildAt(new SimplefogLayer(), 14);
});

Hooks.on('canvasInit', () => {
  canvas.simplefog.layerInit();
  canvas.simplefog.fogInit();
});
