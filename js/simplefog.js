import SimplefogLayer from '../classes/SimplefogLayer.js';
import sightLayerUpdate from './sightLayerUpdate.js';
// import config from './config.js';

Hooks.once('init', () => {
  // eslint-disable-next-line no-console
  console.log('simplefog | Initializing simplefog');

  // Monkeypatch SightLayer to check simplefog vision on updates
  const origUpdate = SightLayer.prototype.update;
  SightLayer.prototype.update = function update() {
    origUpdate.bind(this)();
    sightLayerUpdate();
  };

  // Register global module settings
  // config.forEach((cfg) => {
  //   game.settings.register('simplefog', cfg.name, cfg.data);
  // });
});

Hooks.once('canvasInit', () => {
  // Add SimplefogLayer to canvas
  canvas.simplefog = canvas.stage.addChildAt(new SimplefogLayer(), 14);
});

Hooks.on('canvasInit', () => {
  canvas.simplefog.init();
});

/*
 * Apply compatibility patches
 */
Hooks.once('ready', () => {
  if (game.modules.get('DancingLights')) {
    // Dancing lights clobbers the patched update, so monkeypatch it again...
    const origUpdate = canvas.sight.update;
    canvas.sight.update = function update() {
      origUpdate.bind(this)();
      sightLayerUpdate();
    };
    canvas.sight.update();
  }
});
