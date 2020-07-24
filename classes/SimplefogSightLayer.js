export class SimplefogSightLayer extends SightLayer {
  update() {
    super.update();
    console.log('-- Updating sight layer');
    // get all placeables
    // loop through them
    canvas.tokens.placeables.forEach((token) => {
      console.log(`${token.data.name} - ${token.x}, ${token.y}`);
      let v = false;
      // if fog at coord = 1

      // make placeable invis
      if (!v) token.visible = false;
    });
    console.log();
  }
}
