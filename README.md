# Allows manual drawing of fog of war
Lets you draw fog of war manually

# todo
- ~~Brush sizes~~
- ~~Brush/tool + - & .5~~
- ~~Handle canvas resize~~
- ~~Fog Color & Opacity~~
- ~~Box Shape~~
- ~~Circle Shape~~
- ~~Poly Shape~~
- Image based fog import
- ~~Undo~~
- ~~refactor mask layer to its own class to be reusable~~
- Hide token cursors under fog(?)
- Core fog sync option(?) (Clamp lighting mask?)
- ~~Grid snap brush~~
- ~~Hex grid snap brush~~
- ~~Optimization~~
- Brush Smoothing / Interpolation
- Allow custom default tint/opacity
- Square brushes?
- Allow revealing core dynamic fog to the "explored" state, while retaining active line of sight fog as underlay
- Allow cancel of current drawing via right click while dragging ?
- ~~Blur~~ / sepia / monochrome filters?
- Mouse cursor tool indications
- Documentation
- Shift / ctrl shape tool modifiers
- Blur filter should recalcuate pixel width to maintain consistency with zoom level
- Keybindings for changing brush size

# bugs
- error when activating scene with no player token
- sometimes hex grid tool stops drawing certain hexes