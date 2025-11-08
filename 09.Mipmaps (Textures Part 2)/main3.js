(async function() {
  /**
   * @type {HTMLCanvasElement}
   */
  const canvas = document.querySelector('#myCanvas3');
  const gl = canvas.getContext('webgl2');
  const program = gl.createProgram();
  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  const vertexShaderSource = (
    `#version 300 es
    layout(location = 0) in highp vec2 aShapeCoord;
    layout(location = 1) in highp vec2 aTexCoord;
    out highp vec2 vTexCoord;
    void main()
    {
      gl_Position = vec4(aShapeCoord, 0, 1);
      vTexCoord = aTexCoord;
    }`
  )
  gl.shaderSource(vertexShader, vertexShaderSource);
  gl.compileShader(vertexShader);
  gl.attachShader(program, vertexShader);
  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  const fragmentShaderSource = (
    `#version 300 es
    uniform sampler2D uSampler;
    in highp vec2 vTexCoord;
    out mediump vec4 fragColor;
    void main()
    {
      // fragColor = vec4(1, 0, 1, 1);
      fragColor = texture(uSampler, vTexCoord);
    }`
  )
  gl.shaderSource(fragmentShader, fragmentShaderSource);
  gl.compileShader(fragmentShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.useProgram(program);

  const pixelTextureUnit = 3;
  gl.activeTexture(gl.TEXTURE0 + pixelTextureUnit);
  const pixelTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, pixelTexture);
  const pixelTextureData = new Uint8Array([
    ...white(), ...black(),
    ...black(), ...white(),
  ]);
  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 2, 2, 0, gl.RGB, gl.UNSIGNED_BYTE, pixelTextureData);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  // const gridImage = await loadImage('https://raw.githubusercontent.com/evpozdniakov/WebGL-2.0/refs/heads/main/09.Mipmaps%20(Textures%20Part%202)/grid-32.png');
  const gridImage = getGridImage();
  const gridTextureUnit = 4;
  gl.activeTexture(gl.TEXTURE0 + gridTextureUnit);
  const gridTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, gridTexture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 32, 32, 0, gl.RGB, gl.UNSIGNED_BYTE, gridImage);
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  const shapeCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, shapeCoordBuffer);
  const shapeCoordBufferData = new Int8Array([
    -1, -1,
    -1,  1,
     1,  1,
    -1, -1,
     1,  1,
     1, -1,
  ]);
  gl.bufferData(gl.ARRAY_BUFFER, shapeCoordBufferData, gl.STATIC_DRAW);
  const shapeCoordAttribLocation = 0;
  gl.vertexAttribPointer(shapeCoordAttribLocation, 2, gl.BYTE, false, 2, 0);
  gl.enableVertexAttribArray(shapeCoordAttribLocation);

  const texCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
  const texCoordBufferData = new Float32Array([
     0,  0,
     0,  1,
     1,  1,
     0,  0,
     1,  1,
     1,  0,
  ]);
  gl.bufferData(gl.ARRAY_BUFFER, texCoordBufferData, gl.STATIC_DRAW);
  const texCoordAttribLocation = 1;
  gl.vertexAttribPointer(texCoordAttribLocation, 2, gl.FLOAT, false, 8, 0);
  gl.enableVertexAttribArray(texCoordAttribLocation);

  const uSamplerLocation = gl.getUniformLocation(program, 'uSampler');
  const render = () => {
    if (useGridInput.checked) {
      gl.bindTexture(gl.TEXTURE_2D, gridTexture);
      setMinFilter();
      setMagFilter();
      gl.uniform1i(uSamplerLocation, gridTextureUnit);
    }
    else {
      gl.bindTexture(gl.TEXTURE_2D, pixelTexture);
      setMagFilter();
      gl.uniform1i(uSamplerLocation, pixelTextureUnit);
    }
    const d = window.evp ?? 0;
    const u = (1 - d) * parseFloat(repeatXInput.value);
    const v = (1 - d) * parseFloat(repeatYInput.value);
    const texCoordBufferData = new Float32Array([
      d,  d,
      d,  v,
      u,  v,
      d,  d,
      u,  v,
      u,  d,
    ]);
    gl.bufferData(gl.ARRAY_BUFFER, texCoordBufferData, gl.STATIC_DRAW);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  /**
   * @type {HTMLInputElement}
   */
  const minFilterLMLRadio = document.querySelector('[name=minFilter3][value=LINEAR_MINMAP_LINEAR]');
  /**
   * @type {HTMLInputElement}
   */
  const minFilterLMNRadio = document.querySelector('[name=minFilter3][value=LINEAR_MINMAP_NEAREST]');
  /**
   * @type {HTMLInputElement}
   */
  const minFilterNMLRadio = document.querySelector('[name=minFilter3][value=NEAREST_MINMAP_LINEAR]');
  /**
   * @type {HTMLInputElement}
   */
  const minFilterNMNRadio = document.querySelector('[name=minFilter3][value=NEAREST_MINMAP_NEAREST]');
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
  document.querySelectorAll('[name=minFilter3]').forEach(i => i.addEventListener('change', render));

  /**
   * @type {HTMLInputElement}
   */
  const magFilterLinearRadio = document.querySelector('[name=magFilter][value=LINEAR]');
  /**
   * @type {HTMLInputElement}
   */
  const magFilterNearestRadio = document.querySelector('[name=magFilter][value=NEAREST]');
  const setMagFilter = () => {
    switch (true) {
      case magFilterLinearRadio.checked:
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        break;
      case magFilterNearestRadio.checked:
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        break;
    }
  }
  setMagFilter();
  document.querySelectorAll('[name=magFilter]').forEach(i => i.addEventListener('change', render));
  document.querySelectorAll('input[name=gridOrPixels]').forEach((input) => input.addEventListener('change', () => {
    document.querySelectorAll('input[name=minFilter3]').forEach((i) => {
      i.disabled = !useGridInput.checked;
    });
    render();
  }));

  /**
   * @type {HTMLInputElement}
   */
  const useGridInput = document.querySelector('input[name=gridOrPixels][value=grid]');

  /**
   * @type {HTMLInputElement}
   */
  const repeatXInput = document.querySelector('input[name=repeat-x]');
  repeatXInput.addEventListener('input', render);

  /**
   * @type {HTMLInputElement}
   */
  const repeatYInput = document.querySelector('input[name=repeat-y]');
  repeatYInput.addEventListener('input', render);

  render();
})();

function white() {
  return [255, 255, 255];
}

function black() {
  return [0, 0, 0];
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
