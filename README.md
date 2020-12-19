# Simplefog
A module for [FoundryVTT](https://foundryvtt.com) that lets you draw fog of war manually.

# Update
This is a continuation of SimpleFog, created by Vance. This is now beinng maintained under this fork with his permission. This was under the MIT license and continues to be so.

# ChangeLog

## 0.1.16
* Added ability to set whether fog is automatically enabled. Look at the bottom of the settings panel. Make sure to "Set current setttings to default" so it uses those settings by default ever time you create a a new scene.
* Added Japanese localization. Thanks touge!

## 0.1.15 
* Added the ability to optionally add an image over the fog!

### Installation
Use the following manifest URL to install this fork of the original module after you have uninstalled the original module.
```
https://raw.githubusercontent.com/League-of-Foundry-Developers/simplefog/master/module.json
```

## Feature overview video
[![Feature Overview](https://img.youtube.com/vi/gTt6FDQ7iQA/hqdefault.jpg)](https://www.youtube.com/watch?v=gTt6FDQ7iQA)

Encounter Library did a review of Simplefog which explains how it works much better than I can, please check it out if you would like an idea how this module works.

## Features
- Simplefog implements a manual fog of war layer above the core vision layer
  - Enable and disable the simplefog layer at any time, per scene
  - This allows you to use both Simplefog AND the core vision for line of sight, or alternatively use only one or the other, on a scene by scene basis
- Tokens can be automatically hidden and revealed when underneath Simplefog with a configurable opacity threshold
- Implements a history system so you can easily undo your actions
- Various drawing tools for drawing and erasing fog of war manually
  - Brush tool
    - Hotkeys for quickly changing brush size [ ]
  - Rectangle & Ellipse tool
    - Hold shift to force equal width & height while drawing
  - Polygon Shape tool
    - Click the orange handle to finish your drawing, or right click to cancel
  - Grid tool
    - Reveals any grid square you drag across, works for both Hex and Square grids
- Add an image to the Simplefog layer which overlays the selected tint for both GMs and Players.

![Tools Palette](docs/simplefog-tools.jpg?raw=true "Tools Palette")

## Scene Configuration
Allows you to set various options which affect the entire layer for the current scene
- Set an image overlay for the fog on both player and GM screens.
- Set the opacity of the entire fog layer for both players and GMs
- Animate transitions in opacity, allowing for effects such as "Fade to Black"
- Change tint of the fog for both player and GM, for example to indicate a green poison cloud
- Apply a blur filter for soft edges to fog
- Enable or disable the automatic vision feature
- Save your settings as the new default when creating a scene

![Scene Configuration Screenshot](docs/simplefog-options.png?raw=true "Scene Config")

## Planned Future Features
- More AutoVisibility options:
  - Reveal based on center of token
  - Reveal only if entire token visible
  - Reveal if any part of token is visible
- Brush Smoothing / Interpolation
- Sepia / monochrome filters
- Add indicator icon of player controlled icons hidden under fog
- Currently incompatible with the module "GM Scene Background" when a GM layer is active

# Bugs and Feature Requests
Please create a github issue on this repository.
