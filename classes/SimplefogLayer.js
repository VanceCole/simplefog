/* SimplefogLayer extends MaskLayer
 *
 * Implements tools for manipulating the MaskLayer
 */

import MaskLayer from './MaskLayer.js';
import { Layout } from '../libs/hexagons.js';
import { hexObjsToArr, doesArrayOfArraysContainArray, hexToPercent } from '../js/helpers.js';

export default class SimplefogLayer extends MaskLayer {
  constructor() {
    super('simplefog');
    // Register event listerenrs
    this._registerMouseListeners();
    this._registerKeyboardListeners();

    this.DEFAULTS = Object.assign(this.DEFAULTS, {
      gmAlpha: 0.6,
      gmTint: '0x000000',
      playerAlpha: 1,
      playerTint: '0x000000',
      transition: true,
      transitionSpeed: 800,
      previewColor: '0x00FFFF',
      handlefill: '0xff6400',
      handlesize: 20,
      previewAlpha: 0.4,
      brushSize: 50,
      brushOpacity: 1,
      autoVisibility: false,
      autoVisGM: false,
      vThreshold: 1,
    });

    // React to canvas zoom
    Hooks.on('canvasPan', (canvas, dimensions) => {
    // Scale blur filter radius to account for zooming
      this.blur.blur = this.getSetting('blurRadius') * dimensions.scale;
    });

    // React to changes to current scene
    Hooks.on('updateScene', (scene, data) => { this._updateScene(scene, data); });
  }

  async init() {
    this.maskInit();
    // Preview brush objects
    this.boxPreview = this.brush({
      shape: 'box',
      x: 0,
      y: 0,
      fill: 0xFFFFFF,
      alpha: this.DEFAULTS.previewAlpha,
      width: 100,
      height: 100,
      visible: false,
      zIndex: 10,
    });
    this.ellipsePreview = this.brush({
      shape: 'ellipse',
      x: 0,
      y: 0,
      fill: 0xFFFFFF,
      alpha: this.DEFAULTS.previewAlpha,
      width: 100,
      height: 100,
      visible: false,
      zIndex: 10,
    });
    this.shapePreview = this.brush({
      shape: 'shape',
      x: 0,
      y: 0,
      vertices: [],
      fill: 0xFFFFFF,
      alpha: this.DEFAULTS.previewAlpha,
      visible: false,
      zIndex: 10,
    });
    this.shapeHandle = this.brush({
      shape: 'box',
      x: 0,
      y: 0,
      fill: this.DEFAULTS.handlefill,
      width: this.DEFAULTS.handlesize * 2,
      height: this.DEFAULTS.handlesize * 2,
      alpha: this.DEFAULTS.previewAlpha,
      visible: false,
      zIndex: 15,
    });
    // Add preview brushes to layer
    this.addChild(this.boxPreview);
    this.addChild(this.ellipsePreview);
    this.addChild(this.shapePreview);
    this.addChild(this.shapeHandle);

    // Set default flags if they dont exist already
    Object.keys(this.DEFAULTS).forEach((key) => {
      if (!game.user.isGM) return;
      // Check for existing scene specific setting
      if (this.getSetting(key) !== undefined) return;
      // Check for custom default
      const def = this.getUserSetting(key);
      // If user has custom default, set it for scene
      if (def !== undefined) this.setSetting(key, def);
      // Otherwise fall back to module default
      else this.setSetting(key, this.DEFAULTS[key]);
    });
    // These two make more sense per user, so set them on the game.user object instead of scene
    if (!this.getUserSetting('brushOpacity')) this.setUserSetting('brushOpacity', this.DEFAULTS.brushOpacity);
    if (!this.getUserSetting('brushSize')) this.setUserSetting('brushSize', this.DEFAULTS.brushSize);
  }

  /* -------------------------------------------- */
  /*  Getters and setters for layer props         */
  /* -------------------------------------------- */


  // Tint & Alpha have special cases because they can differ between GM & Players
  // And alpha can be animated for transition effects
  getTint() {
    let tint;
    if (game.user.isGM) tint = this.getSetting('gmTint');
    else tint = this.getSetting('playerTint');
    if (!tint) {
      if (game.user.isGM) tint = this.gmTintDefault;
      else tint = this.playerTintDefault;
    }
    return tint;
  }

  setTint(tint) {
    this.layer.tint = tint;
  }

  getAlpha() {
    let alpha;
    if (game.user.isGM) alpha = this.getSetting('gmAlpha');
    else alpha = this.getSetting('playerAlpha');
    if (!alpha) {
      if (game.user.isGM) alpha = this.DEFAULTS.gmAlpha;
      else alpha = this.DEFAULTS.playerAlpha;
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
    if (skip || !this.getSetting('transition')) this.layer.alpha = alpha;
    // Loop until transition is complete
    else {
      const start = this.layer.alpha;
      const dist = start - alpha;
      const fps = 60;
      const speed = this.getSetting('transitionSpeed');
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

  /* -------------------------------------------- */
  /*  Event Listeners and Handlers                */
  /* -------------------------------------------- */

  /**
   * React to updates of canvas.scene flags
   */
  _updateScene(scene, data) {
    // Check if update applies to current viewed scene
    if (!scene._view) return;
    // React to visibility change
    if (hasProperty(data, `flags.${this.layername}.visible`)) {
      canvas[this.layername].visible = data.flags[this.layername].visible;
    }
    // React to composite history change
    if (hasProperty(data, `flags.${this.layername}.blurRadius`)) {
      canvas[this.layername].blur.blur = this.getSetting('blurRadius');
    }
    // React to composite history change
    if (hasProperty(data, `flags.${this.layername}.blurQuality`)) {
      canvas[this.layername].blur.quality = this.getSetting('blurQuality');
    }
    // React to composite history change
    if (hasProperty(data, `flags.${this.layername}.history`)) {
      canvas[this.layername].renderStack(data.flags[this.layername].history);
    }
    // React to autoVisibility setting changes
    if (
      hasProperty(data, `flags.${this.layername}.autoVisibility`)
      || hasProperty(data, `flags.${this.layername}.vThreshold`)
    ) {
      canvas.sight.update();
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
  }

  /**
   * Adds the mouse listeners to the layer
   */
  _registerMouseListeners() {
    this.addListener('pointerdown', this._pointerDown);
    this.addListener('pointerup', this._pointerUp);
    this.addListener('pointermove', this._pointerMove);
    this.dragging = false;
    this.brushing = false;
  }

  /**
   * Adds the keyboard listeners to the layer
   */
  _registerKeyboardListeners() {
    $(document).keydown((event) => {
      // Only react if simplefog layer is active
      if (ui.controls.activeControl !== this.layername) return;
      if (event.which === 219 && this.activeTool === 'brush') {
        const s = this.getUserSetting('brushSize');
        this.setBrushSize(s * 0.8);
      }
      if (event.which === 221 && this.activeTool === 'brush') {
        const s = this.getUserSetting('brushSize');
        this.setBrushSize(s * 1.25);
      }
      // React to ctrl+z
      if (event.which === 90 && event.ctrlKey) {
        event.stopPropagation();
        this.undo();
      }
    });
  }

  /**
   * Sets the active tool & shows preview for brush & grid tools
   */
  setActiveTool(tool) {
    this.clearActiveTool();
    this.activeTool = tool;
    this.setPreviewTint();
    if (tool === 'brush') {
      this.ellipsePreview.visible = true;
      $('#simplefog-brush-controls #brush-size-container').show();
    } else {
      $('#simplefog-brush-controls #brush-size-container').hide();
    }
    if (tool === 'grid') {
      if (canvas.scene.data.gridType === 1) {
        this.boxPreview.width = canvas.scene.data.grid;
        this.boxPreview.height = canvas.scene.data.grid;
        this.boxPreview.visible = true;
      } else if ([2, 3, 4, 5].includes(canvas.scene.data.gridType)) {
        this._initGrid();
        this.shapePreview.visible = true;
      }
    }
  }

  setPreviewTint() {
    const vt = this.getSetting('vThreshold');
    const bo = hexToPercent(this.getUserSetting('brushOpacity')) / 100;
    let tint = 0xFF0000;
    if (bo < vt) tint = 0x00FF00;
    this.ellipsePreview.tint = tint;
    this.boxPreview.tint = tint;
    this.shapePreview.tint = tint;
  }

  /**
   * Sets the active tool & shows preview for brush & grid tools
   * @param {Number}  Size in pixels
   */
  async setBrushSize(s) {
    await this.setUserSetting('brushSize', s);
    const p = { x: this.ellipsePreview.x, y: this.ellipsePreview.y };
    this._pointerMoveBrush(p);
  }

  /**
   * Aborts any active drawing tools
   */
  clearActiveTool() {
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
   * Mouse handlers for canvas layer interactions
   */
  _pointerDown(e) {
    // Only react on left mouse button
    if (e.data.button === 0) {
      const p = e.data.getLocalPosition(canvas.app.stage);
      this.op = true;
      // Check active tool
      switch (this.activeTool) {
        case 'brush': this._pointerDownBrush(p, e);
          break;
        case 'grid': this._pointerDownGrid(p, e);
          break;
        case 'box': this._pointerDownBox(p, e);
          break;
        case 'ellipse': this._pointerDownEllipse(p, e);
          break;
        case 'shape': this._pointerDownShape(p, e);
          break;
        default: // Do nothing
          break;
      }
      // Call _pointermove so single click will still draw brush if mouse does not move
      this._pointerMove(e);
    } else if (e.data.button === 2) {
    // Todo: Not sure why this doesnt trigger when drawing ellipse & box
      if (['shape', 'box', 'ellipse'].includes(this.activeTool)) {
        this.clearActiveTool();
      }
    }
  }

  _pointerMove(e) {
  // Get mouse position translated to canvas coords
    const p = e.data.getLocalPosition(canvas.app.stage);
    switch (this.activeTool) {
      case 'brush': this._pointerMoveBrush(p, e);
        break;
      case 'box': this._pointerMoveBox(p, e);
        break;
      case 'grid': this._pointerMoveGrid(p, e);
        break;
      case 'ellipse': this._pointerMoveEllipse(p, e);
        break;
      default:
        break;
    }
  }

  _pointerUp(e) {
  // Only react to left mouse button
    if (e.data.button === 0) {
      // Translate click to canvas position
      const p = e.data.getLocalPosition(canvas.app.stage);
      switch (this.op) {
        case 'box': this._pointerUpBox(p, e);
          break;
        case 'ellipse': this._pointerUpEllipse(p, e);
          break;
        default: // Do nothing
          break;
      }
      // Reset operation
      this.op = false;
      // Push the history buffer
      this.commitHistory();
    }
  }

  /**
   * Brush Tool
   */
  _pointerDownBrush() {
    this.op = true;
  }

  _pointerMoveBrush(p) {
    const size = this.getUserSetting('brushSize');
    this.ellipsePreview.width = size * 2;
    this.ellipsePreview.height = size * 2;
    this.ellipsePreview.x = p.x;
    this.ellipsePreview.y = p.y;
    // If drag operation has started
    if (this.op) {
      // Send brush movement events to renderbrush to be drawn and added to history stack
      this.renderBrush({
        shape: 'ellipse',
        x: p.x,
        y: p.y,
        fill: this.getUserSetting('brushOpacity'),
        width: this.getUserSetting('brushSize'),
        height: this.getUserSetting('brushSize'),
        alpha: 1,
        visible: true,
      });
    }
  }

  /*
   * Box Tool
   */
  _pointerDownBox(p) {
    // Set active drag operation
    this.op = 'box';
    // Set drag start coords
    this.dragStart.x = p.x;
    this.dragStart.y = p.y;
    // Reveal the preview shape
    this.boxPreview.visible = true;
    this.boxPreview.x = p.x;
    this.boxPreview.y = p.y;
  }

  _pointerMoveBox(p, e) {
    // If drag operation has started
    if (this.op) {
      // update the preview shape
      const d = this._getDragBounds(p, e);
      this.boxPreview.width = d.w;
      this.boxPreview.height = d.h;
    }
  }

  _pointerUpBox(p, e) {
    // update the preview shape
    const d = this._getDragBounds(p, e);
    this.renderBrush({
      shape: 'box',
      x: this.dragStart.x,
      y: this.dragStart.y,
      width: d.w,
      height: d.h,
      visible: true,
      fill: this.getUserSetting('brushOpacity'),
      alpha: 1,
    });
    this.boxPreview.visible = false;
  }

  /*
   * Ellipse Tool
   */
  _pointerDownEllipse(p) {
    // Set active drag operation
    this.op = 'ellipse';
    // Set drag start coords
    this.dragStart.x = p.x;
    this.dragStart.y = p.y;
    // Reveal the preview shape
    this.ellipsePreview.x = p.x;
    this.ellipsePreview.y = p.y;
    this.ellipsePreview.visible = true;
  }

  _pointerMoveEllipse(p, e) {
    // If drag operation has started
    const d = this._getDragBounds(p, e);
    if (this.op) {
      // Just update the preview shape
      this.ellipsePreview.width = d.w * 2;
      this.ellipsePreview.height = d.h * 2;
    }
  }

  _pointerUpEllipse(p, e) {
    const d = this._getDragBounds(p, e);
    this.renderBrush({
      shape: 'ellipse',
      x: this.dragStart.x,
      y: this.dragStart.y,
      width: Math.abs(d.w),
      height: Math.abs(d.h),
      visible: true,
      fill: this.getUserSetting('brushOpacity'),
      alpha: 1,
    });
    this.ellipsePreview.visible = false;
  }

  /*
   * Shape Tool
   */
  _pointerDownShape(p) {
    if (!this.shape) this.shape = [];
    const x = Math.floor(p.x);
    const y = Math.floor(p.y);
    // If this is not the first vertex...
    if (this.shape.length) {
      // Check if new point is close enough to start to close the shape
      const xo = Math.abs(this.shape[0].x - x);
      const yo = Math.abs(this.shape[0].y - y);
      if (xo < this.DEFAULTS.handlesize && yo < this.DEFAULTS.handlesize) {
        const verts = hexObjsToArr(this.shape);
        // render the new shape to history
        this.renderBrush({
          shape: 'shape',
          x: 0,
          y: 0,
          vertices: verts,
          visible: true,
          fill: this.getUserSetting('brushOpacity'),
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
      this.shapeHandle.x = x - this.DEFAULTS.handlesize;
      this.shapeHandle.y = y - this.DEFAULTS.handlesize;
      this.shapeHandle.visible = true;
    }
    // If intermediate vertex, add it to array and redraw the preview
    this.shape.push({ x, y });
    this.shapePreview.clear();
    this.shapePreview.beginFill(0xFFFFFF);
    this.shapePreview.drawPolygon(hexObjsToArr(this.shape));
    this.shapePreview.endFill();
    this.shapePreview.visible = true;
  }

  /**
   * Grid Tool
   */
  _pointerDownGrid() {
    // Set active drag operation
    this.op = 'grid';
    this._initGrid();
  }

  _pointerMoveGrid(p) {
    const { grid, gridType } = canvas.scene.data;
    // Square grid
    if (gridType === 1) {
      const gridx = Math.floor(p.x / grid);
      const gridy = Math.floor(p.y / grid);
      const x = gridx * grid;
      const y = gridy * grid;
      this.boxPreview.x = x;
      this.boxPreview.y = y;
      this.boxPreview.width = grid;
      this.boxPreview.height = grid;
      if (this.op) {
        if (!this.dupes[gridx][gridy]) {
          // Flag cell as drawn in dupes
          this.dupes[gridx][gridy] = 1;
          this.renderBrush({
            shape: 'box',
            x,
            y,
            width: grid,
            height: grid,
            visible: true,
            fill: this.getUserSetting('brushOpacity'),
            alpha: 1,
          });
        }
      }
      // Hex Grid
    } else if ([2, 3, 4, 5].includes(gridType)) {
      // Convert pixel coord to hex coord
      const qr = this.gridLayout.pixelToHex(p);
      const gridq = Math.ceil(qr.q - 0.5);
      const gridr = Math.ceil(qr.r - 0.5);
      // Get current grid coord verts
      const vertices = this.gridLayout.polygonCorners({ q: gridq, r: gridr });
      // Convert to array of individual verts
      const vertexArray = hexObjsToArr(vertices);
      // Update the preview shape
      this.shapePreview.clear();
      this.shapePreview.beginFill(0xFFFFFF);
      this.shapePreview.drawPolygon(vertexArray);
      this.shapePreview.endFill();
      // If drag operation has started
      if (this.op) {
        // Check if this grid cell was already drawn
        if (!doesArrayOfArraysContainArray(this.dupes, [gridq, gridr])) {
          // Get the vert coords for the hex
          this.renderBrush({
            shape: 'polygon',
            vertices: vertexArray,
            x: 0,
            y: 0,
            visible: true,
            fill: this.getUserSetting('brushOpacity'),
            alpha: 1,
          });
          // Flag cell as drawn in dupes
          this.dupes.push([gridr, gridq]);
        }
      }
    }
  }

  /*
   * Returns height and width given a pointer coord and event for modifer keys
   */
  _getDragBounds(p, e) {
    let h = p.y - this.dragStart.y;
    let w = p.x - this.dragStart.x;
    if (e.data.originalEvent.shiftKey) {
      if (h > w) w = h;
      else h = w;
    }
    return { w, h };
  }

  /*
   * Checks grid type, creates a dupe detection matrix & if hex grid init a layout
   */
  _initGrid() {
    const { grid } = canvas.scene.data;
    const { width, height } = canvas.dimensions;
    switch (canvas.scene.data.gridType) {
    // Square grid
      case 1: this.dupes = new Array(Math.ceil(width / grid)).fill(0).map(() => new Array(Math.ceil(height / grid)).fill(0));
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
  }
}
