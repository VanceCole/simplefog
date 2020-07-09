const gmAlphaDefault = 0.6;
const gmTintDefault = '0x000000';
const playerAlphaDefault = 1;
const playerTintDefault = '0x000000';
const transitionDefault = true;
const transitionSpeedDefault = 800;

export class SimpleFogLayer extends PlaceablesLayer {
    constructor() {
        super();
        this.historyBuffer = [];
        this.pointer = 0;
        this.dragStart = {
            x: 0,
            y: 0
        };
        this.debug = true;
        this.log(`Canvas layer initialized`);
    }
  
    static get layerOptions() {
        return mergeObject(super.layerOptions, {
            canDragCreate: false,
            objectClass: Note,
            sheetClass: NoteConfig
        });
    }
    
    async canvasInit() {
        await this.initCanvasVars();

        // Create the fog element
        this.fog = this.getCanvasSprite();
        this.setTint(this.getTint());
        this.addChild(this.fog);

        // Create the mask elements for the fog
        this.simplefogmask = PIXI.RenderTexture.create({ width: canvas.dimensions.width, height: canvas.dimensions.height});
        const maskSprite = new PIXI.Sprite(this.simplefogmask);
        this.fog.mask = maskSprite;
        this.addChild(maskSprite);
        this.setFill();
        this.setAlpha(this.getAlpha(), true);

        this.addChild(this.boxPreview);

        // Register mouse event listerenrs
        this.registerMouseListeners();

        // Render initial history stack
        this.renderStack();
    }

    // Composites a given shape to the mask
    composite(shape) {
        canvas.app.renderer.render(shape, this.simplefogmask, false, null, false);
    }

    // Renders a stack of composite ops
    renderStack(history = canvas.scene.getFlag('simplefog', 'history'), pointer = this.pointer) {
        this.log(`Rendering from: ${pointer}`);
        // If history is blank, do nothing
        if(history === undefined) return;
        // If history is zero, reset scene fog
        if(history.events.length == 0) this.resetFog(false);
        // Render all ops starting from pointer
        for(let i = pointer; i < history.events.length; i++){
            for(let j = 0; j < history.events[i].length; j++) {
                this.renderBrush(history.events[i][j], false);
            }
        }
        // Update pointer
        this.pointer = history.events.length;
        this.log(`New pointer: ${this.pointer}`);
        
    }

    // Pixi graphic for round brush
    circleBrush(preview = false) {
        let brush = new PIXI.Graphics();
        brush.beginFill(0x000000);
        brush.drawCircle(0, 0, 50);
        brush.endFill();
        if(preview) {
            brush.lineStyle(1, 0xFF0000);
            brush.visible = true;
        }
        return brush;
    }

    // Pixi graphic for box brush
    boxBrush(preview = false) {
        let brush = new PIXI.Graphics();
        if(preview) {
            brush.visible = false;
            brush.beginFill(0x97bdc4);
            brush.alpha = 0.4;
        }
        else brush.beginFill(0x000000);
        brush.drawRect(0, 0, 100, 100);
        brush.endFill();
        return brush;
    }

    // Pixi graphic for rounded rectangle brush
    roundedRectBrush(preview = false) {
        let brush = new PIXI.Graphics();
        brush.beginFill(0x000000);
        brush.drawRoundedRect(0, 0, 100, 100, 10);
        brush.endFill();
        if(preview) {
            brush.lineStyle(1, 0xFF0000);
            brush.visible = false;
        }
        return brush;
    }

    // Handler for drawing brush type data to mask
    renderBrush(data, save = true) {
        if(data.type == "circle") {
            this.circle.position.x = data.x;
            this.circle.position.y = data.y;
            if (this.circle.curSize != data.size) {
                // change size
            }
            if (this.circle.curAlpha != data.alpha) {
                // change alpha
            }
            this.composite(this.circle)
        }
        if(data.type == "box") {
            this.box.position.x = data.x;
            this.box.position.y = data.y;
            this.box.width = data.width;
            this.box.height = data.height;
            this.composite(this.box);
        }

        if (save) this.historyBuffer.push(data);
    }


    // Resets all fog, if save is true, flush history also
    resetFog(save = true) {
        this.setFill()
        if(save) {
            canvas.scene.unsetFlag('simplefog', 'history');
            canvas.scene.setFlag('simplefog', 'history', { events: [], pointer: 0 });
            this.pointer = 0;
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

    // Push buffered history stack to scene flag and clear buffer
    async commitHistory() {
        if(this.historyBuffer.length == 0) return;
        let history = canvas.scene.getFlag('simplefog', 'history');
        if(!history) history = {
            events: [],
            pointer: 0,
        };
        history.events.push(this.historyBuffer);
        history.events.pointer = history.events.length;
        await canvas.scene.unsetFlag('simplefog', 'history');
        await canvas.scene.setFlag('simplefog','history', history);
        this.log(`Pushed ${this.historyBuffer.length} updates.`);
        this.historyBuffer = [];
    }

    getCanvasSprite() {
        let sprite = new PIXI.Sprite(PIXI.Texture.WHITE);
        const d = canvas.dimensions;
        sprite.width = d.width;
        sprite.height = d.height;
        sprite.x = 0;
        sprite.y = 0;
        return sprite;
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
    setTint(tint) {
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
    async setAlpha(alpha, skip = false) {
        if (skip || !canvas.scene.getFlag('simplefog', 'transition')) this.fog.alpha = alpha;
        else {
            const start = this.fog.alpha;
            const dist = start - alpha;
            const fps = 60;
            const speed = canvas.scene.getFlag('simplefog', 'transitionSpeed');
            const frame = 1000 / fps;
            const rate = dist / (fps * speed / 1000);
            let f = fps * speed / 1000;
            while(f > 0) {
                await new Promise(resolve => setTimeout(resolve, frame));
                this.fog.alpha = this.fog.alpha - rate;
                f--;
            }
            this.fog.alpha = alpha;
        }
    }

    // Fills the fog with a solid color
    setFill() {
        const fill = new PIXI.Graphics();
        fill.beginFill(0xFFFFFF);
        fill.drawRect(0,0, canvas.dimensions.width, canvas.dimensions.height);
        fill.endFill();
        this.composite(fill);
    }

    // Mouse event listener handlers
    pointerMove(event) {
        let p = event.data.getLocalPosition(canvas.app.stage);
        if (this.op == 'brushing') this.renderBrush({
            type: 'circle',
            x: p.x,
            y: p.y,
            size: 0,
            alpha: 0x000000
        });
        else if (this.op == 'boxing') {
            // update preview box
            this.boxPreview.width = p.x - this.dragStart.x;
            this.boxPreview.height = p.y - this.dragStart.y;
        }
    }
    pointerDown(event) {
        // Only react on left mouse button
        if (event.data.button === 0) {
            let p = event.data.getLocalPosition(canvas.app.stage);
            if (ui.controls.controls.find( n => n.name == "simplefog" ).activeTool == "brush") {
                this.op = 'brushing';
                this.pointerMove(event);
            }
            else if (ui.controls.controls.find( n => n.name == "simplefog" ).activeTool == "grid") {

            }
            else if (ui.controls.controls.find( n => n.name == "simplefog" ).activeTool == "box") {
                this.log(`Box brush`);
                this.dragStart.x = p.x;
                this.dragStart.y = p.y;
                this.op = 'boxing';
                this.boxPreview.visible = true;
                this.boxPreview.x = p.x;
                this.boxPreview.y = p.y;
            }
            else if (ui.controls.controls.find( n => n.name == "simplefog" ).activeTool == "circle") {

            }
            else if (ui.controls.controls.find( n => n.name == "simplefog" ).activeTool == "poly") {

            }
        }
    }
    pointerUp(event) {
        console.log(event);
        if (event.data.button == 0) {
            let p = event.data.getLocalPosition(canvas.app.stage);
            if (this.op == 'boxing') {
                this.renderBrush({
                    type: 'box',
                    x: this.dragStart.x,
                    y: this.dragStart.y,
                    width: p.x - this.dragStart.x,
                    height: p.y - this.dragStart.y
                });
                this.boxPreview.visible = false;
                this.boxPreview.width = 0;
                this.boxPreview.height = 0;
            }
            // Reset operation
            this.op = false;
            this.commitHistory();
        }
    }

    activate() {
        super.activate();
        this.interactive = true;
    }
  
    deactivate() {
        super.deactivate();
        this.interactive = false;
    }

    registerMouseListeners() {
        this.removeAllListeners();
        this.on('pointerdown', this.pointerDown);
        this.on('pointerup', this.pointerUp);
        this.on('pointermove', this.pointerMove);
        this.dragging = false;
        this.brushing = false;
    }

    async initCanvasVars() {
        const v = canvas.scene.getFlag('simplefog', 'visible');
        if (v) {
            this.visible = true;
        } else if (v == false) {
            this.visible = false;
        } else {
            this.visible = false;
            canvas.scene.setFlag('simplefog', 'visible', false);
        }

        // Create drawing shapes
        this.circle = this.circleBrush();
        this.box = this.boxBrush();
        this.roundedRect = this.roundedRectBrush();

        this.circlePreview = this.circleBrush(true);
        this.boxPreview = this.boxBrush(true);
        this.roundedRectPreview = this.roundedRectBrush(true);

        // Set the history pointer
        this.pointer = 0;

        // Set default flags if not exist already
        if (!canvas.scene.getFlag('simplefog', 'gmAlpha')) await canvas.scene.setFlag('simplefog', 'gmAlpha', gmAlphaDefault);
        if (!canvas.scene.getFlag('simplefog', 'gmTint')) await canvas.scene.setFlag('simplefog', 'gmTint', gmTintDefault);
        if (!canvas.scene.getFlag('simplefog', 'playerAlpha')) await canvas.scene.setFlag('simplefog', 'playerAlpha', playerAlphaDefault);
        if (!canvas.scene.getFlag('simplefog', 'playerTint')) await canvas.scene.setFlag('simplefog', 'playerTint', playerTintDefault);
        if (canvas.scene.getFlag('simplefog', 'transition') == undefined) await canvas.scene.setFlag('simplefog', 'transition', transitionDefault);
        if (!canvas.scene.getFlag('simplefog', 'transitionSpeed')) await canvas.scene.setFlag('simplefog', 'transitionSpeed', transitionSpeedDefault);

    }

    log(string) {
        console.log(`SimpleFog | ${string}`);
    }
  
    async draw() {
        super.draw();
    }
}
  