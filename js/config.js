/*
 * Global SimpleFog Configuration Options
 */

export default [
  {
    name: 'test',
    data: {
      name: 'Test Setting',
      scope: 'world',
      type: Number,
      default: 0.6,
      range: {
        min: 0,
        max: 1,
        step: 0.05,
      },
      config: true,
      onChange: () => { canvas.draw(); },
    },
  },
];
