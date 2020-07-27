/*
 * Global SimpleFog Configuration Options
 */

// // Todo: most of these should be config vars
// const gmAlphaDefault = 0.6;
// const gmTintDefault = '0x000000';
// const playerAlphaDefault = 1;
// const playerTintDefault = '0x000000';
// const transitionDefault = true;
// const transitionSpeedDefault = 800;
// const previewFill = 0x00ffff;
// const HANDLEFILL = 0xff6400;
// const HANDLESIZE = 20;
// const previewAlpha = 0.4;
// const defaultBlurRadius = 0;
// const defaultBlurQuality = 2;
// const defaultBrushSize = 50;

export default [
  {
    name: 'gm_alpha',
    data: {
      name: 'Default GM Fog Opacity',
      hint: 'The default master layer opacity for GM players',
      scope: 'world',
      type: Number,
      default: 0.6,
      config: true,
      onChange: () => { canvas.draw(); },
    },
  },
  {
    name: 'player_alpha',
    data: {
      name: 'Default Player Fog Opacity',
      hint: 'The default master layer opacity for non-GM players',
      scope: 'world',
      type: Number,
      default: 1,
      config: true,
      onChange: () => { canvas.draw(); },
    },
  },
];
