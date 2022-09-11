/* SimplefogHUDControlLayer extends CanvasLayer
 *
 * Used as layer directly below simplefog for object HUD controls
 */

import { simplefogLog } from "../js/helpers.js";

export default class SimplefogHUDControlLayer extends InteractionLayer {
  constructor(layername) {
    super();
  }

  static get layerOptions() {
    //@ts-ignore
    return mergeObject(super.layerOptions, {
      // Ugly hack - render at very high zindex (but one below simplefog) and then re-render at zindex below simplefog
      zIndex: 2147483646,
    });
  }
}
