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
      gmAlpha: Math.round(canvas.simplefog.getSetting('gmAlpha') * 100),
      gmTint: hexToWeb(canvas.simplefog.getSetting('gmTint')),
      playerAlpha: Math.round(canvas.simplefog.getSetting('playerAlpha') * 100),
      playerTint: hexToWeb(canvas.simplefog.getSetting('playerTint')),
      transition: canvas.simplefog.getSetting('transition'),
      transitionSpeed: canvas.simplefog.getSetting('transitionSpeed'),
      blurRadius: canvas.simplefog.getSetting('blurRadius'),
      blurQuality: canvas.simplefog.getSetting('blurQuality'),
      autoVisibility: canvas.simplefog.getSetting('autoVisibility'),
      autoFog: canvas.simplefog.getSetting('autoFog'),
      autoVisGM: canvas.simplefog.getSetting('autoVisGM'),
      vThreshold: Math.round(canvas.simplefog.getSetting('vThreshold') * 100),
      fogTextureFilePath: canvas.simplefog.getSetting('fogTextureFilePath'),
    };
  }

  /* -------------------------------------------- */
  /*  Event Listeners and Handlers                */
  /* -------------------------------------------- */

  /**
   * This method is called upon form submission after form data is validated
   * @param event {Event}       The initial triggering submission event
   * @param formData {Object}   The object of validated form data with which to update the object
   * @private
   */
  async _updateObject(event, formData) {
    Object.entries(formData).forEach(async ([key, val]) => {
      // If setting is an opacity slider, convert from 1-100 to 0-1
      if (['gmAlpha', 'playerAlpha', 'vThreshold'].includes(key)) val /= 100;
      // If setting is a color value, convert webcolor to hex before saving
      if (['gmTint', 'playerTint'].includes(key)) val = webToHex(val);
      // Save settings to scene
      await canvas.simplefog.setSetting(key, val);
      // If saveDefaults button clicked, also save to user's defaults
      if (event.submitter?.name === 'saveDefaults') {
        canvas.simplefog.setUserSetting(key, val);
      }
    });

    // If save button was clicked, close app
    if (event.submitter?.name === 'submit') {
      Object.values(ui.windows).forEach((val) => {
        if (val.id === 'simplefog-scene-config') val.close();
      });
    }

    // Update sight layer
    canvas.sight.refresh();
  }
}
