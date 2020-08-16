/*
 * Global SimpleFog Configuration Options
 */

export default [
  {
    name: 'migrationVersion',
    data: {
      name: 'Simplefog Migration Version',
      scope: 'world',
      config: false,
      type: Number,
      default: 0,
    },
  },
  // {
  //   name: 'test',
  //   data: {
  //     name: 'Test Setting',
  //     scope: 'world',
  //     type: Number,
  //     default: 0.6,
  //     range: {
  //       min: 0,
  //       max: 1,
  //       step: 0.05,
  //     },
  //     config: true,
  //     onChange: () => { canvas.draw(); },
  //   },
  // },
];
