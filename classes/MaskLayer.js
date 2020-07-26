/* MaskLayer extends CanvasLayer
 *
 * Creates an interactive layer which has an alpha channel mask
 * Includes various tools for manipulating the mask, called brushes
 * and history for syncing between players and replaying the mask
 */

import { Layout } from '../libs/hexagons.js';

// Todo: most of these should be config vars
const gmAlphaDefault = 0.6;
const gmTintDefault = '0x000000';
const playerAlphaDefault = 1;
const playerTintDefault = '0x000000';
const transitionDefault = true;
const transitionSpeedDefault = 800;
const previewFill = 0x00ffff;
const HANDLEFILL = 0xff6400;
const HANDLESIZE = 20;
const previewAlpha = 0.4;
const defaultBlurRadius = 0;
const defaultBlurQuality = 2;
const defaultBrushSize = 50;

// eslint-disable-next-line import/prefer-default-export
export class MaskLayer extends CanvasLayer {
  constructor(layername) {
    super();
    this.layername = layername;
    this.historyBuffer = [];
    this.pointer = 0;
    this.gridLayout = {};
    this.dragStart = { x: 0, y: 0 };
    this.debug = true;

    // Register event listerenrs
    this.registerMouseListeners();
    this.registerKeyboardListeners();

    // React to canvas zoom
    Hooks.on('canvasPan', (canvas, dimensions) => {
    // Scale blur filter radius to account for zooming
      this.blur.blur = this.getBlurRadius() * dimensions.scale;
    });

    // React to changes to current scene
    Hooks.on('updateScene', (scene, data) => {
    // Check if update applies to current viewed scene
      if (!scene._view) return;
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
      }
      if (game.user.isGM && hasProperty(data, `flags.${this.layername}.gmAlpha`)) {
        canvas[this.layername].setAlpha(data.flags[this.layername].gmAlpha);
      }
      if (!game.user.isGM && hasProperty(data, `flags.${this.layername}.playerTint`)) canvas[this.layername].setTint(data.flags[this.layername].playerTint);
      if (game.user.isGM && hasProperty(data, `flags.${this.layername}.gmTint`)) canvas[this.layername].setTint(data.flags[this.layername].gmTint);
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
    this.addChild(this.layer);
    this.setTint(this.getTint());

    // Filters
    this.blur = new PIXI.filters.BlurFilter();
    // this.blur.autoFit = false;
    this.blur.padding = 0;
    this.blur.repeatEdgePixels = true;
    this.setBlurRadius(this.getBlurRadius());
    this.setBlurQuality(this.getBlurQuality());
    this.filters = [this.blur];

    // Create the mask elements
    this.masktexture = PIXI.RenderTexture.create(
      { width: canvas.dimensions.width, height: canvas.dimensions.height },
    );
    this.layer.mask = new PIXI.Sprite(this.masktexture);
    this.addChild(this.layer.mask);
    this.setFill();
    this.setAlpha(this.getAlpha(), true);

    // Render initial history stack
    this.renderStack();
  }

  /**
   * Set up vars and initialize default values if needed
   */
  async initCanvasVars() {
  // Check if masklayer is flagged visible
    if (canvas.scene.getFlag(this.layername, 'visible')) this.visible = true;
    else {
      this.visible = false;
      canvas.scene.setFlag(this.layername, 'visible', false);
    }

    // Allow zIndex prop to function for items on this layer
    this.sortableChildren = true;

    // Set the history pointer
    this.pointer = 0;

    // Preview brush objects
    this.boxPreview = this.brush({
      shape: 'box',
      x: 0,
      y: 0,
      fill: previewFill,
      width: 100,
      height: 100,
      alpha: previewAlpha,
      visible: false,
      zIndex: 10,
    });
    this.ellipsePreview = this.brush({
      shape: 'ellipse',
      x: 0,
      y: 0,
      fill: previewFill,
      width: 100,
      height: 100,
      alpha: previewAlpha,
      visible: false,
      zIndex: 10,
    });
    this.shapePreview = this.brush({
      shape: 'shape',
      x: 0,
      y: 0,
      vertices: [],
      fill: previewFill,
      alpha: previewAlpha,
      visible: false,
      zIndex: 10,
    });
    this.shapeHandle = this.brush({
      shape: 'box',
      x: 0,
      y: 0,
      fill: HANDLEFILL,
      width: HANDLESIZE * 2,
      height: HANDLESIZE * 2,
      alpha: previewAlpha,
      visible: false,
      zIndex: 15,
    });
    // Add preview brushes to layer
    this.addChild(this.boxPreview);
    this.addChild(this.ellipsePreview);
    this.addChild(this.shapePreview);
    this.addChild(this.shapeHandle);

    // Set default flags if they dont exist already
    if (!canvas.scene.getFlag(this.layername, 'gmAlpha')) await canvas.scene.setFlag(this.layername, 'gmAlpha', gmAlphaDefault);
    if (!canvas.scene.getFlag(this.layername, 'gmTint')) await canvas.scene.setFlag(this.layername, 'gmTint', gmTintDefault);
    if (!canvas.scene.getFlag(this.layername, 'playerAlpha')) await canvas.scene.setFlag(this.layername, 'playerAlpha', playerAlphaDefault);
    if (!canvas.scene.getFlag(this.layername, 'playerTint')) await canvas.scene.setFlag(this.layername, 'playerTint', playerTintDefault);
    if (canvas.scene.getFlag(this.layername, 'transition') === undefined) await canvas.scene.setFlag(this.layername, 'transition', transitionDefault);
    if (!canvas.scene.getFlag(this.layername, 'transitionSpeed')) await canvas.scene.setFlag(this.layername, 'transitionSpeed', transitionSpeedDefault);
    if (!game.user.getFlag(this.layername, 'brushOpacity')) await game.user.setFlag(this.layername, 'brushOpacity', 0x000000);
    if (!game.user.getFlag(this.layername, 'brushSize')) await game.user.setFlag(this.layername, 'brushSize', defaultBrushSize);
    if (!canvas.scene.getFlag(this.layername, 'blurRadius')) await canvas.scene.setFlag(this.layername, 'blurRadius', defaultBlurRadius);
    if (!canvas.scene.getFlag(this.layername, 'blurQuality')) await canvas.scene.setFlag(this.layername, 'blurQuality', defaultBlurQuality);
  }

  /* -------------------------------------------- */
  /*  History & Buffer                            */
  /* -------------------------------------------- */

  /**
   * Renders the history stack to the mask
   * @param history {Array}       A collection of history events
   * @param start {Number}        The position in the history stack to begin rendering from
   * @param start {Number}        The position in the history stack to stop rendering
   */
  renderStack(
    history = canvas.scene.getFlag(this.layername, 'history'),
    start = this.pointer,
    stop = canvas.scene.getFlag(this.layername, 'history.pointer'),
  ) {
  // If history is blank, do nothing
    if (history === undefined) return;
    // If history is zero, reset scene fog
    if (history.events.length === 0) this.resetFog(false);
    if (stop <= this.pointer) {
      this.resetFog(false);
      start = 0;
    }

    if (this.debug) console.log(`Rendering from: ${start} to ${stop}`);
    // Render all ops starting from pointer
    for (let i = start; i < stop; i += 1) {
      for (let j = 0; j < history.events[i].length; j += 1) {
        this.renderBrush(history.events[i][j], false);
      }
    }
    // Update local pointer
    this.pointer = stop;
    // Update sight layer
    canvas.sight.update();
  }

  /**
   * Add buffered history stack to scene flag and clear buffer
   */
  async commitHistory() {
  // Do nothing if no history to be committed, otherwise get history
    if (this.historyBuffer.length === 0) return;
    let history = canvas.scene.getFlag(this.layername, 'history');
    // If history storage doesnt exist, create it
    if (!history) {
      history = {
        events: [],
        pointer: 0,
      };
    }
    // If pointer is less than history length (f.x. user undo), truncate history
    history.events = history.events.slice(0, history.pointer);
    // Push the new history buffer to the scene
    history.events.push(this.historyBuffer);
    history.pointer = history.events.length;
    await canvas.scene.unsetFlag(this.layername, 'history');
    await canvas.scene.setFlag(this.layername, 'history', history);
    if (this.debug) console.log(`Pushed ${this.historyBuffer.length} updates.`);
    // Clear the history buffer
    this.historyBuffer = [];
  }

  /**
   * Resets the fog of the current scene
   * @param save {Boolean} If true, also resets the layer history
   */
  resetFog(save = true) {
  // Fill fog layer with solid
    this.setFill();
    // If save, also unset history and reset pointer
    if (save) {
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
    // Grab existing history
    // Todo: this could probably just grab and set the pointer for a slight performance improvement
    let history = canvas.scene.getFlag(this.layername, 'history');
    if (!history) {
      history = {
        events: [],
        pointer: 0,
      };
    }
    let newpointer = this.pointer - steps;
    if (newpointer < 0) newpointer = 0;
    // Set new pointer & update history
    history.pointer = newpointer;
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
  // Get new graphic & begin filling
    const brush = new PIXI.Graphics();
    brush.beginFill(data.fill);
    // Draw the shape depending on type of brush
    switch (data.shape) {
      case 'ellipse':
        brush.drawEllipse(0, 0, data.width, data.height);
        break;
      case 'box':
        brush.drawRect(0, 0, data.width, data.height);
        break;
      case 'roundedRect':
        brush.drawRoundedRect(0, 0, data.width, data.height, 10);
        break;
      case 'polygon':
        brush.drawPolygon(data.vertices);
        break;
      case 'shape':
        brush.drawPolygon(data.vertices);
        break;
      default:
        break;
    }
    // End fill and set the basic props
    brush.endFill();
    brush.alpha = data.alpha;
    brush.visible = data.visible;
    brush.x = data.x;
    brush.y = data.y;
    brush.zIndex = data.zIndex;
    return brush;
  }

  /**
   * Gets a brush using the given parameters, renders it to mask and saves the event to history
   * @param data {Object}       A collection of brush parameters
   * @param save {Boolean}      If true, will add the operation to the history buffer
   */
  renderBrush(data, save = true) {
    const brush = this.brush(data);
    this.composite(brush);
    if (save) this.historyBuffer.push(data);
  }

  /**
   * Renders the given shape to the layer mask
   * @param data {Object}       A collection of brush parameters
   */
  composite(shape) {
    canvas.app.renderer.render(shape, this.masktexture, false, null, false);
  }

  /**
   * Returns a blank PIXI Sprite of canvas dimensions
   */
  getCanvasSprite() {
    const sprite = new PIXI.Sprite(PIXI.Texture.WHITE);
    const d = canvas.dimensions;
    sprite.width = d.width;
    sprite.height = d.height;
    sprite.x = 0;
    sprite.y = 0;
    sprite.zIndex = 0;
    return sprite;
  }

  /* -------------------------------------------- */
  /*  Getters and setters for layer props         */
  /* -------------------------------------------- */

  /**
   * Gets and sets various layer wide properties
   * Some properties have different values depending on if user is a GM or player
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
  // If skip is false, do not transition and just set alpha immediately
    if (skip || !canvas.scene.getFlag(this.layername, 'transition')) this.layer.alpha = alpha;
    // Loop until transition is complete
    else {
      const start = this.layer.alpha;
      const dist = start - alpha;
      const fps = 60;
      const speed = canvas.scene.getFlag(this.layername, 'transitionSpeed');
      const frame = 1000 / fps;
      const rate = dist / (fps * speed / 1000);
      let f = fps * speed / 1000;
      while (f > 0) {
        // Delay 1 frame before updating again
        // eslint-disable-next-line no-await-in-loop
        await new Promise((resolve) => setTimeout(resolve, frame));
        this.layer.alpha -= rate;
        f -= 1;
      }
      // Reset target alpha in case loop overshot a bit
      this.layer.alpha = alpha;
    }
  }

  /**
   * Converts an object containing coordinate pair arrays into a single array of points for PIXI
   * @param hex {Object}  An object containing a set of [x,y] pairs
   */
  hexObjsToArr(hex) {
    const a = [];
    hex.forEach((point) => {
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
    fill.drawRect(0, 0, canvas.dimensions.width, canvas.dimensions.height);
    fill.endFill();
    this.composite(fill);
  }

  /**
   * Toggles visibility of primary layer
   */
  toggle() {
    if (canvas.scene.getFlag(this.layername, 'visible')) {
      canvas[this.layername].visible = false;
      canvas.scene.setFlag(this.layername, 'visible', false);
    } else {
      canvas[this.layername].visible = true;
      canvas.scene.setFlag(this.layername, 'visible', true);
    }
  }

  /* -------------------------------------------- */
  /*  Event Listeners and Handlers                */
  /* -------------------------------------------- */

  /**
   * Adds the mouse listeners to the layer
   */
  registerMouseListeners() {
    this.addListener('pointerdown', this.pointerDown);
    this.addListener('pointerup', this.pointerUp);
    this.addListener('pointermove', this.pointerMove);
    this.dragging = false;
    this.brushing = false;
  }

  /**
   * Adds the keyboard listeners to the layer
   */
  registerKeyboardListeners() {
    $(document).keydown((event) => {
      if (ui.controls.activeControl !== this.layername) return;
      if (event.which === 90 && event.ctrlKey) {
        canvas[this.layername].undo();
      }
    });
  }

  /**
   * Mouse handlers for canvas layer interactions
   */
  pointerMove(event) {
  // Get mouse position translated to canvas coords
    const p = event.data.getLocalPosition(canvas.app.stage);
    // Brush tool
    switch (this.op) {
      case 'brushing':
        // Send brush movement events to renderbrush to be drawn and added to history stack
        this.renderBrush({
          shape: 'ellipse',
          x: p.x,
          y: p.y,
          fill: game.user.getFlag(this.layername, 'brushOpacity'),
          width: game.user.getFlag(this.layername, 'brushSize'),
          height: game.user.getFlag(this.layername, 'brushSize'),
          alpha: 1,
          visible: true,
        });
        break;
        // Drag box tool
      case 'box':
        // Just update the preview shape
        this.boxPreview.width = p.x - this.dragStart.x;
        this.boxPreview.height = p.y - this.dragStart.y;
        break;
        // Drag ellipse tool
      case 'ellipse':
        // Just update the preview shape
        this.ellipsePreview.width = (p.x - this.dragStart.x) * 2;
        this.ellipsePreview.height = (p.y - this.dragStart.y) * 2;
        break;
      case 'grid':
        // eslint-disable-next-line no-case-declarations
        const { grid } = canvas.scene.data;
        // Square grid
        if (canvas.scene.data.gridType === 1) {
          const gridx = Math.floor(p.x / grid);
          const gridy = Math.floor(p.y / grid);
          const x = gridx * grid;
          const y = gridy * grid;
          // Check if this grid was already drawn
          if (!this.dupes[gridx][gridy]) {
            // Flag cell as drawn in dupes
            this.dupes[gridx][gridy] = 1;
            this.boxPreview.x = x;
            this.boxPreview.y = y;
            this.renderBrush({
              shape: 'box',
              x,
              y,
              width: grid,
              height: grid,
              visible: true,
              fill: game.user.getFlag(this.layername, 'brushOpacity'),
              alpha: 1,
            });
          }
          // Hex Grid
        } else if ([2, 3, 4, 5].includes(canvas.scene.data.gridType)) {
          // Convert pixel coord to hex coord
          const qr = this.gridLayout.pixelToHex(p);
          const gridq = Math.ceil(qr.q - 0.5);
          const gridr = Math.ceil(qr.r - 0.5);
          // Check if this grid cell was already drawn
          if (!this.doesArrayOfArraysContainArray(this.dupes, [gridq, gridr])) {
            // Get the vert coords for the hex
            const vertices = this.gridLayout.polygonCorners({ q: gridq, r: gridr });
            // Convert to array of individual verts
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
            // Flag cell as drawn in dupes
            this.dupes.push([gridr, gridq]);
          }
        }
        break;
      case 'shape':
        break;
      default:
        break;
    }
  }

  pointerDown(event) {
    // Only react on left mouse button
    if (event.data.button === 0) {
      const p = event.data.getLocalPosition(canvas.app.stage);
      // Check active tool
      switch (ui.controls.controls.find((n) => n.name === this.layername).activeTool) {
      // Activate brush op
        case 'brush':
          this.op = 'brushing';
          break;
        // Activate grid op
        case 'grid':
          this.op = 'grid';
          // Get grid type & dimensions
          const { grid } = canvas.scene.data;
          const { width } = canvas.dimensions;
          const { height } = canvas.dimensions;
          // Reveal the preview shape
          this.boxPreview.visible = true;
          this.boxPreview.width = grid;
          this.boxPreview.height = grid;
          // Check grid type, create a dupe detection matrix & if hex grid init a layout
          switch (canvas.scene.data.gridType) {
          // Square grid
            case 1:
              this.dupes = new Array(Math.ceil(width / grid)).fill(0).map(() => new Array(Math.ceil(height / grid)).fill(0));
              break;
            // Pointy Hex Odd
            case 2:
              this.dupes = [];
              this.gridLayout = new Layout(Layout.pointy, { x: grid / 2, y: grid / 2 }, { x: 0, y: grid / 2 });
              break;
            // Pointy Hex Even
            case 3:
              this.dupes = [];
              this.gridLayout = new Layout(Layout.pointy, { x: grid / 2, y: grid / 2 }, { x: Math.sqrt(3) * grid / 4, y: grid / 2 });
              break;
            // Flat Hex Odd
            case 4:
              this.dupes = [];
              this.gridLayout = new Layout(Layout.flat, { x: grid / 2, y: grid / 2 }, { x: grid / 2, y: 0 });
              break;
            // Flat Hex Even
            case 5:
              this.dupes = [];
              this.gridLayout = new Layout(Layout.flat, { x: grid / 2, y: grid / 2 }, { x: grid / 2, y: Math.sqrt(3) * grid / 4 });
              break;
            default:
              break;
          }
          break;
          // Activate box op, set dragstart & make preview shape visible
        case 'box':
          this.op = 'box';
          this.dragStart.x = p.x;
          this.dragStart.y = p.y;
          this.boxPreview.visible = true;
          this.boxPreview.x = p.x;
          this.boxPreview.y = p.y;
          break;
          // Activate ellipse op, set dragstart & make preview shape visible
        case 'ellipse':
          this.op = 'ellipse';
          this.dragStart.x = p.x;
          this.dragStart.y = p.y;
          this.ellipsePreview.x = p.x;
          this.ellipsePreview.y = p.y;
          this.ellipsePreview.visible = true;
          break;
        // Add vertex to shape array
        case 'shape':
          if (!this.shape) this.shape = [];
          const x = Math.floor(p.x);
          const y = Math.floor(p.y);
          // If this is not the first vertex...
          if (this.shape.length) {
            // Check if new point is close enough to start to close the shape
            const xo = Math.abs(this.shape[0].x - x);
            const yo = Math.abs(this.shape[0].y - y);
            if (xo < HANDLESIZE && yo < HANDLESIZE) {
              const verts = this.hexObjsToArr(this.shape);
              // render the new shape to history
              this.renderBrush({
                shape: 'shape',
                x: 0,
                y: 0,
                vertices: verts,
                visible: true,
                fill: game.user.getFlag(this.layername, 'brushOpacity'),
                alpha: 1,
              });
              // Reset the preview shape
              this.shapePreview.clear();
              this.shapePreview.visible = false;
              this.shapeHandle.visible = false;
              this.shape = [];
              return;
            }
          } else {
            // If this is the first vertex
            // Draw shape handle
            this.shapeHandle.x = x - HANDLESIZE;
            this.shapeHandle.y = y - HANDLESIZE;
            this.shapeHandle.visible = true;
          }
          // If intermediate vertex, add it to array and redraw the preview
          this.shape.push({ x, y });
          this.shapePreview.clear();
          this.shapePreview.beginFill(previewFill);
          this.shapePreview.drawPolygon(this.hexObjsToArr(this.shape));
          this.shapePreview.endFill();
          this.shapePreview.visible = true;
          break;
        default:
          break;
      }
      // Call pointermove so single click will still draw brush if mouse does not move
      this.pointerMove(event);
    } else if (event.data.button === 2) {
    // Todo: Not sure why this doesnt trigger when drawing
      this.cancelTool();
    }
  }

  pointerUp(event) {
  // Only react to left mouse button
    if (event.data.button === 0) {
      const p = event.data.getLocalPosition(canvas.app.stage);

      switch (this.op) {
        // Drag box tool
        case 'box':
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
          break;
          // Drag ellipse tool
        case 'ellipse':
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
          break;
          // Grid tool
        case 'grid':
          this.boxPreview.visible = false;
          break;
        default:
          break;
      }
      // Reset operation
      this.op = false;

      // Push the history buffer
      this.commitHistory();
    }
  }

  /**
   * Aborts any active drawing tools
   */
  cancelTool() {
  // Box preview
    this.boxPreview.visible = false;
    // Ellipse Preview
    this.ellipsePreview.visible = false;
    // Shape preview
    this.shapePreview.clear();
    this.shapePreview.visible = false;
    this.shapeHandle.visible = false;
    this.shape = [];
    // Cancel op flag
    this.op = false;
    // Clear history buffer
    this.historyBuffer = [];
  }

  /**
   * Checks if an array of arrays contains an equivalent to the given array
   * @param arrayOfArrays {Array} Haystack
   * @param array {Array}         Needle
   */
  doesArrayOfArraysContainArray(arrayOfArrays, array) {
    const aOA = arrayOfArrays.map((arr) => arr.slice());
    const a = array.slice(0);
    for (let i = 0; i < aOA.length; i += 1) {
      if (aOA[i].sort().join(',') === a.sort().join(',')) {
        return true;
      }
    }
    return false;
  }

  /**
   * Dumps a render of a given pixi container or texture to a new tab
   */
  pixiDump(tgt = null) {
    canvas.app.render();
    const data = canvas.app.renderer.extract.base64(tgt);
    const win = window.open();
    win.document.write(`<img src='${data}'/>`);
  }

  /**
   * Extracts pixel data of the mask layer to array
   */
  getMaskPixels() {
    const tex = this.masktexture;
    const pixels = canvas.app.renderer.plugins.extract.pixels(tex);
    return { pixels, tex };
  }

  /**
   * Gets the RGBA value of a given point from a mask object
   * @param point {Object} { x: 0, y: 0 }
   * @param mask  {Object} { pixelarray, texture} - see getMaskPixels()
   */
  getPixel(point, mask) {
    // point = this.worldTransform.applyInverse(point, { x: 0, y: 0 });
    const num = point.x + point.y * mask.tex.width;
    const px = mask.pixels;
    return [px[num * 4], px[num * 4 + 1], px[num * 4 + 2], px[num * 4 + 3]];
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
