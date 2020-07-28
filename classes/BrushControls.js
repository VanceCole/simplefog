import { hexToPercent, percentToHex } from '../js/helpers.js';

export default class BrushControls extends FormApplication {
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
  async _updateObject(event, formData) {
    game.user.setFlag('simplefog', 'brushSize', formData.brushSize);
    await game.user.setFlag('simplefog', 'brushOpacity', percentToHex(formData.brushOpacity));
    canvas.simplefog.setPreviewTint();
  }
}
