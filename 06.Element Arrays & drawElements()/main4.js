(function() {
  /**
   * @type {HTMLCanvasElement}
   */
  const canvas = document.querySelector('#myCanvas4');
  const gl = canvas.getContext('webgl2');

  const program = gl.createProgram();

  const vertexShaderSource = (
    `#version 300 es
    layout(location = 0) in mediump vec2 aCoords;
    layout(location = 1) in mediump vec3 aColor;

    out mediump vec3 vColor;

    void main()
    {
      gl_Position = vec4(aCoords, 0, 1);
      gl_PointSize = 30.0;
      vColor = aColor;
    }`
  );
  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, vertexShaderSource);
  gl.compileShader(vertexShader);
  gl.attachShader(program, vertexShader);

  const fragmentShaderSource = (
    `#version 300 es
    in mediump vec3 vColor;
    out mediump vec4 fColor;
    void main()
    {
      fColor = vec4(vColor, 1);
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
  const aColorLocation = 1;

  gl.vertexAttrib2f(aCoordsLocation, 0.5, 0.5);
  gl.vertexAttrib3f(aColorLocation, 1, 0, 1);

  const elementVertexData = new Float32Array([
    0,     0,      0, 0, 0,
    0,     0.4,    1, 0, 0,
    0.4,   0.05,   0, 1, 0,
    0.25, -0.35,   0, 0, 1,
   -0.25, -0.35,   1, 1, 0,
   -0.4,   0.05,   1, 0, 1,
  ]);

  const elementIndexData = new Uint8Array([
    0, 1, 2,
    0, 2, 3,
    0, 3, 4,
    0, 4, 5,
    0, 5, 1,
  ]);

  const elementVertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, elementVertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, elementVertexData, gl.STATIC_DRAW);

  const elementIndexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elementIndexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, elementIndexData, gl.STATIC_DRAW);

  gl.vertexAttribPointer(aCoordsLocation, 2, gl.FLOAT, false, 20, 0);
  gl.vertexAttribPointer(aColorLocation, 3, gl.FLOAT, false, 20, 8);

  gl.enableVertexAttribArray(aCoordsLocation);
  gl.enableVertexAttribArray(aColorLocation);

  gl.drawElements(gl.TRIANGLES, 15, gl.UNSIGNED_BYTE, 0);
})();
