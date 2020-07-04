
Hooks.on("getSceneControlButtons", (controls) => {
    if (game.user.isGM) {
      controls.push({
        name: "simplefog",
        title: "CONTROLS.SimpleFog",
        icon: "fas fa-cloud",
        layer: "SimpleFogLayer",
        tools: [
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
  