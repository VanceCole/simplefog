import SimplefogConfig from '../classes/SimplefogConfig.js';
import BrushControls from '../classes/BrushControls.js';

/**
 * Add control buttons
 */
Hooks.on('getSceneControlButtons', (controls) => {
  if (game.user.isGM) {
    controls.push({
      name: 'simplefog',
      title: game.i18n.localize('SIMPLEFOG.sf'),
      icon: 'fas fa-cloud',
      layer: 'SimplefogLayer',
      tools: [
        {
          name: 'simplefogtoggle',
          title: game.i18n.localize('SIMPLEFOG.onoff'),
          icon: 'fas fa-eye',
          onClick: () => {
            canvas.simplefog.toggle();
            canvas.sight.update();
          },
          active: canvas.simplefog.visible,
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
          name: 'shape',
          title: game.i18n.localize('SIMPLEFOG.shapeTool'),
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
            Dialog.confirm({
              title: game.i18n.localize('SIMPLEFOG.reset'),
              content: game.i18n.localize('SIMPLEFOG.confirmReset'),
              yes: () => {
                canvas.simplefog.resetMask();
              },
              defaultYes: true,
            });
          },
          button: true,
        },
      ],
      activeTool: 'brush',
    });
  }
});

/**
 * Handles adding the custom brush controls pallet
 * and switching active brush flag
 */
Hooks.on('renderSceneControls', (controls) => {
  if (controls.activeControl === 'simplefog') {
    // Open brush tools if not already open
    if (!$('#simplefog-brush-controls').length) new BrushControls().render(true);
    // Set active tool
    const tool = controls.controls.find((control) => control.name === 'simplefog').activeTool;
    canvas.simplefog.setActiveTool(tool);
  } else {
    // Clear active tool
    canvas.simplefog.clearActiveTool();
    // Remove brush tools if open
    const bc = $('#simplefog-brush-controls');
    if (bc) bc.remove();
  }
});

function setBrushControlPos() {
  const bc = $('#simplefog-brush-controls');
  if (bc) {
    const h = $('#navigation').height();
    bc.css({ top: `${h + 30}px` });
  }
}

Hooks.on('renderBrushControls', setBrushControlPos);
Hooks.on('renderSceneNavigation', setBrushControlPos);
