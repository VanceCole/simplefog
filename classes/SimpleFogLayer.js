const gmAlphaDefault = 0.6;
const gmTintDefault = '0x000000';
const playerAlphaDefault = 1;
const playerTintDefault = '0x000000';
const transitionDefault = true;
const transitionSpeedDefault = 800;
const previewFill = 0x97bdc4;
const previewAlpha = 0.4;

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

    /**
     * Called on canvas init, creates the canvas layers and various objects and registers listeners
     */
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


        // Register mouse event listerenrs
        this.registerMouseListeners();

        // Render initial history stack
        this.renderStack();
    }

    /**
     * Renders the given shape to the simplefog mask
     * @param data {Object}       A collection of brush parameters
     */
    composite(shape) {
        canvas.app.renderer.render(shape, this.simplefogmask, false, null, false);
    }

    /**
     * Renders the history stack to the mask
     * @param history {Array}       A collection of history events
     * @param pointer {Number}      The position in the history stack to begin rendering from
     */
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

    /**
     * Creates a PIXI graphic using the given brush parameters
     * @param data {Object}       A collection of brush parameters
     *  Example:
     *      shape: "ellipse",
     *      x: 0,
     *      y: 0,
     *      fill: 0x000000,
     *      width: 50,
     *      height: 50,
     *      alpha: 1,
     *      visible: true
     */
    brush(data) {
        let brush = new PIXI.Graphics();
        brush.beginFill(data.fill);
        if(data.shape == "ellipse") brush.drawEllipse(0, 0, data.width, data.height);
        else if(data.shape == "box") brush.drawRect(0, 0, data.width, data.height);
        else if(data.shape == "roundedRect") brush.drawRoundedRect(0, 0, data.width, data.height, 10);
        brush.endFill();
        brush.alpha = data.alpha;
        brush.visible = data.visible;
        brush.x = data.x;
        brush.y = data.y;
        return brush;
    }

    /**
     * Gets a brush using the given parameters, renders it to the mask and saves the event to history
     * @param data {Object}       A collection of brush parameters
     * @param save {Boolean}      If true, will add the operation to the history buffer
     */
    renderBrush(data, save = true) {
        let brush = this.brush(data);
        this.composite(brush)
        if (save) this.historyBuffer.push(data);
    }

    /**
     * Resets the fog of the current scene
     * @param save {Boolean} If true, also resets the simplefog history
     */
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

    /**
     * Sets the alpha for the simplefog layer.
     * @param alpha {Number} 0-1 opacity representation
     * @param skip {Boolean} Optional override to skip using animated transition       
     */
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
            shape: "ellipse",
            x: p.x,
            y: p.y,
            fill: game.user.getFlag('simplefog', 'brushOpacity'),
            width: game.user.getFlag('simplefog', 'brushSize'),
            height: game.user.getFlag('simplefog', 'brushSize'),
            alpha: 1,
            visible: true
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
            else if (ui.controls.controls.find( n => n.name == "simplefog" ).activeTool == "ellipse") {

            }
            else if (ui.controls.controls.find( n => n.name == "simplefog" ).activeTool == "poly") {

            }
        }
    }
    pointerUp(event) {
        if (event.data.button == 0) {
            let p = event.data.getLocalPosition(canvas.app.stage);
            if (this.op == 'boxing') {
                this.renderBrush({
                    shape: 'box',
                    x: this.dragStart.x,
                    y: this.dragStart.y,
                    width: p.x - this.dragStart.x,
                    height: p.y - this.dragStart.y,
                    visible: true,
                    fill: game.user.getFlag('simplefog', 'brushOpacity'),
                    alpha: 1,
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

        // Set the history pointer
        this.pointer = 0;

        // Preview brush objects
        this.boxPreview = this.brush({
            shape: "box",
            x: 0,
            y: 0,
            fill: previewFill,
            width: 100,
            height: 100,
            alpha: previewAlpha,
            visible: true});
        this.ellipsePreview = this.brush({
            shape: "ellipse",
            x: 0,
            y: 0,
            fill: previewFill,
            width: 0,
            height: 0,
            alpha: previewAlpha,
            visible: true});
        this.addChild(this.boxPreview);
        this.addChild(this.ellipsePreview);

        // Set default flags if not exist already
        if (!canvas.scene.getFlag('simplefog', 'gmAlpha')) await canvas.scene.setFlag('simplefog', 'gmAlpha', gmAlphaDefault);
        if (!canvas.scene.getFlag('simplefog', 'gmTint')) await canvas.scene.setFlag('simplefog', 'gmTint', gmTintDefault);
        if (!canvas.scene.getFlag('simplefog', 'playerAlpha')) await canvas.scene.setFlag('simplefog', 'playerAlpha', playerAlphaDefault);
        if (!canvas.scene.getFlag('simplefog', 'playerTint')) await canvas.scene.setFlag('simplefog', 'playerTint', playerTintDefault);
        if (canvas.scene.getFlag('simplefog', 'transition') == undefined) await canvas.scene.setFlag('simplefog', 'transition', transitionDefault);
        if (!canvas.scene.getFlag('simplefog', 'transitionSpeed')) await canvas.scene.setFlag('simplefog', 'transitionSpeed', transitionSpeedDefault);
        if (!game.user.getFlag('simplefog', 'brushOpacity')) await game.user.setFlag('simplefog', 'brushOpacity', 1);
        if (!game.user.getFlag('simplefog', 'brushSize')) await game.user.setFlag('simplefog', 'brushSize', 50);
    }

    log(string) {
        console.log(`SimpleFog | ${string}`);
    }
  
    async draw() {
        super.draw();
    }
}
  