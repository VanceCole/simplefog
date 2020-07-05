import { SimpleFogLayer } from "../classes/SimpleFogLayer.js";

if (!CONFIG.simplefog) CONFIG.simplefog = {};
if (!window.simplefog) window.simplefog = {};

Hooks.on("ready", function() {
})

Hooks.once("canvasInit", (canvas) => {
});

Hooks.once("canvasInit", (canvas) => {
    canvas.simplefog = canvas.stage.addChildAt(new SimpleFogLayer(canvas), 14);
});

Hooks.on("canvasInit", (canvas) => {
    canvas.simplefog.canvasInit();
});

Hooks.on("canvasReady", (_) => {
});

Hooks.on("updateScene", (scene, data, options) => {
    if (hasProperty(data, "flags.simplefog.visible")) {
        canvas.simplefog.visible = data.flags.simplefog.visible;
    }
    if(hasProperty(data, "flags.simplefog.history")) {
        console.log('Reacting to simple fog history update');
    }
});