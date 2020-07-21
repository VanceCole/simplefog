import { SimpleFogLayer } from "../classes/SimpleFogLayer.js";

if (!CONFIG.simplefog) CONFIG.simplefog = {};

Hooks.on("ready", function() {
})

Hooks.once("canvasInit", (canvas) => {
});

Hooks.once("canvasInit", (canvas) => {
    canvas.simplefog = canvas.stage.addChildAt(new SimpleFogLayer(), 14);
});

Hooks.on("canvasInit", (canvas) => {
    canvas.simplefog.canvasInit();
});

Hooks.on("canvasReady", (_) => {
});

