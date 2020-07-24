import { SimpleFogLayer } from '../classes/SimpleFogLayer.js';
import { SimplefogSightLayer } from '../classes/SimplefogSightLayer.js';

SightLayer = SimplefogSightLayer;

if (!CONFIG.simplefog) CONFIG.simplefog = {};

Hooks.once('canvasInit', () => {
  canvas.simplefog = canvas.stage.addChildAt(new SimpleFogLayer(), 14);
});

Hooks.on('canvasInit', () => {
  canvas.simplefog.canvasInit();
});
