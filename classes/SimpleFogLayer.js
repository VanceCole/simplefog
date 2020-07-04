export class SimpleFogLayer extends PlaceablesLayer {
    constructor() {
        super();
    }
  
    static get layerOptions() {
        return mergeObject(super.layerOptions, {
            canDragCreate: false,
            objectClass: Note,
            sheetClass: NoteConfig
        });
    }
    
    /** @override */
    _onClickLeft(event) {
        const windows = Object.values(ui.windows);
        const effectConfig = windows.find((w) => w.id == "specials-config");
        if (!effectConfig) return;
        const active = effectConfig.element.find(".active");
        if (active.length == 0) return;
        let data = {
        type: active[0].dataset.effectId,
        position: {
            x: event.data.origin.x,
            y: event.data.origin.y,
        },
        };
        event.stopPropagation();
        game.socket.emit("module.fxmaster", data);
        canvas.fxmaster.throwEffect(data);
    }
  
    canvasReady() {
        console.log("Activating canvas for simple fog");
        // Fog is the base fog object
        //canvas.simplefog = canvas.stage.addChildAt(new SimpleFogLayer(canvas), 7);
        let fog = new PIXI.Sprite(PIXI.Texture.WHITE);
        fog.width = canvas.stage.hitArea.width;
        fog.height = canvas.stage.hitArea.height;
        fog.tint = 0x0000FF;
        fog.x = 0;
        fog.y = 0;

        // Add fog to foundry stage
        canvas.simplefog.addChild(fog);

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
        canvas.simplefog.composite(fill);

        canvas.simplefog.interactive = true;
        canvas.simplefog.on('pointerdown', canvas.simplefog.pointerDown);
        canvas.simplefog.on('pointerup', canvas.simplefog.pointerUp);
        canvas.simplefog.on('pointermove', canvas.simplefog.pointerMove);

    }


    pointerMove = function(event) {
        if (vance.fog.dragging) {
            vance.fog.brush.position.copyFrom(event.data.getLocalPosition(canvas.app.stage));
            canvas.simplefog.composite(vance.fog.brush);
        }
    }
    
    pointerDown = function(event) {
        vance.fog.dragging = true;
        canvas.simplefog.pointerMove(event);
    }
    
    pointerUp = function(event) {
        vance.fog.dragging = false;
    }
    
    composite = function(shape) {
        canvas.app.renderer.render(shape, vance.fog.mask, false, null, false);
    }

    activate() {
        super.activate();
    }
  
    deactivate() {
        super.deactivate();
    }
  
    async draw() {
        super.draw();
    }
  
    updateMask() {
        this.visible = true;
        // Setup scene mask
        if (this.mask) this.removeChild(this.mask);
        this.mask = new PIXI.Graphics();
        this.addChild(this.mask);
        const d = canvas.dimensions;
        this.mask.beginFill(0xffffff);
        if (canvas.background.img) {
        this.mask.drawRect(
            d.paddingX - d.shiftX,
            d.paddingY - d.shiftY,
            d.sceneWidth,
            d.sceneHeight
        );
        } else {
            this.mask.drawRect(0, 0, d.width, d.height);
        }
    }
}
  