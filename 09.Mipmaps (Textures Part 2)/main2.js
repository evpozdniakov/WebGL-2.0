(async function() {
  /**
   * @type {HTMLCanvasElement}
   */
  const canvas = document.querySelector('#myCanvas2');
  const gl = canvas.getContext('webgl2');

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  const program = gl.createProgram();
  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  const vertexShaderSource = (
    `#version 300 es
    layout(location = 0) in highp vec3 aShapeCoord;
    layout(location = 1) in highp vec2 aTexCoord;
    uniform mat4 uMVP;
    out highp vec2 vTexCoord;
    void main()
    {
      gl_Position = uMVP * vec4(aShapeCoord, 1);
      vTexCoord = aTexCoord;
    }`
  )
  gl.shaderSource(vertexShader, vertexShaderSource);
  gl.compileShader(vertexShader);
  gl.attachShader(program, vertexShader);
  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  const fragmentShaderSource = (
    `#version 300 es
    precision mediump float;
    in highp vec2 vTexCoord;
    uniform sampler2D uSampler;
    out highp vec4 fragColor;
    void main()
    {
      fragColor = texture(uSampler, vTexCoord);
    }`
  )
  gl.shaderSource(fragmentShader, fragmentShaderSource);
  gl.compileShader(fragmentShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.useProgram(program);

  // Upload MVP to uniform
  const uMVPLocation = gl.getUniformLocation(program, 'uMVP');
  gl.uniformMatrix4fv(uMVPLocation, false, makeMVPForCanvas(canvas));

  const shapeBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, shapeBuffer);
  const cactusXZ = [];
  const makeShapeBufferData = curryMakeShapeBufferData(cactusXZ);
  const shapeBufferData = makeShapeBufferData(0);
  gl.bufferData(gl.ARRAY_BUFFER, shapeBufferData, gl.STATIC_DRAW);
  const aShapeCoordLocation = 0;
  gl.enableVertexAttribArray(aShapeCoordLocation);
  gl.vertexAttribPointer(aShapeCoordLocation, 3, gl.FLOAT, false, 20, 0);

  const aTexCoordLocation = 1;
  gl.enableVertexAttribArray(aTexCoordLocation);
  gl.vertexAttribPointer(aTexCoordLocation, 2, gl.FLOAT, false, 20, 12);

  const singleColorTextureUnit = 8;
  gl.activeTexture(gl.TEXTURE0 + singleColorTextureUnit);
  const singleColorTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, singleColorTexture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 128, 128, 0, gl.RGBA, gl.UNSIGNED_BYTE, makeRGBA(128, [0, 0, 1, 0.25]));
  gl.texImage2D(gl.TEXTURE_2D, 1, gl.RGBA, 64, 64, 0, gl.RGBA, gl.UNSIGNED_BYTE, makeRGBA(64, [0, 1, 1, 0.25]));
  gl.texImage2D(gl.TEXTURE_2D, 2, gl.RGBA, 32, 32, 0, gl.RGBA, gl.UNSIGNED_BYTE, makeRGBA(32, [0, 1, 0, 0.5]));
  gl.texImage2D(gl.TEXTURE_2D, 3, gl.RGBA, 16, 16, 0, gl.RGBA, gl.UNSIGNED_BYTE, makeRGBA(16, [1, 1, 0, 0.5]));
  gl.texImage2D(gl.TEXTURE_2D, 4, gl.RGBA, 8,  8,  0, gl.RGBA, gl.UNSIGNED_BYTE, makeRGBA(8,  [1, 0.5, 0, 1]));
  gl.texImage2D(gl.TEXTURE_2D, 5, gl.RGBA, 4,  4,  0, gl.RGBA, gl.UNSIGNED_BYTE, makeRGBA(4,  [1, 0, 0, 1]));
  gl.texImage2D(gl.TEXTURE_2D, 6, gl.RGBA, 2,  2,  0, gl.RGBA, gl.UNSIGNED_BYTE, makeRGBA(2,  [0, 0, 0, 1]));
  gl.texImage2D(gl.TEXTURE_2D, 7, gl.RGBA, 1,  1,  0, gl.RGBA, gl.UNSIGNED_BYTE, makeRGBA(1,  [0, 0, 0, 1]));
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_NEAREST);

  const cactusTextureUnit = 10;
  gl.activeTexture(gl.TEXTURE0 + cactusTextureUnit);
  const cactusTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, cactusTexture);
  const cactusPng = await loadImage('https://raw.githubusercontent.com/evpozdniakov/WebGL-2.0/refs/heads/main/09.Mipmaps%20(Textures%20Part%202)/cactus.png');
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, cactusPng);
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);

  /**
   * @type {HTMLInputElement}
   */
  const minFilterLMLRadio = document.querySelector('[name=minFilter2][value=LINEAR_MINMAP_LINEAR]');
  /**
   * @type {HTMLInputElement}
   */
  const minFilterLMNRadio = document.querySelector('[name=minFilter2][value=LINEAR_MINMAP_NEAREST]');
  /**
   * @type {HTMLInputElement}
   */
  const minFilterNMLRadio = document.querySelector('[name=minFilter2][value=NEAREST_MINMAP_LINEAR]');
  /**
   * @type {HTMLInputElement}
   */
  const minFilterNMNRadio = document.querySelector('[name=minFilter2][value=NEAREST_MINMAP_NEAREST]');
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
  document.querySelectorAll('[name=minFilter2]').forEach(i => i.addEventListener('change', setMinFilter));

  /**
   * @type {HTMLInputElement}
   */
  const noCactusesCheckbox = document.querySelector('input[name=no-cactuses]');
  const uSamplerLocation = gl.getUniformLocation(program, 'uSampler');
  const toggleCactuses = () => {
    if (noCactusesCheckbox.checked) {
      gl.uniform1i(uSamplerLocation, singleColorTextureUnit);
      gl.bindTexture(gl.TEXTURE_2D, singleColorTexture);
      setMinFilter();
    }
    else {
      gl.uniform1i(uSamplerLocation, cactusTextureUnit);
      gl.bindTexture(gl.TEXTURE_2D, cactusTexture);
      setMinFilter();
    }
  }
  noCactusesCheckbox.addEventListener('change', toggleCactuses);
  toggleCactuses();

  const render = (time) => {
    gl.bufferData(gl.ARRAY_BUFFER, makeShapeBufferData(time), gl.STATIC_DRAW);
    gl.drawArrays(gl.TRIANGLES, 0, 200*6);
    requestAnimationFrame(render);
  }

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

function curryMakeShapeBufferData(cactusXZ) {
  /**
   * @type {HTMLInputElement}
   */
  const speedRange = document.querySelector('input[name=speed]');
  const getSpeed = () => parseFloat(speedRange.value) / 500;
  let prevDistance = 0;
  let prevTime = 0;
  return (time) => {
    const deltaTime = time - prevTime;
    const deltaDistance = deltaTime * getSpeed();
    const distance = prevDistance + deltaDistance;
    prevDistance = distance;
    prevTime = time;
    const isFirstRendering = cactusXZ.length === 0;
    if (cactusXZ.length < 200) {
      while (cactusXZ.length < 200) {
        cactusXZ.push([
          Math.random()*30 - 15,
          -1 * (isFirstRendering ? Math.random()*300 : distance+300),
        ])
      }
      cactusXZ.sort((a, b) => a[1] - b[1]);
    }
    const shapeCoords = cactusXZ.flatMap(([x, z], index) => {
      const newZ = z + distance;
      return (
        [
          x - 0.66, -1, newZ,    0, 0,
          x - 0.66,  1, newZ,    0, 1,
          x + 0.66,  1, newZ,    1, 1,
          x - 0.66, -1, newZ,    0, 0,
          x + 0.66,  1, newZ,    1, 1,
          x + 0.66, -1, newZ,    1, 0,
        ]
      )
    })
    const itemIndicesToRemove = cactusXZ.reduce((res, [x, z], index) => {
      const newZ = z + distance;
      if (newZ > 3) {
        return res.concat(index);
      }
      return res;
    }, []);
    itemIndicesToRemove.reverse().forEach(index => {
      cactusXZ.splice(index, 1);
    });
    return new Float32Array(shapeCoords);
  }
}

function makeRGBA(size, [r, g, b, a]) {
  const toUint = (v) => Math.ceil(v * 255);
  const rgba = [
    toUint(r),
    toUint(g),
    toUint(b),
    toUint(a),
  ];
  return new Uint8Array(Array(size**2).fill(rgba).flatMap(i => i))
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
