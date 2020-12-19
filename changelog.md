## 0.1.16
* Added ability to set whether fog is automatically enabled. Look at the bottom of the settings panel. Make sure to "Set current setttings to default" so it uses those settings by default ever time you create a a new scene.
* Added Japanese localization. Thanks touge!

## 0.1.15 
* Added the ability to optionally add an image over the fog!

## 0.1.11 - 1.1.14
* Compatibility fixes.

## 0.1.10
* Fixes issue where migrations caused error when trying to update old fog data
* Fixes issue where grid drawing on hex grids would occassionally get stuck on certain coordinates

## 0.1.9
* Should fix the issue where fog would randomly reset under certain rare circumstances
* Adds option to blank the fog when resetting (i.e. reset to completely revealed state)
* Some more performance optimizations
* Prevent [ ] from activating when focus is not game board

## 0.1.8
* Fixes issue where shift + negative rect brush direction did not work properly
* Fixes issue where brush controls could become hidden under long lists of active scenes
* Fixes issue where hex grid detection was slightly inaccurate near corners
* Implements more efficient data storage which should reduce size of db data

## 0.1.7
* Fixes issue where brush tool labels were reversed
* Fixes issue where quickly clicking brush tool could cause a race condition resulting in fog being reset 

## 0.1.6
* Adds localization support
* Fixes bug where undo was not working correctly

## 0.1.5
* Significantly optimized the autovisibility feature which should make it useable on any size map with little performance impact
* Improvements to the fog storage data which should reduce the impact on scene database file size

## 0.1.4
* Fixes issue where players could receive warnings about not having permissions to edit scene
* Fixes incompatibility with various modules and systems, if you still encounter problems please let me know

## 0.1.3
* Fixes a rather nasty memory leak, thanks to @ruipin for pointing out the possibility for this to occur.
* The simplefog renderable texture will now scale resolution to allow for very large (> 16000x16000) scenes to work properly, albeit at a slightly reduced fog quality
* Players will now maintain control over their own token when moving into simplefog when autovisibility is enabled

## 0.1.2
* Allows AutoVisibility to be disabled for GM players while still enabled for players

## 0.1.1
* Fixes a compatibility issue with various modules that affect the layer stack

## 0.1.0
* Initial release