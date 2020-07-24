import { SimpleFogLayer } from '../classes/SimpleFogLayer.js';

if (!CONFIG.simplefog) CONFIG.simplefog = {};

Hooks.once('canvasInit', () => {
  canvas.simplefog = canvas.stage.addChildAt(new SimpleFogLayer(), 14);
});

Hooks.on('canvasInit', () => {
  canvas.simplefog.canvasInit();
});
