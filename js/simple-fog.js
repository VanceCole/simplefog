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


Hooks.on("canvasInit", (canvas) => {
    // filterManager.clear();
});

Hooks.on("canvasReady", (_) => {
    // Fog is the base fog object
    let fog = new PIXI.Sprite(PIXI.Texture.WHITE);
    fog.width = canvas.stage.hitArea.width;
    fog.height = canvas.stage.hitArea.height;
    fog.tint = 0x0000FF;
    fog.x = 0;
    fog.y = 0;

    // Add fog to foundry stage
    canvas.vfog = canvas.stage.addChildAt(fog, 14);

    // Fill the stage with fog


    // Create the mask
    vance.fog.mask = PIXI.RenderTexture.create({ width: fog.width, height: fog.height});
    const maskSprite = new PIXI.Sprite(vance.fog.mask);
    // Set fog mask to use the mask sprite
    fog.mask = maskSprite;

    // Make the mask sprite follow master canvas sizing
    canvas.stage.addChild(maskSprite);

    // Composite the initial fill
    const fill = new PIXI.Graphics();
    fill.beginFill(0xCCCCCC);
    fill.drawRect(0,0, fog.width, fog.height);
    fill.endFill();
    vance.fog.composite(fill);

    canvas.vfog.interactive = true;
    canvas.vfog.on('pointerdown', vance.fog.pointerDown);
    canvas.vfog.on('pointerup', vance.fog.pointerUp);
    canvas.vfog.on('pointermove', vance.fog.pointerMove);

    //canvas.app.renderer.render(vance.fog.brush, mask, false, null, false);

    //vance.fog.composite(vance.fog.brush);
    // filterManager.activate();
    // canvas.fxmaster.updateMask();
    // canvas.fxmaster.drawWeather();
});

vance.fog.pointerMove = function(event) {
    if (vance.fog.dragging) {
        vance.fog.brush.position.copyFrom(event.data.getLocalPosition(canvas.app.stage));
        vance.fog.composite(vance.fog.brush);
    }
}

vance.fog.pointerDown = function(event) {
    vance.fog.dragging = true;
    vance.fog.pointerMove(event);
}

vance.fog.pointerUp = function(event) {
    vance.fog.dragging = false;
}

vance.fog.composite = function(shape) {
    canvas.app.renderer.render(shape, vance.fog.mask, false, null, false);
}

// Hooks.on("updateScene", (scene, data, options) => {
//     if (!hasProperty(data, "flags.fxmaster.filters")) {
//         canvas.fxmaster.updateMask();
//         canvas.fxmaster.drawWeather();
//     }

//     filterManager.update();
// });