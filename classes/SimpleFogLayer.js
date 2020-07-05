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
    
    canvasInit() {
        const v = canvas.scene.getFlag('simplefog', 'visible');
        if (v) {
            canvas.simplefog.visible = true;
        } else if (v == false) {
            canvas.simplefog.visible = false;
        } else {
            canvas.simplefog.visible = false;
            canvas.scene.setFlag('simplefog', 'visible', false);
        }
 
        // Fog is the base fog object
        //canvas.simplefog = canvas.stage.addChildAt(new SimpleFogLayer(canvas), 7);
        this.fog = new PIXI.Sprite(PIXI.Texture.WHITE);
        const d = canvas.dimensions;
        this.fog.width = d.width;
        this.fog.height = d.height;
        this.fog.tint = 0x0000FF;
        this.fog.x = 0;
        this.fog.y = 0;
        canvas.simplefog.addChild(this.fog);

        // Create the mask
        this.simplefogmask = PIXI.RenderTexture.create({ width: d.width, height: d.height});
        const maskSprite = new PIXI.Sprite(this.simplefogmask);

        // Set fog mask to use the mask sprite
        this.fog.mask = maskSprite;

        // Make the mask sprite follow master canvas sizing
        canvas.stage.addChild(maskSprite);

        // Composite the initial fill
        const fill = new PIXI.Graphics();
        fill.beginFill(0xCCCCCC);
        fill.drawRect(0,0, d.width, d.height);
        fill.endFill();
        canvas.simplefog.composite(fill);

        // Create circle texture for brush drawing
        this.brush = new PIXI.Graphics();
        this.brush.beginFill(0x000000);
        this.brush.drawCircle(0, 0, 50);
        this.brush.endFill();
        this.brush.x = 100;
        this.brush.y = 100;

        this.dragging = false;
    }

    pointerMove = function(event) {
        if (this.dragging) {
            this.brush.position.copyFrom(event.data.getLocalPosition(canvas.app.stage));
            this.compositeEvent(this.brush);
        }
    }
    
    pointerDown = function(event) {
        if (event.data.button === 0) {
            this.dragging = true;
            this.pointerMove(event);
        }
    }
    
    pointerUp = function(event) {
        this.dragging = false;
    }

    compositeEvent = function(shape) {
        this.composite(shape);
        //canvas.scene.setFlag('simplefog', 'mask', simplefog.mask);
    }
    
    // Composites a given shape to the mask and adds history to stack
    composite = function(shape) {
        canvas.app.renderer.render(shape, this.simplefogmask, false, null, false);
    }

    // Renders the entire stack of composite ops
    renderStack = function() {

    }

    toggle = function() {
        if (canvas.scene.getFlag('simplefog','visible')) {
            canvas.simplefog.visible = false;
            canvas.scene.setFlag('simplefog','visible', false)
        } else {
            canvas.simplefog.visible = true;
            canvas.scene.setFlag('simplefog','visible', true)
        }
    }

    activate() {
        super.activate();
        canvas.simplefog.interactive = true;
    }
  
    deactivate() {
        super.deactivate();
        canvas.simplefog.interactive = false;
    }
  
    async draw() {
        super.draw();
    }
}
  