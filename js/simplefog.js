import SimplefogLayer from '../classes/SimplefogLayer.js';
import SimplefogMigrations from '../classes/SimplefogMigrations.js';
import config from './config.js';
import {simplefogLog, simplefogLogDebug, simplefogLogVerboseDebug, addSimplefogControlToggleListener, addSimplefogOpacityToggleListener,} from './helpers.js';
import SimplefogHUDControlLayer from "../classes/SimplefogHUDControlLayer.js";
import SimplefogVersionNotification from "../classes/SimplefogVersionNotification.js";

Hooks.once('init', () => {
  simplefogLog('simplefog.init')
  //CONFIG.debug.hooks = true
  // eslint-disable-next-line no-console
  simplefogLog('Initializing simplefog', true);

  // Register global module settings
  config.forEach((cfg) => {
    game.settings.register('simplefog', cfg.name, cfg.data);
  });

  // Register global config settings
  game.settings.register('simplefog', 'confirmFogDisable', {
    name: 'Confirm Disabling of Scene Simplefog',
    hint: 'When enabled, a confirmation dialog will be displayed before Simplefog can be toggled off for a scene',
    scope: 'world',
    config: true,
    default: true,
    type: Boolean
  });
  game.settings.register('simplefog', 'autoEnableSceneFog', {
    name: 'Auto Enable Scene Fog',
    hint: 'When enabled, Simplefog will automatically be enabled for a scene when it is first created.',
    scope: 'world',
    config: true,
    default: true,
    type: Boolean
  });
  game.settings.register('simplefog', 'enableHotKeys', {
    name: 'Enable Simplefog Hotkeys',
    hint: 'When enabled, you will be able to quickly swap to the Simplefog control by using Ctrl+S and toggle the opacity using the hotkey \'T\'',
    scope: 'world',
    config: true,
    default: false,
    type: Boolean
  });
  game.settings.register('simplefog', 'toolHotKeys', {
    name: 'Hotkey Tool',
    hint: 'When Hotkeys is enabled, define which tool will be selected by using Ctrl+S',
    scope: 'world',
    config: true,
    default: 'brush',
    type: String,
    choices: {
      'brush': 'Brush',
      'grid': 'Grid',
      'polygon': 'Polygon',
      'box': 'Box',
      'ellipse': 'Ellipse',
    }
  });
  game.settings.register('simplefog', 'zIndex', {
    name: 'Simplefog Z-Index',
    hint: 'The z-index determines the order in which various layers are rendered within the Foundry canvas.  A higher number will be rendered on top of lower numbered layers (and the objects on that layer).  This allows for the adjustment of the z-index to allow for Simple Fog to be rendered above/below other layers; particularly ones added by other modules. Going below 200 will intermingle with Foundry layers such as the foreground image (200), tokens (100), etc...  (Default: 220)',
    scope: 'world',
    config: true,
    default: 220,
    type: Number,
    onChange: SimplefogLayer.refreshZIndex
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

  canvas.simplefog.refreshZIndex()
  // ToDo: why is this set below???
  //canvas.simplefogHUDControls.zIndex = canvas.simplefog.getSetting('layerZindex') - 1;

  // Move object hud to tokens layer
  game.canvas.controls.hud.setParent(game.canvas.simplefogHUDControls)

  // Check if new version; if so send DM to GM
  SimplefogVersionNotification.checkVersion()

  //Hooks.on('sightRefresh', sightLayerUpdate);

  //ToDo: Determine replacement for canvas.sight.refresh()
  canvas.perception.refresh()

  addSimplefogControlToggleListener();
  addSimplefogOpacityToggleListener();
});

Hooks.once('devModeReady', ({ registerPackageDebugFlag }) => {
  registerPackageDebugFlag('simplefog');
});