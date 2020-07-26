# Allows manual drawing of fog of war
Lets you draw fog of war manually

# todo
- Hide token/doors/other interactables under fog
- ~~Brush sizes~~
- ~~Brush/tool + - & .5~~
- ~~Handle canvas resize~~
- ~~Fog Color & Opacity~~
- ~~Box Shape~~
- ~~Circle Shape~~
- ~~Poly Shape~~
- ~~Undo~~
- ~~refactor mask layer to its own class to be reusable~~
- ~~Grid snap brush~~
- ~~Hex grid snap brush~~
- ~~Optimization~~
- Allow cancel of current drawing via right click while dragging ?
-- ~~Implemented for shape tool~~
- ~~Blur~~
- Mouse cursor tool indications
- Documentation
- Shift / ctrl shape tool modifiers
- ~~Blur filter should recalcuate pixel width to maintain consistency with zoom level~~
- Keybindings for changing brush size

- Config window
-- Custom default tint/opacity

# bugs
- sometimes hex grid tool stops drawing certain hexes
- ~~error when activating scene with no player token~~
- ~~create a light, use mask brush tool, blank journal entries will be created~~
- ~~preview shapes cannot be seen on full opacity black fog~~
- ~~Switching scenes dupes mouse listeners~~

# future features
- Opacity indactors on brush previews - red / green / grey for hide / show / 50% etc
- Brush Smoothing / Interpolation
- Image based fog import
- localizations
- sepia / monochrome filters
- Allow revealing core dynamic fog to the "explored" state, while retaining active line of sight fog as underlay