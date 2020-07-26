/* SimplefogSightLayer extends SightLayer
 *
 * Extends foundry's default sightlayer to perform custom visibility
 * checks on sight layer updates to hide and reveal placeables based
 * on opacity of simplefog layer mask
 */

export class SimplefogSightLayer extends SightLayer {
  update() {
    super.update();
    // get mask data
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
        console.log('door');
        console.log(placeable);
      }
    });
    console.log();
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
    const v = (pAvg !== 255);
    if (placeable.data.door) placeable.doorControl.visible = v;
    else placeable.visible = v;
  }
}
