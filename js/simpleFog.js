import { SimpleFogLayer } from "../classes/SimpleFogLayer.js";

if (!CONFIG.vance) CONFIG.vance = {};
if (!window.vance) window.vance = {};
vance.fog = {};

Hooks.on("ready", function() {
    console.log('Manual Fog | Ready')
})

Hooks.once("canvasInit", (canvas) => {
    // Create the fog layer
    // Create circle texture for brush drawing
    vance.fog.brush = new PIXI.Graphics();
    vance.fog.brush.beginFill(0x000000);
    vance.fog.brush.drawCircle(0, 0, 20);
    vance.fog.brush.endFill();
    vance.fog.brush.x = 100;
    vance.fog.brush.y = 100;

    vance.fog.dragging = false;
});


Hooks.once("canvasInit", (canvas) => {
    canvas.simplefog = canvas.stage.addChildAt(new SimpleFogLayer(canvas), 7);
});

Hooks.on("canvasInit", (canvas) => {
    // Probably needs to do something here when switching scenes
});

Hooks.on("canvasReady", (_) => {
    canvas.simplefog.canvasReady();
});
