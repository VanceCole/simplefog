import { simplefogLog } from '../js/helpers.js';

export default class SimplefogLayer extends InteractionLayer {
  constructor() {
    simplefogLog('SimplefogLayer.constructor')
    super();
  }

  static get layerOptions() {
    simplefogLog('SimplefogLayer.layerOptions')
    return mergeObject(super.layerOptions, {
      name: "simplefog",
      zIndex: 5000,
    });
  }

  getCanvasSprite() {
    simplefogLog('SimplefogLayer.getCanvasSprite')
    const sprite = new PIXI.Sprite(PIXI.Texture.BLACK);
    const d = canvas.dimensions;
    console.log('DEBUG - Dimensions', d)
    sprite.width = d.width;
    sprite.height = d.height;
    sprite.x = 0;
    sprite.y = 0;
    sprite.zIndex = 0;
    return sprite;
  }

  getMaskTexture() {
    simplefogLog('SimplefogLayer.getMaskTexture')
    const d = canvas.dimensions;
    let res = 1.0;
    if (d.width * d.height > 16000 ** 2) res = 0.25;
    else if (d.width * d.height > 8000 ** 2) res = 0.5;

    // Create the mask elements
    const tex = PIXI.RenderTexture.create({
      width: canvas.dimensions.width,
      height: canvas.dimensions.height,
      resolution: res,
    });
    return tex;
  }

  fogInit() {
    simplefogLog('SimplefogLayer.fogInit')
    this.visible = true;

    // Fog the entire canvas
    const sprite = new PIXI.Sprite(PIXI.Texture.WHITE);
    sprite.width = canvas.dimensions.width;
    sprite.height = canvas.dimensions.height;
    sprite.x = 0;
    sprite.y = 0;
    sprite.zIndex = 5000;
    sprite.tint = '0x000000';  //Apply GM/player tint

    this.addChild(sprite)

    const fill = new PIXI.Graphics();
    fill.beginFill(0x000000);
    //fill.drawRect(0, 0, canvas.dimensions.width, canvas.dimensions.height);
    fill.drawRect(200, 200, 250, 250);
    fill.endFill();
    fill.zIndex = 5001
    //canvas.app.renderer.render(fill, this.maskTexture, false, null, false);
    //fill.destroy();
    sprite.mask = fill



/*
    this.maskTexture = this.getMaskTexture();
    this.maskSprite = new PIXI.Sprite(this.maskTexture);

    this.layer.mask = this.maskSprite;
    this.setFill();

    // Allow zIndex prop to function for items on this layer
    this.sortableChildren = true;

    this.visible = true;

    // apply Texture Sprite to fog layer after we renderStack to prevent revealing the map
    this.fogSprite = new PIXI.Sprite();
    this.fogSprite.position.set(d.sceneRect.x, d.sceneRect.y);
    this.fogSprite.width = d.sceneRect.width;
    this.fogSprite.height = d.sceneRect.height;
    this.fogSprite.mask = this.maskSprite;

 */
  }

  setFill() {
    simplefogLog('SimplefogLayer.setFill')
    const fill = new PIXI.Graphics();
    fill.beginFill(0xffffff);
    fill.drawRect(0, 0, canvas.dimensions.width, canvas.dimensions.height);
    fill.endFill();
    canvas.app.renderer.render(fill, this.maskTexture, false, null, false);
    //fill.destroy();
  }

  async draw() {
    simplefogLog('SimplefogLayer.draw')
    super.draw();
    this.fogInit();
  }
}
