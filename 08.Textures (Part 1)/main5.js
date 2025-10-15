(async function() {
  /**
   * @type {HTMLCanvasElement}
   */
  const canvas = document.querySelector('#myCanvas5');
  const gl = canvas.getContext('webgl2');

  const program = gl.createProgram();

  const vertexShaderSource = (
    `#version 300 es
    layout(location = 0) in mediump vec2 aCoords;
    layout(location = 1) in mediump vec2 aTexCoords;
    out mediump vec2 vTexCoords;
    void main()
    {
      gl_Position = vec4(aCoords, 0, 1);
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
    in mediump vec2 vTexCoords;
    uniform sampler2D uKittenSampler;
    out vec4 fragColor;
    void main()
    {
      fragColor = texture(uKittenSampler, vTexCoords);
    }`
  );
  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader, fragmentShaderSource);
  gl.compileShader(fragmentShader);
  gl.attachShader(program, fragmentShader);

  gl.linkProgram(program);
  gl.useProgram(program);

  const aCoordsLocation = 0;
  const aTexCoordsLocation = 1;

  const positionBufferData = new Float32Array([
    -0.9, -0.9,
     0,    0.9,
     0.9, -0.9,
  ]);
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, positionBufferData, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(aCoordsLocation);
  gl.vertexAttribPointer(aCoordsLocation, 2, gl.FLOAT, false, 8, 0);

  const texCoordsBufferData = new Float32Array([
    0,   0,
    0.5, 1,
    1,   0,
  ]);
  const texCoordsBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordsBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, texCoordsBufferData, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(aTexCoordsLocation);
  gl.vertexAttribPointer(aTexCoordsLocation, 2, gl.FLOAT, false, 8, 0);

  const loadImage = () => new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'unonimous';
    img.addEventListener('load', () => resolve(img));
    img.src = 'https://raw.githubusercontent.com/evpozdniakov/WebGL-2.0/refs/heads/main/08.Textures%20(Part%201)/kitten.jpeg';
  });

  const kittenImage = await loadImage();
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 259, 194, 0, gl.RGB, gl.UNSIGNED_BYTE, kittenImage);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.generateMipmap(gl.TEXTURE_2D);

  gl.drawArrays(gl.TRIANGLES, 0, 3);
})();
