import SimplefogLayer from '../classes/SimplefogLayer.js';
import SimplefogMigrations from '../classes/SimplefogMigrations.js';
import config from './config.js';
import {simplefogLog, simplefogLogDebug, simplefogLogVerboseDebug} from './helpers.js';
import SimplefogHUDControlLayer from "../classes/SimplefogHUDControlLayer.js";
import SimplefogVersionNotification from "../classes/SimplefogVersionNotification.js";

Hooks.once('init', () => {
    simplefogLog('simplefog.init')
  // eslint-disable-next-line no-console
  simplefogLog('Initializing simplefog', true);

  // Register global module settings
  config.forEach((cfg) => {
    game.settings.register('simplefog', cfg.name, cfg.data);
  });

  if (isNewerVersion(game.version, "10")) {
    CONFIG.Canvas.layers.simplefog = {group: "interface", layerClass: SimplefogLayer};
    CONFIG.Canvas.layers.simplefogHUDControls = {group: "interface", layerClass: SimplefogHUDControlLayer};

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
  }
});

Hooks.once('canvasInit', () => {
  simplefogLogDebug('simplefog.canvasInit')
  if (isNewerVersion(game.version, "10")) {
    simplefogLogVerboseDebug('simplefog.canvasInit - v10', canvas, CONFIG)
    canvas.simplefog.canvasInit()
  } else if (isNewerVersion(game.version, "9")) {
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

  // Move object hud to tokens layer
  game.canvas.controls.hud.setParent(game.canvas.simplefogHUDControls)

  // Check if new version; if so send DM to GM
  SimplefogVersionNotification.checkVersion()

  //Hooks.on('sightRefresh', sightLayerUpdate);

  //ToDo: Determine replacement for canvas.sight.refresh()
  canvas.perception.refresh()

});

Hooks.once('devModeReady', ({ registerPackageDebugFlag }) => {
  registerPackageDebugFlag('simplefog');
});