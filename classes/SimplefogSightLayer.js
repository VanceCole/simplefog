/* SimplefogSightLayer extends SightLayer
 *
 * Extends foundry's default sightlayer to perform custom visibility
 * checks on sight layer updates to hide and reveal placeables based
 * on opacity of simplefog layer mask
 */

export default class SimplefogSightLayer extends SightLayer {
  update(updateSuper = true) {
    if (updateSuper) super.update();
    // Skip checking placeables if simplefog not visible anyway
    // Skip if autoVisibility not enabled for this scene
    console.log(canvas.scene.getFlag('simplefog', 'autoVisibility'));
    if (!canvas.scene.getFlag('simplefog', 'autoVisibility')) return;
    const t = this.timer('sightUpdate');
    // get mask data
    // Todo: kinda slow, probably a better way to do this
    const mask = canvas.simplefog.getMaskPixels();
    // loop through placeables
    canvas.tokens.placeables.forEach((placeable) => {
      this.setPlaceableVisibility(placeable, mask);
    });
    canvas.notes.placeables.forEach((placeable) => {
      this.setPlaceableVisibility(placeable, mask);
    });
    canvas.walls.placeables.forEach((placeable) => {
      if (placeable.data.door) {
        this.setPlaceableVisibility(placeable, mask);
      }
    });
    t.stop();
  }

  timer(name) {
    const start = new Date();
    return {
      stop() {
        const end = new Date();
        const time = end.getTime() - start.getTime();
        console.log('Timer:', name, 'finished in', time, 'ms');
      },
    };
  }

  /*
   * The token's worldTransform is not updated yet when this is called
   * probably because the token will be animated, so we need to convert
   * the token's grid position to world coords since grid position updates
   * immediately
   *
   * If there is a more straight forward way to do this it would be nice!
   */
  getCanvasCoords(placeable) {
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
  setPlaceableVisibility(placeable, mask) {
    const pos = this.getCanvasCoords(placeable);
    const p = canvas.simplefog.getPixel(pos, mask);
    const pAvg = (p[0] + p[1] + p[2]) / 3;
    console.log(`${pAvg / 255} / ${canvas.scene.getFlag('simplefog', 'vThreshold')}`);
    const v = ((pAvg / 255) < canvas.scene.getFlag('simplefog', 'vThreshold'));
    console.log(v);
    // if this is a door, we set vis on it's control object instead
    if (placeable.data.door) placeable.doorControl.visible = v;
    else placeable.visible = v;
  }
}
