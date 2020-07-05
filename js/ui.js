
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
          onClick: canvas.simplefog.toggle,
          active: canvas.scene.getFlag('simplefog','visible'),
          toggle: true
        },
        {
          name: "brush",
          title: "Brush Tool",
          icon: "fas fa-paint-brush",
          onClick: (e) => {
            // Todo: this should be disabled when switching tools
            canvas.simplefog.on('pointerdown', canvas.simplefog.pointerDown);
            canvas.simplefog.on('pointerup', canvas.simplefog.pointerUp);
            canvas.simplefog.on('pointermove', canvas.simplefog.pointerMove);
          },
        },
        {
          name: "shape",
          title: "Shape Tool",
          icon: "far fa-star",
        },
        {
          name: "box",
          title: "Box Tool",
          icon: "far fa-square",
        },
        {
          name: "circle",
          title: "Circle Tool",
          icon: "far fa-circle",
        },
        {
          name: "settings",
          title: "Settings",
          icon: "fa fa-cog",
          onClick: () => {
            console.log('Settings');
          },
          button: true
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
                console.log("Placeholder for clearing fog");
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