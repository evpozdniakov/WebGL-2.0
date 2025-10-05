(function() {
  /**
   * @type {HTMLCanvasElement}
   */
  const canvas = document.querySelector('#myCanvas');
  const gl = canvas.getContext('webgl2');
  
  const program = gl.createProgram();
  
  const vertexShaderSource = (
    `#version 300 es
    layout(location = 0) in highp vec2 aCoords;
    layout(location = 1) in mediump float aPointSize;
    layout(location = 2) in mediump vec3 aColor;
    out mediump vec3 vColor;
    void main()
    {
      gl_Position = vec4(aCoords, 0.0, 1.0);
      gl_PointSize = aPointSize;
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
    out mediump vec4 fragColor;
    void main()
    {
      fragColor = vec4(vColor, 1.0);
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

  const data = new Float32Array([
    0,   -0.5,          40,         1,   0.5, 0,
    -0.5, 0.5,          50,         0,   0.5, 1,
    0.5,  0.5,          20,         0.8, 0,   0.8,
  ])

  const aCoordsLocation = 0;
  const aPointSizeLocation = 1;
  const aColorLocation = 2;

  gl.enableVertexAttribArray(aCoordsLocation);
  gl.enableVertexAttribArray(aPointSizeLocation);
  gl.enableVertexAttribArray(aColorLocation);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
 
  gl.vertexAttribPointer(aCoordsLocation, 2, gl.FLOAT, false, 32/8 * 6, 32/8 * 0);
  gl.vertexAttribPointer(aPointSizeLocation, 1, gl.FLOAT, false, 32/8 * 6, 32/8 * 2);
  gl.vertexAttribPointer(aColorLocation, 3, gl.FLOAT, false, 32/8 * 6, 32/8 * 3);
  
  gl.drawArrays(gl.TRIANGLES, 0, 3);
})();
