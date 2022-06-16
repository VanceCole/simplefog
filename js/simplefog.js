import SimplefogLayer from '../classes/SimplefogLayer.js';
import SimplefogMigrations from '../classes/SimplefogMigrations.js';
import config from './config.js';
import { simplefogLog } from './helpers.js';
import SimplefogHUDControlLayer from "../classes/SimplefogHUDControlLayer.js";

Hooks.once('init', () => {
  // eslint-disable-next-line no-console
  simplefogLog('Initializing simplefog', true);

  // Register global module settings
  config.forEach((cfg) => {
    game.settings.register('simplefog', cfg.name, cfg.data);
  });
});

Hooks.once('canvasInit', () => {
  if (isNewerVersion(game.version, "9")) {
    CONFIG.Canvas.layers["simplefog"] = {
      layerClass: SimplefogLayer,
      group: "primary"
    };
    CONFIG.Canvas.layers["simplefogHUDControls"] = {
      layerClass: SimplefogHUDControlLayer,
      group: "primary"
    };
    Object.defineProperty(canvas, 'simplefog', {
      value: new SimplefogLayer(),
      configurable: true,
      writable: true,
      enumerable: false,
    });
    Object.defineProperty(canvas, 'simplefogHUDControls', {
      value: new SimplefogHUDControlLayer(),
      configurable: true,
      writable: true,
      enumerable: false,
    });
    canvas.primary.addChild(canvas.simplefog);
    canvas.primary.addChild(canvas.simplefogHUDControls);
  } else {
    canvas.simplefog = new SimplefogLayer();
    canvas.stage.addChild(canvas.simplefog);
    canvas.simplefogHUDControls = new simplefogHUDControls();
    canvas.stage.addChild(canvas.simplefogHUDControls);

    let theLayers = Canvas.layers;
    theLayers.simplefog = SimplefogLayer;
    theLayers.simplefogHUDControls = SimplefogHUDControlLayer;
    Object.defineProperty(Canvas, 'layers', {get: function() {
        return theLayers
    }})
  }
});

/*
 * Apply compatibility patches
 */
Hooks.once('ready', () => {
  // Check if any migrations need to be performed
  SimplefogMigrations.check();

  // Fix simplefog zIndex
  canvas.simplefog.zIndex = canvas.simplefog.getSetting('layerZindex');
  canvas.simplefogHUDControls.zIndex = canvas.simplefog.getSetting('layerZindex') - 1;

  // // Move object hud to tokens layer
  game.canvas.controls.hud.setParent(game.canvas.simplefogHUDControls)

  //ooks.on('sightRefresh', sightLayerUpdate);
  canvas.sight.refresh();
});
