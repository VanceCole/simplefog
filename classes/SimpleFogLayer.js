const gmAlphaDefault = 0.5;
const gmTintDefault = 0x000000;
const playerAlphaDefault = 1;
const playerTintDefault = 0x000000;

export class SimpleFogLayer extends PlaceablesLayer {
    constructor() {
        super();
        this.historyBuffer = [];
    }
  
    static get layerOptions() {
        return mergeObject(super.layerOptions, {
            canDragCreate: false,
            objectClass: Note,
            sheetClass: NoteConfig
        });
    }
    
    canvasInit() {
        this.initVars();

        // Fog is the base fog object
        //canvas.simplefog = canvas.stage.addChildAt(new SimpleFogLayer(canvas), 7);
        this.fog = new PIXI.Sprite(PIXI.Texture.WHITE);
        const d = canvas.dimensions;
        this.fog.width = d.width;
        this.fog.height = d.height;
        this.fog.x = 0;
        this.fog.y = 0;
        this.setTint(this.getTint());
        canvas.simplefog.addChild(this.fog);

        // Create the mask
        this.simplefogmask = PIXI.RenderTexture.create({ width: d.width, height: d.height});
        const maskSprite = new PIXI.Sprite(this.simplefogmask);

        // Set fog mask to use the mask sprite
        this.fog.mask = maskSprite;

        // Make the mask sprite follow canvas sizing
        canvas.stage.addChild(maskSprite);

        // Composite the initial fill
        this.setAlpha(this.getAlpha());

        // Create circle texture for brush drawing
        this.brush = new PIXI.Graphics();
        this.brush.beginFill(0x000000);
        this.brush.drawCircle(0, 0, 50);
        this.brush.endFill();
        this.brush.curSize = 50;
        this.brush.curAlpha = 0x000000;
        this.brush.x = 100;
        this.brush.y = 100;

        // Register mouse event listerenrs
        this.removeAllListeners();
        this.on('pointerdown', this.pointerDown);
        this.on('pointerup', this.pointerUp);
        this.on('pointermove', this.pointerMove);

        // Set dragging flags
        this.dragging = false;
        this.brushing = false;

        // If a history stack exists for this scene, render it
        this.renderStack();
    }

    // Composites a given shape to the mask
    composite(shape) {
        canvas.app.renderer.render(shape, this.simplefogmask, false, null, false);
    }

    // Renders the entire stack of composite ops
    renderStack(history = canvas.scene.getFlag('simplefog', 'history')) {
        // If history is blank, do nothing
        if(history === undefined) return;
        // If history is zero, reset scene fog
        if(history.events.length == 0) this.resetFog(false);
        // Render all ops
        for(let i = 0; i < history.events.length; i++){
            for(let j = 0; j < history.events[i].length; j++) {
                if (history.events[i][j].type == "brush") this.renderBrush(history.events[i][j], false);
            }
        }
        
    }

    // Handler for drawing brush type data to mask
    renderBrush(data, save = true) {
        this.brush.position.x = data.x;
        this.brush.position.y = data.y;
        if (this.brush.curSize != data.size) {
            // change size
        }
        if (this.brush.curAlpha != data.alpha) {
            // change alpha
        }

        this.composite(this.brush)
        if (save) this.historyBuffer.push(data);
    }


    // Resets all fog, if save is true, flush history also
    resetFog(save = true) {
        this.setAlpha(this.getAlpha());
        if(save) {
            canvas.scene.unsetFlag('simplefog', 'history');
            canvas.scene.setFlag('simplefog', 'history', { events: [], pointer: 0 });
        }
    }

    // Toggle fog visibility
    toggle() {
        if (canvas.scene.getFlag('simplefog','visible')) {
            canvas.simplefog.visible = false;
            canvas.scene.setFlag('simplefog','visible', false)
        } else {
            canvas.simplefog.visible = true;
            canvas.scene.setFlag('simplefog','visible', true)
        }
    }

    // Push buffered history stack to scane flag and clear buffer
    async commitHistory() {
        let history = canvas.scene.getFlag('simplefog', 'history');
        if(!history) history = {
            events: [],
            pointer: 0,
        };
        history.events.push(this.historyBuffer);
        history.events.pointer = history.events.length;
        await canvas.scene.unsetFlag('simplefog', 'history');
        await canvas.scene.setFlag('simplefog','history', history);
        console.log(`Pushed ${this.historyBuffer.length} simpleFog updates.`);
        this.historyBuffer = [];
    }

    // Returns the configured alpha for the current user
    getTint() {
        let tint;
        if (game.user.isGM) tint = canvas.scene.getFlag('simplefog', 'gmTint');
        else tint = canvas.scene.getFlag('simplefog', 'playerTint');
        if (!tint) {
            if (game.user.isGM) tint = this.gmTintDefault;
            else tint = this.playerTintDefault;
        }
        return tint;
    }

    // Tints fog with given tint as hex color
    setTint(tint, save = true) {
        console.log(`Setting tint to ${tint}`);
        this.fog.tint = tint;
    }

    // Returns the configured alpha for the current user
    getAlpha() {
        let alpha;
        if (game.user.isGM) alpha = canvas.scene.getFlag('simplefog', 'gmAlpha');
        else alpha = canvas.scene.getFlag('simplefog', 'playerAlpha');
        if (!alpha) {
            if (game.user.isGM) alpha = this.gmAlphaDefault;
            else alpha = this.playerAlphaDefault;
        }
        return alpha;
    }

    // Sets alpha for the fog layer
    setAlpha(alpha, save = true) {
        console.log(`Setting alpha to ${alpha}`);
        const fill = new PIXI.Graphics();
        fill.beginFill(alpha);
        fill.drawRect(0,0, canvas.dimensions.width, canvas.dimensions.height);
        fill.endFill();
        canvas.simplefog.composite(fill);
    }

    // Mouse event listener handlers
    pointerMove(event) {
        let p = event.data.getLocalPosition(canvas.app.stage);
        if (this.brushing) this.renderBrush({
            type: 'brush',
            x: p.x,
            y: p.y,
            size: 0,
            alpha: 0x000000
        });
    }
    pointerDown(event) {
        // Only react on left mouse button
        if (event.data.button === 0) {
            if (ui.controls.controls.find( n => n.name == "simplefog" ).activeTool == "brush") {
                this.brushing = true;
                this.pointerMove(event);
            }
        }
    }
    pointerUp(event) {
        if (event.data.button === 0) {
            this.brushing = false;
            this.commitHistory();
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

    async initVars() {
        const v = canvas.scene.getFlag('simplefog', 'visible');
        if (v) {
            canvas.simplefog.visible = true;
        } else if (v == false) {
            canvas.simplefog.visible = false;
        } else {
            canvas.simplefog.visible = false;
            canvas.scene.setFlag('simplefog', 'visible', false);
        }
        if (!canvas.scene.getFlag('simplefog', 'gmAlpha')) await canvas.scene.setFlag('simplefog', 'gmAlpha', gmAlphaDefault);
        if (!canvas.scene.getFlag('simplefog', 'gmTint')) await canvas.scene.setFlag('simplefog', 'gmTint', gmTintDefault);
        if (!canvas.scene.getFlag('simplefog', 'playerAlpha')) await canvas.scene.setFlag('simplefog', 'playerAlpha', playerAlphaDefault);
        if (!canvas.scene.getFlag('simplefog', 'playerTint')) await canvas.scene.setFlag('simplefog', 'playerTint', playerTintDefault);
    }
  
    async draw() {
        super.draw();
    }
}
  