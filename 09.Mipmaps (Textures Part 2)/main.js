(async function (){
  /**
   * @type {HTMLCanvasElement}
   */
  const canvas = document.querySelector('#myCanvas');
  const gl = canvas.getContext('webgl2');
  
  const program = gl.createProgram();

  const vertexShaderSource = (
    `#version 300 es
    precision highp float;
    layout(location = 1) in highp vec3 aSquareCoords;
    layout(location = 2) in highp vec2 aTexCoords;
    uniform mat4 uMVP;
    out highp vec2 vTexCoords;
    void main()
    {
      gl_Position = uMVP * vec4(aSquareCoords, 1.0);
      vTexCoords = aTexCoords;
    }`
  );
  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, vertexShaderSource);
  gl.compileShader(vertexShader);
  gl.attachShader(program, vertexShader);

  const fragmentShaderSource = (
    `#version 300 es
    precision mediump float;
    in highp vec2 vTexCoords;
    uniform sampler2D uSampler;
    out mediump vec4 fragColor;
    void main ()
    {
      fragColor = texture(uSampler, vTexCoords);
    }`
  );
  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader, fragmentShaderSource);
  gl.compileShader(fragmentShader);
  gl.attachShader(program, fragmentShader);
      
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.log(gl.getShaderInfoLog(vertexShader));
    console.log(gl.getShaderInfoLog(fragmentShader));
  }
  gl.useProgram(program);

  const aSquareCoordsLocation = 1;

  // Upload MVP to uniform
  const uMVPLocation = gl.getUniformLocation(program, 'uMVP');
  gl.uniformMatrix4fv(uMVPLocation, false, makeMVPForCanvas(canvas));

  const setTexCoordAttribute = (v) => {
    const aTexCoordsData = new Float32Array([
      0,0,     0,v,     v,v,
      0,0,     v,v,     v,0,
    ]);
    const aTexCoordsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, aTexCoordsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, aTexCoordsData, gl.STATIC_DRAW);
    const aTexCoordsLocation = 2;
    gl.vertexAttribPointer(aTexCoordsLocation, 2, gl.FLOAT, false, 8, 0);
    gl.enableVertexAttribArray(aTexCoordsLocation);
  };

  const legoImage = await loadImage('https://raw.githubusercontent.com/evpozdniakov/WebGL-2.0/refs/heads/main/09.Mipmaps%20(Textures%20Part%202)/lego.png');
  const legoTextureUnit = 4;
  gl.activeTexture(gl.TEXTURE0 + legoTextureUnit);
  const legoTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, legoTexture);

  const gridImage = getGridImage();
  const gridTextureUnit = 5;
  gl.activeTexture(gl.TEXTURE0 + gridTextureUnit);
  const gridTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, gridTexture);
  // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  /**
   * @type {HTMLInputElement}
   */
  const colorfulLevelsCheckbox = document.querySelector('[name=colorfulLevels]');
  /**
   * @type {HTMLInputElement}
   */
  const useGridTextureRadio = document.querySelector('[name=texture][value=grid]');
  const setTextureImageAndLevels = () => {
    if (useGridTextureRadio.checked) {
      gl.bindTexture(gl.TEXTURE_2D, gridTexture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 32, 32, 0, gl.RGB, gl.UNSIGNED_BYTE, gridImage);
      gl.generateMipmap(gl.TEXTURE_2D);
      if (colorfulLevelsCheckbox.checked) {
        gl.texImage2D(gl.TEXTURE_2D, 1, gl.RGB, 16, 16, 0, gl.RGB, gl.UNSIGNED_BYTE, getPixelTexture(16, [0, 1, 1]));
        gl.texImage2D(gl.TEXTURE_2D, 2, gl.RGB, 8, 8, 0, gl.RGB, gl.UNSIGNED_BYTE, getPixelTexture(8, [0, 1, 0]));
        gl.texImage2D(gl.TEXTURE_2D, 3, gl.RGB, 4, 4, 0, gl.RGB, gl.UNSIGNED_BYTE, getPixelTexture(4, [1, 1, 0]));
        gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
        gl.texImage2D(gl.TEXTURE_2D, 4, gl.RGB, 2, 2, 0, gl.RGB, gl.UNSIGNED_BYTE, getPixelTexture(2, [1, 0.5, 0]));
        gl.texImage2D(gl.TEXTURE_2D, 5, gl.RGB, 1, 1, 0, gl.RGB, gl.UNSIGNED_BYTE, getPixelTexture(1, [1, 0, 0]));
      }
    }
    else {
      gl.bindTexture(gl.TEXTURE_2D, legoTexture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 512, 512, 0, gl.RGB, gl.UNSIGNED_BYTE, legoImage);
      gl.generateMipmap(gl.TEXTURE_2D);
      if (colorfulLevelsCheckbox.checked) {
        gl.texImage2D(gl.TEXTURE_2D, 2, gl.RGB, 128, 128, 0, gl.RGB, gl.UNSIGNED_BYTE, getPixelTexture(128, [0, 1, 0]));
        gl.texImage2D(gl.TEXTURE_2D, 3, gl.RGB, 64, 64, 0, gl.RGB, gl.UNSIGNED_BYTE, getPixelTexture(64, [1, 1, 0]));
        gl.texImage2D(gl.TEXTURE_2D, 4, gl.RGB, 32, 32, 0, gl.RGB, gl.UNSIGNED_BYTE, getPixelTexture(32, [1, 0.5, 0]));
        gl.texImage2D(gl.TEXTURE_2D, 5, gl.RGB, 16, 16, 0, gl.RGB, gl.UNSIGNED_BYTE, getPixelTexture(16, [1, 0, 0]));
      }
    }
  }
  setTextureImageAndLevels();
  colorfulLevelsCheckbox.addEventListener('change', setTextureImageAndLevels);

  /**
   * @type {HTMLInputElement}
   */
  const minFilterLMLRadio = document.querySelector('[name=minFilter][value=LINEAR_MINMAP_LINEAR]');
  /**
   * @type {HTMLInputElement}
   */
  const minFilterLMNRadio = document.querySelector('[name=minFilter][value=LINEAR_MINMAP_NEAREST]');
  /**
   * @type {HTMLInputElement}
   */
  const minFilterNMLRadio = document.querySelector('[name=minFilter][value=NEAREST_MINMAP_LINEAR]');
  /**
   * @type {HTMLInputElement}
   */
  const minFilterNMNRadio = document.querySelector('[name=minFilter][value=NEAREST_MINMAP_NEAREST]');
  const setMinFilter = () => {
    switch (true) {
      case minFilterLMLRadio.checked:
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        break;
      case minFilterLMNRadio.checked:
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
        break;
      case minFilterNMLRadio.checked:
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
        break;
      case minFilterNMNRadio.checked:
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_NEAREST);
        break;
    }
  }
  setMinFilter();
  document.querySelectorAll('[name=minFilter]').forEach(i => i.addEventListener('change', setMinFilter));

  const uSamplerLocation = gl.getUniformLocation(program, 'uSampler');
  const useSelectedTexture = () => {
    setTextureImageAndLevels();
    if (useGridTextureRadio.checked) {
      gl.uniform1i(uSamplerLocation, gridTextureUnit);
      setTexCoordAttribute(8);
      setMinFilter();
    }
    else {
      gl.uniform1i(uSamplerLocation, legoTextureUnit);
      setTexCoordAttribute(1);
      setMinFilter();
    }
  }
  useSelectedTexture();
  document.querySelectorAll('[name=texture]').forEach(i => i.addEventListener('change', useSelectedTexture));

  const render = (time) => {
    const coords = getCoordsForTime(time);
    const aSquareCoordsData = new Float32Array(coords);
    const aSquareCoordsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, aSquareCoordsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, aSquareCoordsData, gl.STATIC_DRAW);
    gl.vertexAttribPointer(aSquareCoordsLocation, 3, gl.FLOAT, false, 12, 0);
    gl.enableVertexAttribArray(aSquareCoordsLocation);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    requestAnimationFrame(render);
  };

  requestAnimationFrame(render);
})();

function makeMVPForCanvas(canvas) {
  // Perspective projection
  const { mat4 } = window.glMatrix;
  const fov = Math.PI / 4;          // 45 degrees
  const aspect = canvas.width / canvas.height;
  const near = 0.1;
  const far = 500.0;
  const proj = mat4.create();
  mat4.perspective(proj, fov, aspect, near, far);

  // Camera (view matrix) looking at origin from (0, 0, 3)
  const view = mat4.create();
  mat4.lookAt(view, [0, 0, 3], [0, 0, 0], [0, 1, 0]);

  // Model (optional: identity)
  const model = mat4.create();

  // Final transformation: proj * view * model
  const mvp = mat4.create();
  mat4.multiply(mvp, proj, view);
  mat4.multiply(mvp, mvp, model);

  return mvp;
}

function loadImage(src) {
  return new Promise((resolve) => {
    const image = new Image();
    image.addEventListener('load', () => {
      resolve(image);
    });
    image.crossOrigin = 'anonymous';
    image.src = src;
  })
}

function getCoordsForTime(time) {
  const progress = time / 1000;
  const l = 2;
  const topLY = l * Math.sin(progress);
  const topRY = topLY;
  const btmLY = -topLY;
  const btmRY = -topRY;
  const topLZ = -2 - l*Math.cos(progress);
  const topRZ = -2 - l*Math.cos(progress);
  const btmLZ = -2 + l*Math.cos(progress);
  const btmRZ = -2 + l*Math.cos(progress);
  const btmLX = -l;
  const btmRX = l;
  const topLX = -l;
  const topRX = l;
  return [
    btmLX, btmLY, btmLZ,
    topLX, topLY, topLZ,
    topRX, topRY, topRZ,
    btmLX, btmLY, btmLZ,
    topRX, topRY, topRZ,
    btmRX, btmRY, btmRZ,
  ];
}

function getPixelTexture(size, rgbFloat) {
  const floatToUint = (v) => Math.round(v * 255);
  const [r, g, b] = rgbFloat;
  const rgbUint = [
    floatToUint(r),
    floatToUint(g),
    floatToUint(b),
  ];
  const pixelCount = size ** 2;
  const buffer = new ArrayBuffer(pixelCount * 3);
  const result = new Uint8Array(buffer);

  for (let i = 0; i < pixelCount * 3; i += 3) {
    result.set(rgbUint, i);
  }

  return result;
}

function getGridImage() {
  const pixels = [];
  const black = [0, 0, 0];
  const white = [255, 255, 255];
  for (let i = 0; i < 32; i += 1) {
    for (let j = 0; j < 32; j += 1) {
      if (j === 0 && i === 0) {
        pixels.push(white);
      }
      else if (j === 0 || i === 0) {
        pixels.push(black);
      }
      else {
        pixels.push(white);
      }
    }
  }
  return new Uint8Array(pixels.flatMap(i => i));
}
