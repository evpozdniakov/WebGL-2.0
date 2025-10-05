(function() {
  /**
   * @type {HTMLCanvasElement}
   */
  const canvas = document.querySelector('#myCanvas3');
  const gl = canvas.getContext('webgl2');
  
  const program = gl.createProgram();
  
  const vertexShaderSource = (
    `#version 300 es
    layout(location = 0) in mediump vec2 aCoords;
    layout(location = 1) in mediump float aPointSize;
    layout(location = 2) in mediump vec3 aColor;
    out vec4 vColor;
    void main()
    {
      gl_Position = vec4(aCoords, 0.0, 1.0);
      gl_PointSize = aPointSize;
      vColor = vec4(aColor, 1.0);
    }`
  );
  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, vertexShaderSource);
  gl.compileShader(vertexShader);
  gl.attachShader(program, vertexShader);
  
  const fragmentShaderSource = (
    `#version 300 es
    in mediump vec4 vColor;
    out mediump vec4 fragColor;
    void main()
    {
      fragColor = vColor;
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

  const aCoordsLocation = 0;
  const aPointSizeLocation = 1;
  const aColorLocation = 2;

  gl.vertexAttrib2f(aCoordsLocation, 0.2, -0.5);
  gl.vertexAttrib1f(aPointSizeLocation, 50);
  gl.vertexAttrib3f(aColorLocation, 1, 0, 1);

  const coordsData = new Int16Array([
    -0.21, -0.41,
    -0.26,  0.24,
     0.49, -0.51,
     0.54,  0.34,
     0.09, -0.11,
  ].map(v => Math.floor(v * (1 << 15))));
  // console.log('=============== coordsData', coordsData.byteLength);
  const coordsBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, coordsBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, coordsData, gl.STATIC_DRAW);
  gl.vertexAttribPointer(aCoordsLocation, 2, gl.SHORT, true, 4, 0);

  const pointSizeData = new Uint8Array([
    10, 20, 30, 40, 50,
  ]);
  // console.log('=============== pointSizeData', pointSizeData.byteLength);
  const pointSizeBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, pointSizeBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, pointSizeData, gl.STATIC_DRAW);
  gl.vertexAttribPointer(aPointSizeLocation, 1, gl.UNSIGNED_BYTE, false, 1, 0);

  const colorData = new Uint8Array([
    0,   100, 0,  // DarkGreen
    154, 205, 50, // YellowGreen
    107, 142, 35, // OliveDrab
    128, 128, 0,  // Olive
    85,  107, 47, // DarkOliveGreen
  ]);
  // console.log('=============== colorData', colorData.byteLength);
  const colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, colorData, gl.STATIC_DRAW);
  gl.vertexAttribPointer(aColorLocation, 3, gl.UNSIGNED_BYTE, true, 3, 0);

  gl.enableVertexAttribArray(aCoordsLocation);
  gl.enableVertexAttribArray(aPointSizeLocation);
  gl.enableVertexAttribArray(aColorLocation);

  gl.drawArrays(gl.POINTS, 0, 5);
})();
