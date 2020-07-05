
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
          toggle: true
        },
        {
          name: "brush",
          title: "Brush Tool",
          icon: "fas fa-paint-brush",
          onClick: (e) => {
            ui.controls.controls.find( n => n.name == "simplefog" ).activeTool = "brush";
            ui.controls.render();
            // Todo: this should be disabled when switching tools
            canvas.simplefog.on('pointerdown', canvas.simplefog.pointerDown);
            canvas.simplefog.on('pointerup', canvas.simplefog.pointerUp);
            canvas.simplefog.on('pointermove', canvas.simplefog.pointerMove);
          },
          button: true
        },
        {
          name: "shape",
          title: "Shape Tool",
          icon: "far fa-star",
          onClick: () => {
            ui.controls.controls.find( n => n.name == "simplefog" ).activeTool = "shape";
            ui.controls.render();
          },
          button: true
        },
        {
          name: "box",
          title: "Box Tool",
          icon: "far fa-square",
          onClick: () => {
            ui.controls.controls.find( n => n.name == "simplefog" ).activeTool = "box";
            ui.controls.render();
          },
          button: true
        },
        {
          name: "circle",
          title: "Circle Tool",
          icon: "far fa-circle",
          onClick: () => {
            ui.controls.controls.find( n => n.name == "simplefog" ).activeTool = "circle";
            ui.controls.render();
          },
          button: true
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
  