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
    // React to visibility change
    if (hasProperty(data, "flags.simplefog.visible")) {
        canvas.simplefog.visible = data.flags.simplefog.visible;
    }

    // React to composite history change
    if (hasProperty(data, "flags.simplefog.history")) {
        canvas.simplefog.renderStack(data.flags.simplefog.history);
    }

    // React to alpha/tint changes
    if (!game.user.isGM && hasProperty(data, "flags.simplefog.playerAlpha")) canvas.simplefog.setAlpha(data.flags.simplefog.playerAlpha);
    if (game.user.isGM && hasProperty(data, "flags.simplefog.gmAlpha")) canvas.simplefog.setAlpha(data.flags.simplefog.gmAlpha);
    if (!game.user.isGM && hasProperty(data, "flags.simplefog.playerTint")) canvas.simplefog.setTint(data.flags.simplefog.playerTint);
    if (game.user.isGM && hasProperty(data, "flags.simplefog.gmTint")) canvas.simplefog.setTint(data.flags.simplefog.gmTint);
});
