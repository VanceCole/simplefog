import { SimplefogConfig } from "../classes/SimplefogConfig.js";
import { SimplefogBrushControls } from "../classes/SimplefogBrushControls.js";

/**
 * Add control buttons
 */
Hooks.on("getSceneControlButtons", (controls) => {
  if (game.user.isGM) {
    controls.push({
      name: "simplefog",
      title: "Simple Fog",
      icon: "fas fa-cloud",
      layer: "SimpleFogLayer",
      tools: [
        {
          name: "simplefogtoggle",
          title: "Enable/Disable Simple Fog",
          icon: "fas fa-eye",
          onClick: () => {
            canvas.simplefog.toggle()
          },
          active: canvas.simplefog.visible,
          toggle: true
        },
        {
          name: "brush",
          title: "Brush Tool",
          icon: "fas fa-paint-brush"
        },
        {
          name: "grid",
          title: "Grid Tool",
          icon: "fas fa-border-none",
        },
        {
          name: "shape",
          title: "Shape Tool",
          icon: "fas fa-draw-polygon",
        },
        {
          name: "box",
          title: "Box Tool",
          icon: "far fa-square",
        },
        {
          name: "ellipse",
          title: "Ellipse Tool",
          icon: "far fa-circle",
        },
        {
          name: "image",
          title: "Image Tool",
          icon: "far fa-image",
        },
        {
          name: "sceneConfig",
          title: "Scene Configuration",
          icon: "fas fa-cog",
          onClick: () => {
            new SimplefogConfig().render(true);
          },
          button: true,
        },
        {
          name: "clearfog",
          title: "Clear Simple Fog",
          icon: "fas fa-trash",
          onClick: () => {
            Dialog.confirm({
              title: "Reset Simple Fog",
              content: "Are you sure? Fog of war will be reset.",
              yes: () => {
                canvas.simplefog.resetFog();
              },
              defaultYes: true,
            });
          },
          button: true,
        },
      ],
      activeTool: 'brush'
    });
  }
});

/**
 * Handles adding the custom brush controls pallet
 */
Hooks.on("renderSceneControls", (controls, domObj, scene) => {
  if(controls.activeControl == 'simplefog') {
    if($('#simplefog-brush-controls').length) return;
    new SimplefogBrushControls().render(true);
  } else {
    let sf = $('#simplefog-brush-controls');
    if (sf) sf.remove();
  }
});
