export class BrushControls extends FormApplication {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ['form'],
      closeOnSubmit: false,
      submitOnChange: true,
      submitOnClose: true,
      popOut: false,
      editable: game.user.isGM,
      template: 'modules/simplefog/templates/brush-controls.html',
      id: 'filter-config',
      title: game.i18n.localize('Simplefog Options'),
      parent: '#controls',
    });
  }

  /* -------------------------------------------- */

  /**
   * Obtain module metadata and merge it with game settings which track current module visibility
   * @return {Object}   The data provided to the template when rendering the form
   */
  getData() {
    // Return data to the template
    return {
      brushSize: game.user.getFlag('simplefog', 'brushSize'),
      brushOpacity: hexToPercent(game.user.getFlag('simplefog', 'brushOpacity')),
      brushMode: game.user.getFlag('simplefog', 'brushMode'),
    };
  }

  /* -------------------------------------------- */
  /*  Event Listeners and Handlers                */
  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);
  }

  /**
   * This method is called upon form submission after form data is validated
   * @param event {Event}       The initial triggering submission event
   * @param formData {Object}   The object of validated form data with which to update the object
   * @private
   */
  _updateObject(event, formData) {
    game.user.setFlag('simplefog', 'brushSize', formData.brushSize);
    game.user.setFlag('simplefog', 'brushOpacity', percentToHex(formData.brushOpacity));
    game.user.setFlag('simplefog', 'brushMode', $('input[name="mode"]:checked').val());
  }
}

/**
 * Converts a hexadecimal color to an integer percentage
 * @param n {Hex}               Base 16 Color, f.x. 0x000000
 * @return {Integer}             f.x 0
 */
function hexToPercent(n) {
  return Math.ceil(n / 0xFFFFFF * 100);
}

/**
 * Converts an integer percent (0-100) to a hexadecimal greyscale color
 * @param n {Number}            0-100 numeric input
 * @return {Hex}                Base 16 format color, f.x. 0xFFFFFF
 */
function percentToHex(n) {
  let c = Math.ceil(n * 2.55).toString(16);
  if (c.length === 1) c = `0${c}`;
  c = `0x${c}${c}${c}`;
  return c;
}
