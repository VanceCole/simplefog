/* SimplefogSightLayer extends SightLayer
 *
 * Extends foundry's default sightlayer to perform custom visibility
 * checks on sight layer updates to hide and reveal placeables based
 * on opacity of simplefog layer mask
 */

export class SimplefogSightLayer extends SightLayer {
  update() {
    super.update();
    console.log('-- Updating sight layer');
    // get mask data
    const mask = canvas.simplefog.getMaskPixels();
    // loop through placeables
    canvas.tokens.placeables.forEach((token) => {
      // Get canvas coords of token
      const pos = this.getCanvasCoords(token);
      // Get pixel at position
      const p = canvas.simplefog.getPixel(pos, mask);
      const v = (p[0] === 0);
      // make placeable invis
      token.visible = v;
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
  getCanvasCoords(token) {
    let {x, y} = token._validPosition;
    const { grid } = canvas.scene.data;
    x = Math.round(grid / 2 + x);
    y = Math.round(grid / 2 + y);
    return { x, y };
  }
}
