(function() {
  /**
   * @type {HTMLCanvasElement}
   */
  const canvas = document.getElementById('myCanvas3');
  const gl = canvas.getContext('webgl2');
  
  const program = gl.createProgram();
  
  const vertexShaderSource = (
    `#version 300 es
    uniform highp int uIndex;
    uniform mediump float uSecondsSinceStart;
    uniform mediump float uSpeed[50];
    uniform mediump float uRadius[50];
    uniform mediump float uSize[50];
    void main()
    {
      float angle = uSecondsSinceStart * uSpeed[uIndex];
      vec2 coords = vec2(sin(angle), cos(angle)) * uRadius[uIndex];
      gl_Position = vec4(coords, 0.0, 1.0);
      gl_PointSize = uSize[uIndex];
    }`
  );
  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, vertexShaderSource);
  gl.compileShader(vertexShader);
  gl.attachShader(program, vertexShader);
  
  const fragmentShaderSource = (
    `#version 300 es
    precision mediump float;
    uniform highp int uIndex;
    uniform vec4 uColor[50];
    out vec4 fragColor;
    void main()
    {
      fragColor = uColor[uIndex];
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
  
  const uSecondsSinceStartLocation = gl.getUniformLocation(program, 'uSecondsSinceStart');
  const uIndexLocation = gl.getUniformLocation(program, 'uIndex');
  const uSpeedLocation = gl.getUniformLocation(program, 'uSpeed');
  const uSizeLocation = gl.getUniformLocation(program, 'uSize');
  const uColorLocation = gl.getUniformLocation(program, 'uColor');
  const uRadiusLocation = gl.getUniformLocation(program, 'uRadius');
  
  gl.useProgram(program);

  const startTime = new Date().getTime();

  const runDrawCall = (index) => {
    gl.uniform1i(uIndexLocation, index);
    gl.drawArrays(gl.POINTS, 0, 1);
  }

  const makeRandomFloat = (min, max) => {
    return min + Math.random() * (max - min);
  }

  const makeRandomDirection = () => {
    return Math.random() > 0.5 ? 1 : -1;
  }

  const makeRandomColor = () => {
    return [
      Math.random(),
      Math.random(),
      Math.random(),
      1.0,
    ];
  }

  const dotColors = [];
  const dotSpeeds = [];
  const dotRadius = [];
  const dotSizes = [];
  for (let i = 0; i < 50; i += 1) {
    const speed = makeRandomFloat(1, 4) * makeRandomDirection();
    dotSpeeds.push(speed);
    const radius = makeRandomFloat(0.2, 1);
    dotRadius.push(radius);
    const color = makeRandomColor();
    dotColors.push(color);
    const size = Math.min(30, 10.0 / (Math.abs(speed) * radius));
    dotSizes.push(size);
  }
  gl.uniform4fv(uColorLocation, dotColors.flatMap(i => i));
  gl.uniform1fv(uSizeLocation, dotSizes);
  gl.uniform1fv(uSpeedLocation, dotSpeeds);
  gl.uniform1fv(uRadiusLocation, dotRadius);

  setInterval(() => {
    const secondsSinceStart = (new Date().getTime() - startTime) / 1000;
    gl.uniform1f(uSecondsSinceStartLocation, secondsSinceStart);
    for (let i = 0; i < 50; i += 1) {
      runDrawCall(i);
    }
  }, 10);
})();
