export class SimplefogConfig extends FormApplication {
  static get defaultOptions() {
  return mergeObject(super.defaultOptions, {
    classes: ["form"],
    closeOnSubmit: false,
    submitOnChange: true,
    submitOnClose: true,
    popOut: true,
    editable: game.user.isGM,
    width: 400,
    template: "modules/simplefog/templates/config.html",
    id: "filter-config",
    title: game.i18n.localize("Simplefog Options")
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
    canvas.scene.setFlag('simplefog', 'gmAlpha', formData.gmAlpha / 100);
    canvas.scene.setFlag('simplefog', 'gmTint', webToHex(formData.gmTint));
    canvas.scene.setFlag('simplefog', 'playerAlpha', formData.playerAlpha / 100);
    canvas.scene.setFlag('simplefog', 'playerTint', webToHex(formData.playerTint));
    canvas.scene.setFlag('simplefog', 'transition', formData.transition);
    canvas.scene.setFlag('simplefog', 'transitionSpeed', formData.transitionSpeed);
    canvas.scene.setFlag('simplefog', 'blurRadius', formData.blurRadius);
    canvas.scene.setFlag('simplefog', 'blurQuality', formData.blurQuality);
  }
}

/**
 * Converts web colors to base 16
 * @param n {Hex}               Web format color, f.x. #FF0000       
 * @return {Hex}                Base 16 format color, f.x. 0xFF0000         
 */
function webToHex(n) {
  return n.replace("#", "0x");
}

/**
 * Converts a base16 color into a web color
 * @param n {Hex}               Base 16 Color, f.x. 0xFF0000
 * @return {Hex}                Web format color, f.x. #FF0000         
 */
function hexToWeb (n) {
  n = (n+'').replace("0x", "#");
  return n;
}

