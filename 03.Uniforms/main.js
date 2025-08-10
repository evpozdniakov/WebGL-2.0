(function() {
  /**
   * @type {HTMLCanvasElement}
   */
  const canvas = document.getElementById('myCanvas');
  const gl = canvas.getContext('webgl2');
  
  const program = gl.createProgram();
  
  const vertexShaderSource = (
    `#version 300 es
    uniform vec2 uCoords;
    uniform float uSize;
    void main()
    {
      gl_Position = vec4(uCoords, 0.0, 1.0);
      gl_PointSize = uSize;
    }`
  );
  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, vertexShaderSource);
  gl.compileShader(vertexShader);
  gl.attachShader(program, vertexShader);
  
  const fragmentShaderSource = (
    `#version 300 es
    precision mediump float;
    uniform vec4 uColor;
    out vec4 fragColor;
    void main()
    {
      fragColor = uColor;
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
  
  const uCoordsLocation = gl.getUniformLocation(program, 'uCoords');
  const uSizeLocation = gl.getUniformLocation(program, 'uSize');
  const uColorLocation = gl.getUniformLocation(program, 'uColor');
  
  gl.useProgram(program);
  
  gl.uniform2f(uCoordsLocation, 0.4, 0.8);
  gl.uniform1f(uSizeLocation, 20.0);
  gl.uniform4f(uColorLocation, 0.0, 0.9, 0.5, 0.2);
  gl.drawArrays(gl.POINTS, 0, 1);
  
  gl.uniform2f(uCoordsLocation, -0.8, -0.3);
  gl.uniform1f(uSizeLocation, 40.0);
  gl.uniform4f(uColorLocation, 0.6, 0.2, 0.9, 0.5);
  gl.drawArrays(gl.POINTS, 0, 1);
  
  gl.uniform2f(uCoordsLocation, -0.3, 0.5);
  gl.uniform1f(uSizeLocation, 30.0);
  gl.uniform4f(uColorLocation, 0.4, 1.0, 0.1, 0.8);
  gl.drawArrays(gl.POINTS, 0, 1);
})();
