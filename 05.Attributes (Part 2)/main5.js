(function() {
  /**
   * @type {HTMLCanvasElement}
   */
  const canvas = document.querySelector('#myCanvas5');
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

  const vertexData = [
    [-0.21, -0.41,     10,     0,   100, 0 ],
    [-0.26,  0.24,     20,     154, 205, 50],
    [ 0.49, -0.51,     30,     107, 142, 35],
    [ 0.54,  0.34,     40,     128, 128, 0 ],
    [ 0.09, -0.11,     50,     85,  107, 47],
  ];

  const data = new DataView(new ArrayBuffer(40));
  let position = 0;
  const littleEndian = true;
  const floatToInt16 = (v) => Math.floor(v * (1 << 15));
  vertexData.forEach((item) => {
    const x = floatToInt16(item[0]);
    const y = floatToInt16(item[1]);
    data.setInt16(position+0, x, littleEndian); // coord x
    data.setInt16(position+2, y, littleEndian); // coord y
    data.setInt8(position+4, item[2]);          // point size
    data.setInt8(position+5, item[3]);          // R
    data.setInt8(position+6, item[4]);          // G
    data.setInt8(position+7, item[5]);          // B
    position += 8;
  });

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  gl.vertexAttribPointer(aCoordsLocation, 2, gl.SHORT, true, 8, 0);
  gl.vertexAttribPointer(aPointSizeLocation, 1, gl.UNSIGNED_BYTE, false, 8, 4);
  gl.vertexAttribPointer(aColorLocation, 3, gl.UNSIGNED_BYTE, true, 8, 5);

  gl.enableVertexAttribArray(aCoordsLocation);
  gl.enableVertexAttribArray(aPointSizeLocation);
  gl.enableVertexAttribArray(aColorLocation);

  gl.drawArrays(gl.POINTS, 0, 5);
})();
