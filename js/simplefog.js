import SimplefogLayer from '../classes/SimplefogLayer.js';
import sightLayerUpdate from './sightLayerUpdate.js';
// import config from './config.js';

Hooks.once('init', () => {
  // eslint-disable-next-line no-console
  console.log('simplefog | Initializing simplefog');

  // Register global module settings
  // config.forEach((cfg) => {
  //   game.settings.register('simplefog', cfg.name, cfg.data);
  // });
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
  // Monkeypatch SightLayer to check simplefog vision on updates
  const origUpdate = canvas.sight.update;
  canvas.sight.update = function update() {
    origUpdate.bind(this)();
    sightLayerUpdate();
  };
  canvas.sight.update();
});
