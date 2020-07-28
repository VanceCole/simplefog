/* MaskLayer extends CanvasLayer
 *
 * Creates an interactive layer which has an alpha channel mask
 * that can be rendered to and history for syncing between players
 * and replaying the mask / undo etc.
 */

export default class MaskLayer extends CanvasLayer {
  constructor(layername) {
    super();
    this.layername = layername;
    this.historyBuffer = [];
    this.pointer = 0;
    this.gridLayout = {};
    this.dragStart = { x: 0, y: 0 };
    this.debug = true;
    // Not actually used, just to prevent foundry from complaining
    this.history = [];
  }

  /* -------------------------------------------- */
  /*  Init                                        */
  /* -------------------------------------------- */

  /**
   * Called on canvas init, creates the canvas layers and various objects and registers listeners
   *
   * Important objects:
   *
   * layer       - PIXI Sprite which holds all the mask elements
   * filters     - Holds filters such as blur applied to the layer
   * layer.mask  - PIXI Sprite wrapping the renderable mask
   * masktexture - renderable texture that holds the actual mask data
   */
  async maskInit() {
    // Check if masklayer is flagged visible
    let v = this.getSetting('visible');
    if (v === undefined) v = false;
    this.visible = v;

    // The layer is the primary sprite to be displayed
    this.layer = this.getCanvasSprite();
    this.addChild(this.layer);
    this.setTint(this.getTint());
    this.setAlpha(this.getAlpha(), true);

    // Filters
    this.blur = new PIXI.filters.BlurFilter();
    // this.blur.autoFit = false;
    this.blur.padding = 0;
    this.blur.repeatEdgePixels = true;
    this.blur.blur = this.getSetting('blurRadius');
    this.blur.quality = this.getSetting('blurQuality');
    this.filters = [this.blur];

    // Create the mask elements
    this.masktexture = PIXI.RenderTexture.create(
      { width: canvas.dimensions.width, height: canvas.dimensions.height },
    );
    this.layer.mask = new PIXI.Sprite(this.masktexture);
    this.addChild(this.layer.mask);
    this.setFill();

    // Allow zIndex prop to function for items on this layer
    this.sortableChildren = true;

    // Render initial history stack
    this.renderStack();
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
    history = this.getSetting('history'),
    start = this.pointer,
    stop = this.getSetting('history.pointer'),
  ) {
  // If history is blank, do nothing
    if (history === undefined) return;
    // If history is zero, reset scene fog
    if (history.events.length === 0) this.resetMask(false);
    if (stop <= this.pointer) {
      this.resetMask(false);
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
    canvas.sight.update(false);
  }

  /**
   * Add buffered history stack to scene flag and clear buffer
   */
  async commitHistory() {
  // Do nothing if no history to be committed, otherwise get history
    if (this.historyBuffer.length === 0) return;
    let history = this.getSetting('history');
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
    await this.setSetting('history', history);
    if (this.debug) console.log(`Pushed ${this.historyBuffer.length} updates.`);
    // Clear the history buffer
    this.historyBuffer = [];
  }

  /**
   * Resets the mask of the layer
   * @param save {Boolean} If true, also resets the layer history
   */
  resetMask(save = true) {
  // Fill fog layer with solid
    this.setFill();
    // If save, also unset history and reset pointer
    if (save) {
      canvas.scene.unsetFlag(this.layername, 'history');
      this.setSetting('history', { events: [], pointer: 0 });
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
    let history = this.getSetting('history');
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
    await this.setSetting('history', history);
  }

  /* -------------------------------------------- */
  /*  Shapes, sprites and PIXI objs               */
  /* -------------------------------------------- */

  /**
   * Creates a PIXI graphic using the given brush parameters
   * @param data {Object}       A collection of brush parameters
   * @returns {Object}          PIXI.Graphics() instance
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
   * Renders the given brush to the layer mask
   * @param data {Object}       PIXI Object to be used as brush
   */
  composite(brush) {
    canvas.app.renderer.render(brush, this.masktexture, false, null, false);
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
    const v = this.getSetting('visible');
    this.visible = !v;
    this.setSetting('visible', !v);
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
