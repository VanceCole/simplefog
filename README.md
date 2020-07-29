# Simplefog
A module for [FoundryVTT](https://foundryvtt.com) that lets you draw fog of war manually.

## Feature overview video
[![Feature Overview](docs/video-screenshot.jpg?raw=true)](https://www.youtube.com/watch?v=i7iRUUvw2QA)

## Features
- Simplefog implements a manual fog of war layer above the core vision layer
  - Enable and disable the simplefog layer at any time, per scene
  - This allows you to use both Simplefog AND the core vision for line of sight, or alternatively use only one or the other, on a scene by scene basis
- Tokens can be automatically hidden and revealed when underneath Simplefog with a configurable opacity threshold
- Implements a history system so you can easily undo your actions
- Various drawing tools for drawing and erasing fog of war manually
  - Brush tool
  - Rectangle & Ellipse tool
    - Hold shift to force equal width & height while drawing
  - Polygon Shape tool
    - Click the orange handle to finish your drawing, or right click to cancel
  - Grid tool
    - Automatically reveals any grid square you drag across, works for both Hex and Square grids
![Tools Palette](docs/simplefog-tools.jpg?raw=true "Tools Palette")

## Scene Configuration
Allows you to set various options which affect the entire layer for the current scene
- Set the opacity of the entire fog layer for both players and GMs
- Animate transitions in opacity, allowing for effects such as "Fade to Black"
- Change tint of the fog for both player and GM, for example to indicate a green poison cloud
- Apply a blur filter for soft edges to fog
- Enable or disable the automatic vision feature
- Save your settings as the new default when creating a scene
![Scene Configuration Screenshot](docs/simplefog-options.png?raw=true "Scene Config")

## Known Bugs
- Sometimes hex grid tool stops drawing certain hexes, releasing mouse button and drawing again fixes this as a workaround
- Right click to cancel during draw for ellipse / box tool does not respond to event

## Future Features
- More AutoVisibility options:
  - Only hide for players and not GM option
  - Reveal based on center of token
  - Reveal only if entire token visible
  - Reveal if any part of token is visible
- Brush Smoothing / Interpolation
- Image based fog import
- Localizations
- Sepia / monochrome filters
- Allow revealing core dynamic fog to the "explored" state, while retaining active line of sight fog as underlay
- Hold shift when clicking trash icon to erase all fog instead of resetting to black

# Bugs and Feature Requests
Please ping me on discord @vance#1935