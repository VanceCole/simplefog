
Hooks.on("getSceneControlButtons", (controls) => {
    if (game.user.isGM) {
      controls.push({
        name: "simplefog",
        title: "CONTROLS.SimpleFog",
        icon: "fas fa-cloud",
        layer: "SimpleFogLayer",
        tools: [
          {
            name: "brush",
            title: "Brush Tool",
            icon: "fas fa-paint-brush",
            onClick: () => {
              console.log('Brush');
            },
            button: true
          },
          {
            name: "shape",
            title: "Shape Tool",
            icon: "far fa-star",
            onClick: () => {
              console.log('Shape');
            },
            button: true
          },
          {
            name: "box",
            title: "Box Tool",
            icon: "far fa-square",
            onClick: () => {
              console.log('Box');
            },
            button: true
          },
          {
            name: "circle",
            title: "Circle Tool",
            icon: "far fa-circle",
            onClick: () => {
              console.log('Circle');
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
            title: "CONTROLS.ClearFog",
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
      });
    }
  });
  