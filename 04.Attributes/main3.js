(function() {
  /**
   * @type {HTMLCanvasElement}
   */
  const canvas = document.querySelector('#myCanvas3');
  const gl = canvas.getContext('webgl2');
  
  const program = gl.createProgram();
  
  const vertexShaderSource = (
    `#version 300 es
    layout(location = 0) in highp vec2 aCoords;
    layout(location = 1) in highp vec3 aColor;
    out highp vec3 vColor;
    void main()
    {
      gl_Position = vec4(aCoords, 0.0, 1.0);
      vColor = aColor;
    }`
  );
  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, vertexShaderSource);
  gl.compileShader(vertexShader);
  gl.attachShader(program, vertexShader);
  
  const fragmentShaderSource = (
    `#version 300 es
    in highp vec3 vColor;
    out highp vec4 fragColor;
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

  const aCoordsLocation = 0;
  const aColorLocation = 1;

  gl.enableVertexAttribArray(aCoordsLocation);
  gl.enableVertexAttribArray(aColorLocation);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

  function calcSquareCoords(angle, coords, size) {
    const halfSize = size/2;
    const [x, y] = coords;
    const a = [x + Math.cos(angle + Math.PI*3/4)*halfSize, y + Math.sin(angle + Math.PI*3/4)*halfSize];
    const b = [x + Math.cos(angle + Math.PI*1/4)*halfSize, y + Math.sin(angle + Math.PI*1/4)*halfSize];
    const c = [x + Math.cos(angle - Math.PI*1/4)*halfSize, y + Math.sin(angle - Math.PI*1/4)*halfSize];
    const d = [x + Math.cos(angle - Math.PI*3/4)*halfSize, y + Math.sin(angle - Math.PI*3/4)*halfSize];
    return { a, b, c, d };
  }

  function calcHandCoords(angle, length, size) {
    const handStartCoords = [0, 0];
    const centerSquareCoords = calcSquareCoords(angle, handStartCoords, size);
    const handleEndCoords = [Math.cos(angle)*length, Math.sin(angle)*length];
    const endSquareCoords = calcSquareCoords(angle, handleEndCoords, size);
    return {
      a: centerSquareCoords.a,
      b: endSquareCoords.b,
      c: endSquareCoords.c,
      d: centerSquareCoords.d,
    }
  }

  function runDrawCall() {
    const date = new Date();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const secondsSinceBeginningOfHour = minutes*60 + seconds;
    const secondsSinceNoonOrMidnight = hours%12*3600 + secondsSinceBeginningOfHour;
    const hourHand = {
      angle: Math.PI/2-secondsSinceNoonOrMidnight/(12*3600)*Math.PI*2,
      length: 0.5,
      size: 0.14,
      color: [0, 0, 0],
    };
    const minuteHand = {
      angle: Math.PI/2 - secondsSinceBeginningOfHour/3600*Math.PI*2,
      length: 0.9,
      size: 0.07,
      color: [0.3, 0.3, 0.3],
    };
    const secondHand = {
      angle: Math.PI/2-seconds/60*Math.PI*2,
      length: 0.99,
      size: 0.02,
      color: [0.8, 0.2, 0.2],
    };
    const secondOtherHand = {
      angle: (Math.PI/2-seconds/60*Math.PI*2) + Math.PI,
      length: 0.2,
      size: 0.02,
      color: [0.8, 0.2, 0.2],
    };
    const hands = [hourHand, minuteHand, secondHand, secondOtherHand];
    const bufferData = new Float32Array(hands.flatMap(({ angle, length, size, color }) => {
      const handCoords = calcHandCoords(angle, length, size);
      const red = [1, 0, 0];
      return [
        ...color, ...handCoords.a,
        ...color, ...handCoords.b,
        ...color, ...handCoords.c,
        ...color, ...handCoords.a,
        ...color, ...handCoords.c,
        ...color, ...handCoords.d,
      ];
    }));

    gl.bufferData(gl.ARRAY_BUFFER, bufferData, gl.STATIC_DRAW);
    gl.vertexAttribPointer(aCoordsLocation, 2, gl.FLOAT, false, 5*4, 3*4);
    gl.vertexAttribPointer(aColorLocation, 3, gl.FLOAT, false, 5*4, 0);
    gl.drawArrays(gl.TRIANGLES, 0, 6*hands.length);
  };

  setInterval(() => {
    runDrawCall();
  }, 1000);

  runDrawCall();
})();
