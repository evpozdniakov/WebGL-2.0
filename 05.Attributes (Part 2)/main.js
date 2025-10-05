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
    layout(location = 1) in mediump float aPointSize;
    layout(location = 2) in mediump vec3 aColor;
    out vec3 vColor;
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
      fragColor = vec4(vColor, 1);
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
  gl.vertexAttrib1f(aPointSizeLocation, 30.0);
  gl.vertexAttrib3f(aColorLocation, 1, 0, 1);

  gl.drawArrays(gl.POINTS, 0, 1);
})();
