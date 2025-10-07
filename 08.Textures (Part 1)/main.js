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
    void main()
    {
      gl_Position = vec4(aCoords, 0, 1);
      gl_PointSize = 30.0;
    }`
  )
  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, vertexShaderSource);
  gl.compileShader(vertexShader);
  gl.attachShader(program, vertexShader);

  const fragmentShaderSource = (
    `#version 300 es
    out mediump vec4 fgColor;
    void main()
    {
      fgColor = vec4(0.4, 0, 0.4, 1);
    }`
  )
  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader, fragmentShaderSource);
  gl.compileShader(fragmentShader);
  gl.attachShader(program, fragmentShader);

  const coordsBufferData = new Int8Array([
    -0.9, -0.7,
     0,    0.7,
     0.8, -0.7,
  ].map(v => Math.floor(v * 128)));
  const coordsBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, coordsBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, coordsBufferData, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.BYTE, true, 2, 0);

  gl.linkProgram(program);
  gl.useProgram(program);

  gl.drawArrays(gl.TRIANGLES, 0, 3);
})();
