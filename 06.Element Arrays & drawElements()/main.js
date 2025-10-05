(function() {
  /**
   * @type {HTMLCanvasElement}
   */
  const canvas = document.querySelector('#myCanvas');
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

  const arrayVertexData = new Float32Array([
    0, 0,      0,     0.4,       0.4,   0.05,
    0, 0,      0.4,   0.05,      0.25, -0.35,
    0, 0,      0.25, -0.35,     -0.25, -0.35,
    0, 0,     -0.25, -0.35,     -0.4,   0.05,
    0, 0,     -0.4,   0.05,      0,     0.4,
  ]);

  const arrayVertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, arrayVertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, arrayVertexData, gl.STATIC_DRAW);
  gl.vertexAttribPointer(aCoordsLocation, 2, gl.FLOAT, false, 8, 0);
  gl.enableVertexAttribArray(aCoordsLocation);

  gl.drawArrays(gl.TRIANGLES, 0, 15);
})();
