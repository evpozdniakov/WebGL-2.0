(function() {
  /**
   * @type {HTMLCanvasElement}
   */
  const canvas = document.querySelector('#myCanvas2');
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

  const startTime = new Date().getTime();

  const runDrawCall = (speed, color, size) => {
    const secondsSinceStart = (new Date().getTime() - startTime) / 1000;
    const calcCoord = (speed) => {
      let coord = Math.abs(speed) * secondsSinceStart % 2;
      if (coord > 1) {
        coord = 2 - coord;
      }
      return coord * 2 - 1;
    }
    const coords = [
      calcCoord(speed[0]),
      calcCoord(speed[1]),
    ]
    gl.uniform2fv(uCoordsLocation, coords);
    gl.uniform1f(uSizeLocation, size);
    gl.uniform4fv(uColorLocation, color);
    gl.drawArrays(gl.POINTS, 0, 1);
  }

  const makeRandomFloat = (min, max) => {
    return min + Math.random() * (max - min);
  }

  const makeRandomDirection = () => {
    return Math.random() > 0.5 ? 1 : -1;
  }

  const dotParams = [];
  for (let i = 0; i < 50; i += 1) {
    const speed = [
      makeRandomFloat(0.1, 2) * makeRandomDirection(),
      makeRandomFloat(0.1, 2) * makeRandomDirection(),
    ];
    const color = [
      Math.random(),
      Math.random(),
      Math.random(),
      1.0,
    ];
    const size = Math.min(30, 10.0 / Math.sqrt(speed[0]**2 + speed[1]**2));
    dotParams.push({ speed, color, size });
  }

  setInterval(() => {
    dotParams.forEach(dot => {
      runDrawCall(dot.speed, dot.color, dot.size);
    })
  }, 10);
})();
