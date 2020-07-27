import { webToHex, hexToWeb } from '../js/helpers.js';

export default class SimplefogConfig extends FormApplication {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ['form'],
      closeOnSubmit: false,
      submitOnChange: true,
      submitOnClose: true,
      popOut: true,
      editable: game.user.isGM,
      width: 500,
      template: 'modules/simplefog/templates/scene-config.html',
      id: 'simplefog-scene-config',
      title: game.i18n.localize('Simplefog Options'),
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
      gmAlpha: canvas.scene.getFlag('simplefog', 'gmAlpha') * 100,
      gmTint: hexToWeb(canvas.scene.getFlag('simplefog', 'gmTint')),
      playerAlpha: canvas.scene.getFlag('simplefog', 'playerAlpha') * 100,
      playerTint: hexToWeb(canvas.scene.getFlag('simplefog', 'playerTint')),
      transition: canvas.scene.getFlag('simplefog', 'transition'),
      transitionSpeed: canvas.scene.getFlag('simplefog', 'transitionSpeed'),
      blurRadius: canvas.scene.getFlag('simplefog', 'blurRadius'),
      blurQuality: canvas.scene.getFlag('simplefog', 'blurQuality'),
      autoVisibility: canvas.scene.getFlag('simplefog', 'autoVisibility'),
      vThreshold: canvas.scene.getFlag('simplefog', 'vThreshold') * 100,
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
    Object.entries(formData).forEach(async ([key, val]) => {
      // If setting is an opacity slider, convert from 1-100 to 0-1
      if (['gmAlpha', 'playerAlpha', 'vThreshold'].includes('key')) val /= 100;
      // If setting is a color value, convert webcolor to hex before saving
      if (['gmTint', 'playerTint'].includes('key')) val = webToHex(val);
      // Save settings to scene
      await canvas.scene.setFlag('simplefog', key, val);
      // If saveDefaults button clicked, also save to user's defaults
      if (event.submitter?.name === 'saveDefaults') game.user.setFlag('simplefog', key, val);
    });

    // If save button was clicked, close app
    if (event.submitter?.name === 'submit') {
      Object.values(ui.windows).forEach((val) => {
        if (val.id === 'simplefog-scene-config') val.close();
      });
    }

    // Update sight layer
    canvas.sight.update();
  }
}
