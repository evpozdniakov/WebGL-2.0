(function() {
  /**
   * @type {HTMLCanvasElement}
   */
  const canvas = document.querySelector('#myCanvas2');
  const gl = canvas.getContext('webgl2');

  const program = gl.createProgram();

  const vertexShaderSource = (
    `#version 300 es
    layout(location = 0) in highp vec2 aCoords;
    layout(location = 1) in highp vec3 aColor;
    out highp vec4 vColor;
    void main()
    {
      gl_Position = vec4(aCoords, 0.0, 1.0);
      vColor = vec4(aColor, 1);
    }`
  );
  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, vertexShaderSource);
  gl.compileShader(vertexShader);
  gl.attachShader(program, vertexShader);

  const fragmentShaderSource = (
    `#version 300 es
    in highp vec4 vColor;
    out highp vec4 fragColor;
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
  gl.enableVertexAttribArray(aCoordsLocation);

  const aColorLocation = 1;
  gl.enableVertexAttribArray(aColorLocation);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

  function randomCoords() {
    return [Math.random() * 2 - 1, Math.random() * 2 - 1];
  }

  function randomColor() {
    return [Math.random(), Math.random(), Math.random()];
  }

  function makeRandomDirection() {
    return Math.random() > 0.5 ? 1 : -1;
  }

  const squareParams = [];
  for (let i = 0; i < 50; i += 1) {
    const coords = randomCoords()
    const size = Math.max(0.1, Math.random() * 0.8);
    const color = randomColor();
    const speed = 0.1 / size**2 * makeRandomDirection();
    squareParams.push({ coords, color, size, speed });
  }
  squareParams.sort((a, b) => b.size - a.size);

  const startTime = new Date().getTime();

  function calcSquareCoords(angle, coords, size) {
    const halfSize = size/2;
    const [x, y] = coords;
    const a = [x + Math.cos(angle + Math.PI*3/4)*halfSize, y + Math.sin(angle + Math.PI*3/4)*halfSize];
    const b = [x + Math.cos(angle + Math.PI*1/4)*halfSize, y + Math.sin(angle + Math.PI*1/4)*halfSize];
    const c = [x + Math.cos(angle - Math.PI*1/4)*halfSize, y + Math.sin(angle - Math.PI*1/4)*halfSize];
    const d = [x + Math.cos(angle - Math.PI*3/4)*halfSize, y + Math.sin(angle - Math.PI*3/4)*halfSize];
    return { a, b, c, d };
  }

  function runDrawCall() {
    const secondsSinceStart = (new Date().getTime() - startTime) / 1000;
    const bufferData = new Float32Array(squareParams.flatMap(({ color, coords, size, speed }) => {
      const angle = secondsSinceStart * speed;
      const { a, b, c, d } = calcSquareCoords(angle, coords, size);
      return [
        ...color, ...a,
        ...color, ...b,
        ...color, ...c,
        ...color, ...a,
        ...color, ...c,
        ...color, ...d,
      ];
    }));

    gl.bufferData(gl.ARRAY_BUFFER, bufferData, gl.STATIC_DRAW);
    gl.vertexAttribPointer(aCoordsLocation, 2, gl.FLOAT, false, 5*4, 3*4);
    gl.vertexAttribPointer(aColorLocation, 3, gl.FLOAT, false, 5*4, 0);
    gl.drawArrays(gl.TRIANGLES, 0, 6 * squareParams.length);
  };
  
  setInterval(() => {
    runDrawCall();
  }, 10);
})();
