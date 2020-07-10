export class SimplefogBrushControls extends FormApplication {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["form"],
            closeOnSubmit: false,
            submitOnChange: true,
            submitOnClose: true,
            popOut: false,
            editable: game.user.isGM,
            width: 400,
            template: "modules/simplefog/templates/brush-controls.html",
            id: "filter-config",
            title: game.i18n.localize("Simplefog Options"),
            parent: "#controls"
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
            brushOpacity: game.user.getFlag('simplefog', 'brushOpacity'),
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
        game.user.setFlag('simplefog', 'brushOpacity', formData.brushOpacity);
        game.user.setFlag('simplefog', 'brushMode', $('input[name="mode"]:checked').val());
    }
}
