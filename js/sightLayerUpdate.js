/* SimplefogSightLayer extends SightLayer
 *
 * Extends foundry's default sightlayer to perform custom visibility
 * checks on sight layer updates to hide and reveal placeables based
 * on opacity of simplefog layer mask
 */
import { timer } from './helpers.js';

/*
  * The token's worldTransform is not updated yet when this is called
  * probably because the token will be animated, so we need to convert
  * the token's grid position to world coords since grid position updates
  * immediately
  *
  * If there is a more straight forward way to do this it would be nice!
  */
function _getCanvasCoords(placeable) {
  let x;
  let y;
  // Check if placeable is a door
  if (placeable.data.door) {
    x = placeable.doorControl.x;
    y = placeable.doorControl.y;
  } else {
    x = placeable.data.x;
    y = placeable.data.y;
  }
  const { grid } = canvas.scene.data;
  x = Math.round(grid / 2 + x);
  y = Math.round(grid / 2 + y);
  return { x, y };
}

/*
  * Checks mask opacity at location of placeable and sets visibility
  */
function _setPlaceableVisibility(placeable, mask) {
  const pos = _getCanvasCoords(placeable);
  const p = canvas.simplefog.getPixel(pos, mask);
  const pAvg = (p[0] + p[1] + p[2]) / 3;
  const v = ((pAvg / 255) < canvas.scene.getFlag('simplefog', 'vThreshold'));
  // if this is a door, we set vis on it's control object instead
  if (placeable.data.door) placeable.doorControl.visible = v;
  else placeable.visible = v;
}

export default function sightLayerUpdate() {
  // Skip checking placeables if simplefog not visible anyway
  if (!canvas.simplefog.visible) return;
  // Skip if autoVisibility not enabled for this scene
  if (!canvas.scene.getFlag('simplefog', 'autoVisibility')) return;
  // Skip if user is GM and autoVisGM Disabled
  if (game.user.isGM && !canvas.scene.getFlag('simplefog', 'autoVisGM')) return;
  const t = timer('AutoVisibility');
  // get mask data
  // Todo: kinda slow, probably a better way to do this
  const mask = canvas.simplefog.getMaskPixels();
  // loop through placeables
  canvas.tokens.placeables.forEach((placeable) => {
    _setPlaceableVisibility(placeable, mask);
  });
  canvas.notes.placeables.forEach((placeable) => {
    _setPlaceableVisibility(placeable, mask);
  });
  canvas.walls.placeables.forEach((placeable) => {
    if (placeable.data.door) {
      _setPlaceableVisibility(placeable, mask);
    }
  });
  t.stop();
}
