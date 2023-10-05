![GitHub release (latest SemVer)](https://img.shields.io/github/v/release/League-of-Foundry-Developers/simplefog) ![GitHub Releases](https://img.shields.io/github/downloads/League-of-Foundry-Developers/simplefog/latest/total) ![GitHub Releases](https://img.shields.io/github/downloads/League-of-Foundry-Developers/simplefog/total) ![Forge Installs](https://img.shields.io/badge/dynamic/json?label=Forge%20Installs&query=package.installs&suffix=%25&url=https%3A%2F%2Fforge-vtt.com%2Fapi%2Fbazaar%2Fpackage%2Fsimplefog&colorB=4aa94a) ![Foundry Version](https://img.shields.io/endpoint?url=https://foundryshields.com/version?url=https%3A%2F%2Fgithub.com%2FLeague-of-Foundry-Developers%2Fsimplefog%2Freleases%2Flatest%2Fdownload%2Fmodule.json)

![Latest Release Download Count](https://img.shields.io/github/downloads/League-of-Foundry-Developers/simplefog/latest/module.zip?color=2b82fc&label=DOWNLOADS&style=for-the-badge) [![Forge Installs](https://img.shields.io/badge/dynamic/json?label=Forge%20Installs&query=package.installs&suffix=%25&url=https%3A%2F%2Fforge-vtt.com%2Fapi%2Fbazaar%2Fpackage%2Fsimplefog&colorB=006400&style=for-the-badge)](https://forge-vtt.com/bazaar#package=simplefog) ![Foundry Core Compatible Version](https://img.shields.io/badge/dynamic/json.svg?url=https%3A%2F%2Fraw.githubusercontent.com%2FLeague-of-Foundry-Developers%2Fsimplefog%2Fmaster%2Fsrc%2Fmodule.json&label=Foundry%20Version&query=$.compatibility.verified&colorB=orange&style=for-the-badge) ![Latest Version](https://img.shields.io/badge/dynamic/json.svg?url=https%3A%2F%2Fraw.githubusercontent.com%2FLeague-of-Foundry-Developers%2Fsimplefog%2Fmaster%2Fsrc%2Fmodule.json&label=Latest%20Release&prefix=v&query=$.version&colorB=red&style=for-the-badge) [![Foundry Hub Endorsements](https://img.shields.io/endpoint?logoColor=white&url=https%3A%2F%2Fwww.foundryvtt-hub.com%2Fwp-json%2Fhubapi%2Fv1%2Fpackage%2Fsimplefog%2Fshield%2Fendorsements&style=for-the-badge)](https://www.foundryvtt-hub.com/package/simplefog/) ![GitHub all releases](https://img.shields.io/github/downloads/League-of-Foundry-Developers/simplefog/total?style=for-the-badge)

[![Translation status](https://weblate.foundryvtt-hub.com/widgets/simplefog/-/287x66-black.png)](https://weblate.foundryvtt-hub.com/engage/simplefog/)

# Simplefog
A module for [FoundryVTT](https://foundryvtt.com) that lets you draw fog of war manually.

## Installation

It's always easiest to install modules from the in game add-on browser.

To install this module manually:
1.  Inside the Foundry "Configuration and Setup" screen, click "Add-on Modules"
2.  Click "Install Module"
3.  In the "Manifest URL" field, paste the following url:
`https://raw.githubusercontent.com/League-of-Foundry-Developers/simplefog/master/src/module.json`
4.  Click 'Install' and wait for installation to complete
5.  Don't forget to enable the module in game using the "Manage Module" button

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

## Api

# Build

## Install all packages

```bash
npm install
```
## npm build scripts

### build

will build the code and copy all necessary assets into the dist folder and make a symlink to install the result into your foundry data; create a
`foundryconfig.json` file with your Foundry Data path.

```json
{
  "dataPath": "~/.local/share/FoundryVTT/"
}
```

`build` will build and set up a symlink between `dist` and your `dataPath`.

```bash
npm run-script build
```

### NOTE:

You don't need to build the `foundryconfig.json` file you can just copy the content of the `dist` folder on the module folder under `modules` of Foundry

### build:watch

`build:watch` will build and watch for changes, rebuilding automatically.

```bash
npm run-script build:watch
```

### clean

`clean` will remove all contents in the dist folder (but keeps the link from build:install).

```bash
npm run-script clean
```

### prettier-format

`prettier-format` launch the prettier plugin based on the configuration [here](./.prettierrc)

```bash
npm run-script prettier-format
```

### package

`package` generates a zip file containing the contents of the dist folder generated previously with the `build` command. Useful for those who want to manually load the module or want to create their own release

```bash
npm run-script package
```

## [Changelog](./changelog.md)

## Issues

Any issues, bugs, or feature requests are always welcome to be reported directly to the [Issue Tracker](https://github.com/p4535992/foundryvtt-final-blow/issues ), or using the [Bug Reporter Module](https://foundryvtt.com/packages/bug-reporter/).

## License

This package is under an [MIT license](LICENSE) and the [Foundry Virtual Tabletop Limited License Agreement for module development](https://foundryvtt.com/article/license/).
## Credit

- This is a continuation of SimpleFog, created by Vance. This is now being maintained under this fork with his permission. This was under the MIT license and continues to be so.
