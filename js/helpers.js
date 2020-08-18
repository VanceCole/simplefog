/**
 * Converts web colors to base 16
 * @param n {Hex}               Web format color, f.x. #FF0000
 * @return {Hex}                Base 16 format color, f.x. 0xFF0000
 */
export function webToHex(n) {
  return n.replace('#', '0x');
}

/**
 * Converts a base16 color into a web color
 * @param n {Hex}               Base 16 Color, f.x. 0xFF0000
 * @return {Hex}                Web format color, f.x. #FF0000
 */
export function hexToWeb(n) {
  return (`${n}`).replace('0x', '#');
}

/**
 * Converts a hexadecimal color to an integer percentage
 * @param n {Hex}               Base 16 Color, f.x. 0x000000
 * @return {Integer}             f.x 0
 */
export function hexToPercent(n) {
  return Math.ceil(n / 0xFFFFFF * 100);
}

/**
 * Converts an integer percent (0-100) to a hexadecimal greyscale color
 * @param n {Number}            0-100 numeric input
 * @return {Hex}                Base 16 format color, f.x. 0xFFFFFF
 */
export function percentToHex(n) {
  let c = Math.ceil(n * 2.55).toString(16);
  if (c.length === 1) c = `0${c}`;
  c = `0x${c}${c}${c}`;
  return c;
}

/**
 * Converts an object containing coordinate pair arrays into a single array of points for PIXI
 * @param hex {Object}  An object containing a set of [x,y] pairs
 */
export function hexObjsToArr(hex) {
  const a = [];
  hex.forEach((point) => {
    a.push(point.x);
    a.push(point.y);
  });
  // Append first point to end of array to complete the shape
  a.push(hex[0].x);
  a.push(hex[0].y);
  return a;
}

/**
 * Dumps a render of a given pixi container or texture to a new tab
 */
export function pixiDump(tgt = null) {
  canvas.app.render();
  const data = canvas.app.renderer.extract.base64(tgt);
  const win = window.open();
  win.document.write(`<img src='${data}'/>`);
}

/**
 * Checks if an array of arrays contains an equivalent to the given array
 * @param arrayOfArrays {Array} Haystack
 * @param array {Array}         Needle
 */
export function doesArrayOfArraysContainArray(arrayOfArrays, array) {
  const aOA = arrayOfArrays.map((arr) => arr.slice());
  const a = array.slice(0);
  for (let i = 0; i < aOA.length; i += 1) {
    if (aOA[i].sort().join(',') === a.sort().join(',')) {
      return true;
    }
  }
  return false;
}

/**
 * Prints formatted console msg if string, otherwise dumps object
 * @param data {String | Object} Output to be dumped
 * @param force {Boolean}        Log output even if CONFIG.debug.simplefog = false
 */
export function simplefogLog(data, force = false) {
  if (CONFIG.debug.simplefog || force) {
    // eslint-disable-next-line no-console
    if (typeof data === 'string') console.log(`Simplefog | ${data}`);
    // eslint-disable-next-line no-console
    else console.log(data);
  }
}

/**
 * Gets a single pixel of texture data from GPU
 * @param target {Object} PIXI Object to read from
 * @param x {Integer}     X Position to read
 * @param y {Integer}     Y Position to read
 */
export function readPixel(target, x = 0, y = 0) {
  const { renderer } = canvas.app;
  let resolution;
  let frame;
  let renderTexture;
  let generated = false;
  if (target) {
    if (target instanceof PIXI.RenderTexture) {
      renderTexture = target;
    } else {
      renderTexture = renderer.generateTexture(target);
      generated = true;
    }
  }
  if (renderTexture) {
    resolution = renderTexture.baseTexture.resolution;
    frame = renderTexture.frame;
    // bind the buffer
    renderer.renderTexture.bind(renderTexture);
  } else {
    resolution = renderer.resolution;
    frame = TEMP_RECT;
    frame.width = renderer.width;
    frame.height = renderer.height;
    renderer.renderTexture.bind(null);
  }
  const pixel = new Uint8Array(4);
  // read pixels to the array
  const { gl } = renderer;
  gl.readPixels(x * resolution, y * resolution, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
  if (generated) {
    renderTexture.destroy(true);
  }
  return pixel;
}
