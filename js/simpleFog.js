import { SimpleFogLayer } from '../classes/SimpleFogLayer.js';

if (!CONFIG.simplefog) CONFIG.simplefog = {};

Hooks.once('canvasInit', () => {
  console.log('-------- Once init');
  canvas.simplefog = canvas.stage.addChildAt(new SimpleFogLayer(), 14);
});

Hooks.on('canvasInit', () => {
  console.log('-------- all init');
  canvas.simplefog.canvasInit();
});
