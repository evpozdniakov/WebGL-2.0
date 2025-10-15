(function() {
  /**
   * @type {HTMLCanvasElement}
   */
  const canvas = document.querySelector('#myCanvas6');
  const gl = canvas.getContext('webgl2');

  const program = gl.createProgram();

  const vertexShaderSource = (
    `#version 300 es
    layout(location = 0) in mediump vec2 aCoords;
    layout(location = 1) in mediump vec2 aTextureCoords;
    out mediump vec2 vTextureCoords;
    void main()
    {
      gl_Position = vec4(aCoords, 0, 1);
      vTextureCoords = aTextureCoords;
    }`
  );
  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, vertexShaderSource);
  gl.compileShader(vertexShader);
  gl.attachShader(program, vertexShader);

  const fragmentShaderSource = (
    `#version 300 es
    precision mediump float;
    in mediump vec2 vTextureCoords;
    uniform sampler2D uPixelSampler;
    uniform sampler2D uKittenSampler;
    uniform mediump float uMultiplyFactor;
    out mediump vec4 fragColor;
    void main()
    {
      vec4 image1 = texture(uPixelSampler, vTextureCoords) * uMultiplyFactor;
      vec4 image2 = texture(uKittenSampler, vTextureCoords) * (1.0 - uMultiplyFactor);
      fragColor = image1 + image2;
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

  const coordsBufferData = new Float32Array([
    -0.9, -0.9,
     0,    0.9,
     0.9, -0.9,
  ]);
  const coordsBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, coordsBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, coordsBufferData, gl.STATIC_DRAW);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 8, 0);
  gl.enableVertexAttribArray(0);

  const textureCoordsBufferData = new Float32Array([
    0,   0,
    0.5, 1,
    1,   0,
  ]);
  const textureCoordsBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordsBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, textureCoordsBufferData, gl.STATIC_DRAW);
  gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 8, 0);
  gl.enableVertexAttribArray(1);

  const pixels = new Uint8Array([
    255,255,255,       230,25,75,        60,180,75,        255,225,25,
    67,99,216,         245,130,49,       145,30,180,       70,240,240,
    240,50,230,        188,246,12,       250,190,190,      0,128,128,
    230,190,255,       154,99,36,        255,250,200,      0,0,0,
  ]);

  const pixelTextureUnit = 1;
  gl.activeTexture(gl.TEXTURE0 + pixelTextureUnit);
  const uPixelSamplerLocation = gl.getUniformLocation(program, 'uPixelSampler');
  gl.uniform1i(uPixelSamplerLocation, pixelTextureUnit)

  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 4, 4, 0, gl.RGB, gl.UNSIGNED_BYTE, pixels);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.generateMipmap(gl.TEXTURE_2D);

  new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.addEventListener('load', () => resolve(img));
    img.src = 'https://raw.githubusercontent.com/evpozdniakov/WebGL-2.0/refs/heads/main/08.Textures%20(Part%201)/kitten.jpeg';
  }).then((kittenImage) => {
    const kittenTextureUnit = 5;
    gl.activeTexture(gl.TEXTURE0 + kittenTextureUnit);
    const uKittenSamplerLocation = gl.getUniformLocation(program, 'uKittenSampler');
    gl.uniform1i(uKittenSamplerLocation, kittenTextureUnit)
  
    const textureKitten = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, textureKitten);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 259, 194, 0, gl.RGB, gl.UNSIGNED_BYTE, kittenImage);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.generateMipmap(gl.TEXTURE_2D);
  
    const uMultiplyFactorLocation = gl.getUniformLocation(program, 'uMultiplyFactor');
  
    const runDrawCall = () => {
      const uMultiplyFactor = Math.sin(Date.now() / 1000) * 0.5 + 0.5;
      gl.uniform1f(uMultiplyFactorLocation, uMultiplyFactor);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
  
    setInterval(() => {
      runDrawCall();
    }, 10);
  })
})();
