import { Hex, Point, Layout, Orientation } from "../libs/hexagons.js";

const gmAlphaDefault = 0.6;
const gmTintDefault = '0x000000';
const playerAlphaDefault = 1;
const playerTintDefault = '0x000000';
const transitionDefault = true;
const transitionSpeedDefault = 800;
const previewFill = 0x00ffff;
const previewAlpha = 0.4;
const defaultBlurRadius = 0;
const defaultBlurQuality = 2;
const defaultBrushSize = 50;

export class MaskLayer extends PlaceablesLayer {
    constructor(layername) {
        super();
        this.layername = layername;
        this.historyBuffer = [];
        this.pointer = 0;
        this.gridLayout;
        this.dragStart = {
            x: 0,
            y: 0
        };
        window.offx = 0;
        window.offy = 0;
        this.debug = true;
    }
  
    static get layerOptions() {
        return mergeObject(super.layerOptions, {
            canDragCreate: false,
            objectClass: Note,
            sheetClass: NoteConfig
        });
    }

    /* -------------------------------------------- */
    /*  Init                                        */
    /* -------------------------------------------- */

    /**
     * Called on canvas init, creates the canvas layers and various objects and registers listeners
     */
    async canvasInit() {
        await this.initCanvasVars();

        // The layer is the primary sprite to be displayed
        this.layer = this.getCanvasSprite();
        this.setTint(this.getTint());
        this.addChild(this.layer);

        // Filters
        this.blur = new PIXI.filters.BlurFilter();
        //this.blur.autoFit = false;
        this.blur.padding = 0;
        this.blur.repeatEdgePixels = true;
        this.setBlurRadius(this.getBlurRadius());
        this.setBlurQuality(this.getBlurQuality());
        this.filters = [ this.blur ];

        // Create the mask elements
        this.masktexture = PIXI.RenderTexture.create({ width: canvas.dimensions.width, height: canvas.dimensions.height});
        const maskSprite = new PIXI.Sprite(this.masktexture);
        this.layer.mask = maskSprite;
        this.addChild(maskSprite);
        this.setFill();
        this.setAlpha(this.getAlpha(), true);

        // Register event listerenrs
        this.registerMouseListeners();
        this.registerKeyboardListeners();

        // Render initial history stack
        this.renderStack();

        /**
         * React to changes to current scene
         */
        Hooks.on("updateScene", (scene, data, options) => {
            console.log(scene);
            if(scene.data._view) return;
            // React to visibility change
            if (hasProperty(data, `flags.${this.layername}.visible`)) {
                canvas[this.layername].visible = data.flags[this.layername].visible;
            }

            // React to composite history change
            if (hasProperty(data, `flags.${this.layername}.blurRadius`)) {
                canvas[this.layername].setBlurRadius(data.flags[this.layername].blurRadius);
            }
            // React to composite history change
            if (hasProperty(data, `flags.${this.layername}.blurQuality`)) {
                canvas[this.layername].setBlurQuality(data.flags[this.layername].blurQuality);
            }

            // React to composite history change
            if (hasProperty(data, `flags.${this.layername}.history`)) {
                canvas[this.layername].renderStack(data.flags[this.layername].history);
            }

            // React to alpha/tint changes
            if (!game.user.isGM && hasProperty(data, `flags.${this.layername}.playerAlpha`)) {
                canvas[this.layername].setAlpha(data.flags[this.layername].playerAlpha);
                canvas[this.layername].renderStack();
            }
            if (game.user.isGM && hasProperty(data, `flags.${this.layername}.gmAlpha`)) {
                canvas[this.layername].setAlpha(data.flags[this.layername].gmAlpha);
                canvas[this.layername].renderStack();
            }
            if (!game.user.isGM && hasProperty(data, `flags.${this.layername}.playerTint`)) canvas[this.layername].setTint(data.flags[this.layername].playerTint);
            if (game.user.isGM && hasProperty(data, `flags.${this.layername}.gmTint`)) canvas[this.layername].setTint(data.flags[this.layername].gmTint);
        });

    }

    /**
     * Set up vars and initialize default values if needed
     */
    async initCanvasVars() {
        // Check if masklayer is flagged visible
        const v = canvas.scene.getFlag(this.layername, 'visible');
        if (v) {
            this.visible = true;
        } else if (v == false) {
            this.visible = false;
        } else {
            this.visible = false;
            canvas.scene.setFlag(this.layername, 'visible', false);
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
            visible: false
        });
        this.ellipsePreview = this.brush({
            shape: "ellipse",
            x: 0,
            y: 0,
            fill: previewFill,
            width: 100,
            height: 100,
            alpha: previewAlpha,
            visible: false
        });
        this.addChild(this.boxPreview);
        this.addChild(this.ellipsePreview);

        // Set default flags if they dont exist already
        if (!canvas.scene.getFlag(this.layername, 'gmAlpha')) await canvas.scene.setFlag(this.layername, 'gmAlpha', gmAlphaDefault);
        if (!canvas.scene.getFlag(this.layername, 'gmTint')) await canvas.scene.setFlag(this.layername, 'gmTint', gmTintDefault);
        if (!canvas.scene.getFlag(this.layername, 'playerAlpha')) await canvas.scene.setFlag(this.layername, 'playerAlpha', playerAlphaDefault);
        if (!canvas.scene.getFlag(this.layername, 'playerTint')) await canvas.scene.setFlag(this.layername, 'playerTint', playerTintDefault);
        if (canvas.scene.getFlag(this.layername, 'transition') == undefined) await canvas.scene.setFlag(this.layername, 'transition', transitionDefault);
        if (!canvas.scene.getFlag(this.layername, 'transitionSpeed')) await canvas.scene.setFlag(this.layername, 'transitionSpeed', transitionSpeedDefault);
        if (!game.user.getFlag(this.layername, 'brushOpacity')) await game.user.setFlag(this.layername, 'brushOpacity', 0x000000);
        if (!game.user.getFlag(this.layername, 'brushSize')) await game.user.setFlag(this.layername, 'brushSize', defaultBrushSize);
        if (!game.user.getFlag(this.layername, 'blurRadius')) await game.user.setFlag(this.layername, 'blurRadius', defaultBlurRadius);
        if (!game.user.getFlag(this.layername, 'blurQuality')) await game.user.setFlag(this.layername, 'blurQuality', defaultBlurQuality);
    }

    /* -------------------------------------------- */
    /*  History & Buffer                            */
    /* -------------------------------------------- */

    /**
     * Renders the given shape to the layer mask
     * @param data {Object}       A collection of brush parameters
     */
    composite(shape) {
        canvas.app.renderer.render(shape, this.masktexture, false, null, false);
    }

    /**
     * Renders the history stack to the mask
     * @param history {Array}       A collection of history events
     * @param start {Number}        The position in the history stack to begin rendering from
     * @param start {Number}        The position in the history stack to stop rendering
     */
    renderStack(history = canvas.scene.getFlag(this.layername, 'history'), start = this.pointer, stop = null) {
        // If history is blank, do nothing
        if(history === undefined) return;
        // If history is zero, reset scene fog
        if(history.events.length == 0) this.resetFog(false);
        if(stop === null) stop = history.pointer;
        if(stop <= this.pointer) {
            this.resetFog(false);
            start = 0;
        }
        console.log(`Rendering from: ${start} to ${stop}`);
        // Render all ops starting from pointer

        for(let i = start; i < stop; i++){
            for(let j = 0; j < history.events[i].length; j++) {
                this.renderBrush(history.events[i][j], false);
            }
        }
        // Update pointer
        this.pointer = stop;
        
    }
    
    /**
     * Add buffered history stack to scene flag and clear buffer
     */
    async commitHistory() {
        if(this.historyBuffer.length == 0) return;
        let history = canvas.scene.getFlag(this.layername, 'history');
        if(!history) history = {
            events: [],
            pointer: 0,
        };
        history.events = history.events.slice(0, history.pointer);
        history.events.push(this.historyBuffer);
        history.pointer = history.events.length;
        await canvas.scene.unsetFlag(this.layername, 'history');
        await canvas.scene.setFlag(this.layername,'history', history);
        console.log(`Pushed ${this.historyBuffer.length} updates.`);
        this.historyBuffer = [];
    }

    /**
     * Resets the fog of the current scene
     * @param save {Boolean} If true, also resets the layer history
     */
    resetFog(save = true) {
        this.setFill()
        if(save) {
            canvas.scene.unsetFlag(this.layername, 'history');
            canvas.scene.setFlag(this.layername, 'history', { events: [], pointer: 0 });
            this.pointer = 0;
        }
    }

    /**
     * Steps the history buffer back X steps and redraws
     * @param steps {Integer} Number of steps to undo, default 1
     */
    async undo(steps = 1) {
        if (this.debug) console.log(`Undoing ${steps} steps.`);
        this.pointer = this.pointer - steps;
        let history = canvas.scene.getFlag(this.layername, 'history');
        history.pointer = this.pointer;
        await canvas.scene.unsetFlag(this.layername, 'history');
        await canvas.scene.setFlag(this.layername, 'history', history);
    }


    /* -------------------------------------------- */
    /*  Shapes, sprites and PIXI objs               */
    /* -------------------------------------------- */

    /**
     * Creates a PIXI graphic using the given brush parameters
     * @param data {Object}       A collection of brush parameters
     * 
     * @example
     * const myBrush = this.brush({
     *      shape: "ellipse",
     *      x: 0,
     *      y: 0,
     *      fill: 0x000000,
     *      width: 50,
     *      height: 50,
     *      alpha: 1,
     *      visible: true
     * });
     */
    brush(data) {
        let brush = new PIXI.Graphics();
        brush.beginFill(data.fill);
        if(data.shape == "ellipse") brush.drawEllipse(0, 0, data.width, data.height);
        else if(data.shape == "box") brush.drawRect(0, 0, data.width, data.height);
        else if(data.shape == "roundedRect") brush.drawRoundedRect(0, 0, data.width, data.height, 10);
        else if(data.shape == "polygon") brush.drawPolygon(data.vertices);
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
     * Returns a blank PIXI Sprite of canvas dimensions
     */
    getCanvasSprite() {
        let sprite = new PIXI.Sprite(PIXI.Texture.WHITE);
        const d = canvas.dimensions;
        sprite.width = d.width;
        sprite.height = d.height;
        sprite.x = 0;
        sprite.y = 0;
        return sprite;
    }

    /* -------------------------------------------- */
    /*  Getters and setters for layer props         */
    /* -------------------------------------------- */

    /**
     * Returns the current scene tint applicable to the current user
     */
    getTint() {
        let tint;
        if (game.user.isGM) tint = canvas.scene.getFlag(this.layername, 'gmTint');
        else tint = canvas.scene.getFlag(this.layername, 'playerTint');
        if (!tint) {
            if (game.user.isGM) tint = this.gmTintDefault;
            else tint = this.playerTintDefault;
        }
        return tint;
    }

    /**
     * Sets the scene's tint value for the primary layer
     */
    setTint(tint) {
        this.layer.tint = tint;
    }

    getBlurRadius() {
        let blur;
        blur = canvas.scene.getFlag(this.layername, 'blurRadius');
        if (!blur) blur = defaultBlurRadius; 
        return blur;
    }
    
    setBlurRadius(r) {
        this.blur.blur = r;
    }

    getBlurQuality() {
        let qual;
        qual = canvas.scene.getFlag(this.layername, 'blurQuality');
        if (!qual) qual = defaultBlurQuality; 
        return qual;
    }
    
    setBlurQuality(q) {
        this.blur.quality = q;
    }

    /**
     * Returns the current scene alpha applicable to the current user
     */
    getAlpha() {
        let alpha;
        if (game.user.isGM) alpha = canvas.scene.getFlag(this.layername, 'gmAlpha');
        else alpha = canvas.scene.getFlag(this.layername, 'playerAlpha');
        if (!alpha) {
            if (game.user.isGM) alpha = this.gmAlphaDefault;
            else alpha = this.playerAlphaDefault;
        }
        return alpha;
    }

    /**
     * Sets the scene's alpha for the primary layer.
     * @param alpha {Number} 0-1 opacity representation
     * @param skip {Boolean} Optional override to skip using animated transition       
     */
    async setAlpha(alpha, skip = false) {
        if (skip || !canvas.scene.getFlag(this.layername, 'transition')) this.layer.alpha = alpha;
        else {
            const start = this.layer.alpha;
            const dist = start - alpha;
            const fps = 60;
            const speed = canvas.scene.getFlag(this.layername, 'transitionSpeed');
            const frame = 1000 / fps;
            const rate = dist / (fps * speed / 1000);
            let f = fps * speed / 1000;
            while(f > 0) {
                await new Promise(resolve => setTimeout(resolve, frame));
                this.layer.alpha = this.layer.alpha - rate;
                f--;
            }
            this.layer.alpha = alpha;
        }
    }

    /**
     * Converts an object containing coordinate pair arrays into a single array of points for PIXI
     * @param hex {Object}  An object containing a set of [x,y] pairs
     */
    hexObjsToArr(hex) {
        let a = [];
        hex.forEach(point => {
            a.push(point.x);
            a.push(point.y);
        });
        // Append first point to end of array to complete the shape
        a.push(hex[0].x);
        a.push(hex[0].y);
        return a;
    }

    /**
     * Fills the mask layer with solid white
     */
    setFill() {
        const fill = new PIXI.Graphics();
        fill.beginFill(0xFFFFFF);
        fill.drawRect(0,0, canvas.dimensions.width, canvas.dimensions.height);
        fill.endFill();
        this.composite(fill);
    }

    /**
     * Toggles visibility of primary layer
     */
    toggle() {
        if (canvas.scene.getFlag(this.layername,'visible')) {
            canvas[this.layername].visible = false;
            canvas.scene.setFlag(this.layername,'visible', false)
        } else {
            canvas[this.layername].visible = true;
            canvas.scene.setFlag(this.layername,'visible', true)
        }
    }

    /* -------------------------------------------- */
    /*  Event Listeners and Handlers                */
    /* -------------------------------------------- */

    /**
     * Adds the mouse listeners to the layer
     */
    registerMouseListeners() {
        this.removeAllListeners();
        this.on('pointerdown', this.pointerDown);
        this.on('pointerup', this.pointerUp);
        this.on('pointermove', this.pointerMove);
        this.dragging = false;
        this.brushing = false;
    }

    /**
     * Adds the keyboard listeners to the layer
     */
    registerKeyboardListeners() {
        $(document).keydown(function(e) {
            if (ui.controls.activeControl !== this.layername) return;
            if (e.which === 90 && e.ctrlKey) {
                canvas[this.layername].undo();
            }
        });
    }

    /**
     * Mouse handlers for canvas layer interactions
     */
    pointerMove(event) {
        let p = event.data.getLocalPosition(canvas.app.stage);
        // Brush tool
        if (this.op == 'brushing') {
            // Send brush movement events to renderbrush to be drawn and added to history stack
            this.renderBrush({
                shape: "ellipse",
                x: p.x,
                y: p.y,
                fill: game.user.getFlag(this.layername, 'brushOpacity'),
                width: game.user.getFlag(this.layername, 'brushSize'),
                height: game.user.getFlag(this.layername, 'brushSize'),
                alpha: 1,
                visible: true
            });
        }
        // Drag box tool
        else if (this.op == 'box') {
            // Just update the preview shape
            this.boxPreview.width = p.x - this.dragStart.x;
            this.boxPreview.height = p.y - this.dragStart.y;
        }
        // Drag ellipse tool
        else if (this.op == 'ellipse') {
            // Just update the preview shape
            this.ellipsePreview.width = (p.x - this.dragStart.x)*2;
            this.ellipsePreview.height = (p.y - this.dragStart.y)*2;
        }
        else if (this.op == 'grid') {
            const grid = canvas.scene.data.grid;
            // Square grid
            if (canvas.scene.data.gridType == 1) {
                const gridx = Math.floor(p.x / grid);
                const gridy = Math.floor(p.y / grid);
                const x = gridx * grid;
                const y = gridy * grid;
                // Check if this grid was already drawn
                if(!this.gridMatrix[gridx][gridy]) {
                    this.gridMatrix[gridx][gridy] = 1;
                    this.boxPreview.x = x;
                    this.boxPreview.y = y;
                    this.renderBrush({
                        shape: 'box',
                        x: x,
                        y: y,
                        width: grid,
                        height: grid,
                        visible: true,
                        fill: game.user.getFlag(this.layername, 'brushOpacity'),
                        alpha: 1,
                    });
                }
            }

            // Hexagonal grids
            else if ([2,3,4,5].includes(canvas.scene.data.gridType)) {
                let qr = this.gridLayout.pixelToHex(p);
                const gridq = Math.ceil(qr.q - 0.5);
                const gridr = Math.ceil(qr.r - 0.5);
                // Check if this grid was already drawn
                if(!this.doesArrayOfArraysContainArray(this.gridMatrix, [gridq, gridr])) {
                    const vertices = this.gridLayout.polygonCorners({q: gridq, r: gridr});
                    const arr = this.hexObjsToArr(vertices);
                    this.renderBrush({
                        shape: 'polygon',
                        vertices: arr,
                        x: 0,
                        y: 0,
                        visible: true,
                        fill: game.user.getFlag(this.layername, 'brushOpacity'),
                        alpha: 1,
                    });
                    this.gridMatrix.push([gridr, gridq]);
                }
            }
        }
    }

    pointerDown(event) {
        // Only react on left mouse button
        if (event.data.button === 0) {
            let p = event.data.getLocalPosition(canvas.app.stage);

            // Brush tool
            if (ui.controls.controls.find( n => n.name == this.layername ).activeTool == "brush") {
                this.op = 'brushing';
                this.pointerMove(event);
            }
            // Grid tool
            else if (ui.controls.controls.find( n => n.name == this.layername ).activeTool == "grid") {
                this.op = 'grid';
                const grid = canvas.scene.data.grid;
                const width = canvas.dimensions.width;
                const height = canvas.dimensions.height;
                this.boxPreview.visible = true;
                this.boxPreview.width = grid;
                this.boxPreview.height = grid;
                if(canvas.scene.data.gridType == 1) {
                    this.gridMatrix = new Array(Math.ceil(width / grid)).fill(0).map(() => new Array(Math.ceil(height / grid)).fill(0));
                }
                else if(canvas.scene.data.gridType == 2) {
                    this.gridMatrix = [];
                    this.gridLayout = new Layout(Layout.pointy, {x:grid/2, y:grid/2}, {x: 0, y: grid / 2});
                }
                else if(canvas.scene.data.gridType == 3) {
                    this.gridMatrix = [];
                    this.gridLayout = new Layout(Layout.pointy, {x:grid/2, y:grid/2}, {x: Math.sqrt(3) * grid / 4, y: grid / 2});
                }
                else if(canvas.scene.data.gridType == 4) {
                    this.gridMatrix = [];
                    this.gridLayout = new Layout(Layout.flat, {x:grid/2, y:grid/2}, {x: grid / 2, y: 0});
                }
                else if(canvas.scene.data.gridType == 5) {
                    this.gridMatrix = [];
                    this.gridLayout = new Layout(Layout.flat, {x:grid/2, y:grid/2}, {x: grid / 2, y: Math.sqrt(3) * grid / 4});
                }
            }
            // Drag box tool
            else if (ui.controls.controls.find( n => n.name == this.layername ).activeTool == "box") {
                this.op = 'box';
                this.dragStart.x = p.x;
                this.dragStart.y = p.y;
                this.boxPreview.visible = true;
                this.boxPreview.x = p.x;
                this.boxPreview.y = p.y;
            }
            // Drag ellipse tool
            else if (ui.controls.controls.find( n => n.name == this.layername ).activeTool == "ellipse") {
                this.op = 'ellipse';
                this.dragStart.x = p.x;
                this.dragStart.y = p.y;
                this.ellipsePreview.visible = true;
                this.ellipsePreview.x = p.x;
                this.ellipsePreview.y = p.y;

            }
            // Poly shape tool
            else if (ui.controls.controls.find( n => n.name == this.layername ).activeTool == "poly") {

            }
        }
    }

    pointerUp(event) {
        // Only react to left mouse button
        if (event.data.button == 0) {
            let p = event.data.getLocalPosition(canvas.app.stage);
            
            // Drag box tool
            if (this.op == 'box') {
                this.renderBrush({
                    shape: 'box',
                    x: this.dragStart.x,
                    y: this.dragStart.y,
                    width: p.x - this.dragStart.x,
                    height: p.y - this.dragStart.y,
                    visible: true,
                    fill: game.user.getFlag(this.layername, 'brushOpacity'),
                    alpha: 1,
                });
                this.boxPreview.visible = false;
                this.boxPreview.width = 0;
                this.boxPreview.height = 0;
            }

            // Drag ellipse tool
            else if (this.op == 'ellipse') {
                this.renderBrush({
                    shape: 'ellipse',
                    x: this.dragStart.x,
                    y: this.dragStart.y,
                    width: Math.abs(p.x - this.dragStart.x),
                    height: Math.abs(p.y - this.dragStart.y),
                    visible: true,
                    fill: game.user.getFlag(this.layername, 'brushOpacity'),
                    alpha: 1,
                });
                this.ellipsePreview.visible = false;
                this.ellipsePreview.width = 0;
                this.ellipsePreview.height = 0;
            }

            // Grid tool
            if (this.op == 'grid') {
                this.boxPreview.visible = false;
                this.boxPreview.width = 0;
                this.boxPreview.height = 0;
            }
            // Reset operation
            this.op = false;

            // Push the history buffer
            this.commitHistory();
        }
    }

    /**
     * Checks if an array of arrays contains an equivalent to the given array
     * @param arrayOfArrays {Array} Haystack
     * @param array {Array}         Needle       
     */
    doesArrayOfArraysContainArray(arrayOfArrays, array){
        var aOA = arrayOfArrays.map(function(arr) {
            return arr.slice();
        });
        var a = array.slice(0);
        for(let i=0; i<aOA.length; i++){
            if(aOA[i].sort().join(',') === a.sort().join(',')){
            return true;
            }
        }
        return false;
    }

    /**
     * Actions upon layer becoming active
     */
    activate() {
        super.activate();
        this.interactive = true;
    }
  
    /**
     * Actions upon layer becoming inactive
     */
    deactivate() {
        super.deactivate();
        this.interactive = false;
    }
  
    async draw() {
        super.draw();
    }
}
  