import SimpleFogLayer from '../classes/SimplefogLayer.js';
import SimplefogSightLayer from '../classes/SimplefogSightLayer.js';

// Replace sight layer with our extended version that will check token visibility
SightLayer = SimplefogSightLayer;

if (!CONFIG.simplefog) CONFIG.simplefog = {};

Hooks.once('canvasInit', () => {
  canvas.simplefog = canvas.stage.addChildAt(new SimpleFogLayer(), 14);
});

Hooks.on('canvasInit', () => {
  canvas.simplefog.canvasInit();
});
