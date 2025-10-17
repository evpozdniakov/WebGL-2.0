(function (){
  /**
   * @type {HTMLCanvasElement}
   */
  const canvas = document.querySelector('#myCanvas');
  const gl = canvas.getContext('webgl2');
  
  const program = gl.createProgram();

  const vertexShaderSource = (
    `#version 300 es
    layout(location = 1) in highp vec3 aSquareCoords;
    void main()
    {
      gl_Position = vec4(aSquareCoords, 1);
      gl_PointSize = 50.0;
    }`
  );
  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, vertexShaderSource);
  gl.compileShader(vertexShader);
  gl.attachShader(program, vertexShader);

  const fragmentShaderSource = (
    `#version 300 es
    out mediump vec4 fragColor;
    void main ()
    {
      fragColor = vec4(1, 0, 0, 1);
    }`
  );
  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader, fragmentShaderSource);
  gl.compileShader(fragmentShader);
  gl.attachShader(program, fragmentShader);

  const aSquareCoordsLocation = 1;

  const runDrawCall = () => {
    const coords = getCoordsForTime(Date.now())
    const aSquareCoordsData = new Float32Array(coords);
    const aSquareCoordsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, aSquareCoordsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, aSquareCoordsData, gl.STATIC_DRAW);
    gl.vertexAttribPointer(aSquareCoordsLocation, 3, gl.FLOAT, false, 12, 0);
    gl.enableVertexAttribArray(aSquareCoordsLocation);
    
    gl.linkProgram(program);
    gl.useProgram(program);
  
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  };

  setInterval(() => {
    runDrawCall();
  }, 10);
})();

function getCoordsForTime(time) {
  const progress = time / 1000;
  const topLY = 0.8 * Math.sin(progress);
  const topRY = topLY;
  const btmLY = -topLY;
  const btmRY = -topRY;
  const topLZ = 0.8 * Math.cos(progress);
  const topRZ = topLZ;
  const btmLZ = -topLZ;
  const btmRZ = -topRZ;
  const startCoords = [
    -0.8, btmLY, btmLZ,
    -0.8, topLY, topLZ,
     0.8, topRY, topRZ,
    -0.8, btmLY, btmLZ,
     0.8, topRY, topRZ,
     0.8, btmRY, btmRZ,
  ];
  return startCoords;
}