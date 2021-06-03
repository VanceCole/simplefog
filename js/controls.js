import SimplefogConfig from '../classes/SimplefogConfig.js';
import BrushControls from '../classes/BrushControls.js';

/**
 * Add control buttons
 */
Hooks.on('getSceneControlButtons', (controls) => {
  if (!game.user.isGM) return;
  controls.push({
    name: 'simplefog',
    title: game.i18n.localize('SIMPLEFOG.sf'),
    icon: 'fas fa-cloud',
    layer: 'simplefog',
    tools: [
      {
        name: 'simplefogtoggle',
        title: game.i18n.localize('SIMPLEFOG.onoff'),
        icon: 'fas fa-eye',
        onClick: () => {
          canvas.simplefog.toggle();
          canvas.sight.refresh();
        },
        active: canvas.simplefog?.visible,
        toggle: true,
      },
      {
        name: 'brush',
        title: game.i18n.localize('SIMPLEFOG.brushTool'),
        icon: 'fas fa-paint-brush',
      },
      {
        name: 'grid',
        title: game.i18n.localize('SIMPLEFOG.gridTool'),
        icon: 'fas fa-border-none',
      },
      {
        name: 'polygon',
        title: game.i18n.localize('SIMPLEFOG.polygonTool'),
        icon: 'fas fa-draw-polygon',
      },
      {
        name: 'box',
        title: game.i18n.localize('SIMPLEFOG.boxTool'),
        icon: 'far fa-square',
      },
      {
        name: 'ellipse',
        title: game.i18n.localize('SIMPLEFOG.ellipseTool'),
        icon: 'far fa-circle',
      },
      // {
      //   name: "image",
      //   title: "Image Tool",
      //   icon: "far fa-image",
      // },
      {
        name: 'sceneConfig',
        title: game.i18n.localize('SIMPLEFOG.sceneConfig'),
        icon: 'fas fa-cog',
        onClick: () => {
          new SimplefogConfig().render(true);
        },
        button: true,
      },
      {
        name: 'clearfog',
        title: game.i18n.localize('SIMPLEFOG.reset'),
        icon: 'fas fa-trash',
        onClick: () => {
          const dg = new Dialog({
            title: game.i18n.localize('SIMPLEFOG.reset'),
            content: game.i18n.localize('SIMPLEFOG.confirmReset'),
            buttons: {
              reset: {
                icon: '<i class="fas fa-trash"></i>',
                label: 'Reset',
                callback: () => canvas.simplefog.resetMask(),
              },
              blank: {
                icon: '<i class="fas fa-eye"></i>',
                label: 'Blank',
                callback: () => canvas.simplefog.blankMask(),
              },
              cancel: {
                icon: '<i class="fas fa-times"></i>',
                label: 'Cancel',
              },
            },
            default: 'reset',
          });
          dg.render(true);
        },
        button: true,
      },
    ],
    activeTool: 'brush',
  });
});

/**
 * Handles adding the custom brush controls pallet
 * and switching active brush flag
 */
Hooks.on('renderSceneControls', (controls) => {
  // Switching to layer
  if (canvas.simplefog != null) {
    if (controls.activeControl == 'simplefog' && controls.activeTool != undefined) {
      // Open brush tools if not already open
      if (!$('#simplefog-brush-controls').length) new BrushControls().render(true);
      // Set active tool
      const tool = controls.controls.find((control) => control.name === 'simplefog').activeTool;
      canvas.simplefog.setActiveTool(tool);
    }
    // Switching away from layer
    else {
      // Clear active tool
      canvas.simplefog.clearActiveTool();
      // Remove brush tools if open
      const bc = $('#simplefog-brush-controls');
      if (bc) bc.remove();
    }
  }
});

/**
 * Sets Y position of the brush controls to account for scene navigation buttons
 */
function setBrushControlPos() {
  const bc = $('#simplefog-brush-controls');
  if (bc) {
    const h = $('#navigation').height();
    bc.css({ top: `${h + 30}px` });
  }
}

// Reset position when brush controls are rendered or sceneNavigation changes
Hooks.on('renderBrushControls', setBrushControlPos);
Hooks.on('renderSceneNavigation', setBrushControlPos);
