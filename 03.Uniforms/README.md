# WebGL-2.0

This is an outline of the ["WebGL 2.0" videos by Andrew Adamson](https://www.youtube.com/playlist?list=PLPbmjY2NVO_X1U1JzLxLDdRn4NmtxyQQo)

[See all chapters](https://github.com/evpozdniakov/WebGL-2.0/blob/main/README.md)

## 03.Uniforms

They are **global variables** used in shaders. This means we can set their values in our JavaScript code, and those values will be accessible inside the shader programs (both vertex and fragment shaders). However, the process can feel a bit counterintuitive: we must first **declare** the uniform variables in our GLSL shader code. Only after that can we **locate** and **assign values** to them from JavaScript.

You may ask yourself, what does "locate" mean in this context?

### Locating a uniform

Shader code and JavaScript run in separate environments. The shader runs on the GPU, while JavaScript runs on the CPU. Just naming something in one place doesn't automatically link it to the other. In WebGL, locating a uniform means asking the system where that variable actually lives in the shader program.

So in our shader code we may declare and use our uniform `uColor` of type `vec4` like this:

```glsl
uniform vec4 uColor;

void main()
{
  fragColor = uColor;
}
```

And in our JS code we can locate it and assign it value like this:

```js
const uColorLocation = gl.getUniformLocation(program, 'uColor');

gl.uniform4f(uColorLocation, 1.0, 0.0, 0.0, 1.0);
```

### Assigning a value

There are multiple functions available for us to assign a value to our uniform. You will use one of them depending on the uniform type. You will be able to assign a single value or an array of values.

#### Single value

You can use the following set of functions to assign a float or an int or an unsigned int or their vectors. Let's call it a *single value*.

```js
// Float types
/* float */  gl.uniform1f(uniformLoc, a);
/* vec2  */  gl.uniform2f(uniformLoc, a, b);
/* vec3  */  gl.uniform3f(uniformLoc, a, b, c);
/* vec4  */  gl.uniform4f(uniformLoc, a, b, c, d);

// Int types
/* int */    gl.uniform1i(uniformLoc, a);
/* ivec2 */  gl.uniform2i(uniformLoc, a, b);
/* ivec3 */  gl.uniform3i(uniformLoc, a, b, c);
/* ivec4 */  gl.uniform4i(uniformLoc, a, b, c, d);

// Unsigned int types
/* uint */   gl.uniform1u(uniformLoc, a);
/* uvec2 */  gl.uniform2u(uniformLoc, a, b);
/* uvec3 */  gl.uniform3u(uniformLoc, a, b, c);
/* uvec4 */  gl.uniform4u(uniformLoc, a, b, c, d);
```

#### Array of single values

Each function from above has its `v` version, when it expects only two parameters: unform location and an array of values.

```js
// Float types
/* float */  gl.uniform1fv(uniformLoc, [a]);
/* vec2  */  gl.uniform2fv(uniformLoc, [a, b]);
/* vec3  */  gl.uniform3fv(uniformLoc, [a, b, c]);
/* vec4  */  gl.uniform4fv(uniformLoc, [a, b, c, d]);

// Int types
/* int */    gl.uniform1iv(uniformLoc, [a]);
/* ivec2 */  gl.uniform2iv(uniformLoc, [a, b]);
/* ivec3 */  gl.uniform3iv(uniformLoc, [a, b, c]);
/* ivec4 */  gl.uniform4iv(uniformLoc, [a, b, c, d]);

// Unsigned int types
/* uint */   gl.uniform1uv(uniformLoc, [a]);
/* uvec2 */  gl.uniform2uv(uniformLoc, [a, b]);
/* uvec3 */  gl.uniform3uv(uniformLoc, [a, b, c]);
/* uvec4 */  gl.uniform4uv(uniformLoc, [a, b, c, d]);
```

#### Usage

Function like these can be used to set an array of single values. And each value can then be found in the program by index. We can use uniform to set the index.

In the example below we set 3 colors, 3 sizes, 3 coords, and one index. In the draw call we will be able to change only our index to render a specific item.

Vertext shader

```glsl
#version 300 es
uniform mediump vec4 uColor[3];
uniform mediump float uSize[3];
uniform mediump vec2 uCoords[3];
uniform highp int uIndex;
void main()
{
  gl_Position = vec4(uCoords[uIndex], 0.0, 1.0);
  gl_PointSize = uSize[uIndex];
}
```

Fragment shader

```glsl
#version 300 es
uniform mediump vec4 uColor[3];
uniform highp int uIndex;
out mediump vec4 fragColor;
void main()
{
  fragColor = uColor[uIndex];
}
```

JS

```js
const uColorLocation = gl.getUniformLocation(program, 'uColor');
const uSizeLocation = gl.getUniformLocation(program, 'uSize');
const uCoordsLocation = gl.getUniformLocation(program, 'uCoords');
const uIndexLocation = gl.getUniformLocation(program, 'uIndex');

const colors = [
  [1, 0, 0, 1],
  [0, 1, 0, 1],
  [0, 0, 1, 1],
];
const sizes = [30, 60, 90];
const coords = [
  [-0.7, -0.5],
  [ 0.5, -0.6],
  [ 0.1,  0.4],
];

// Then we need to transform `colors` and `coords` into flat arrays
const flatColors = colors.flat();
const flatCoords = coords.flat();
gl.uniform4fv(uColorLocation, flatColors);
gl.uniform1fv(uSizeLocation, sizes); // `sizes` is already a flat array
gl.uniform2fv(uCoordsLocation, flatCoords);

// Finally render the dots
for (let i = 0; i < 3; i += 1) {
  gl.uniform1i(uIndexLocation, i);
  gl.drawArrays(gl.POINTS, 0, 1);
}
```

See the [uniforms in action](https://evpozdniakov.github.io/WebGL-2.0/03.Uniforms/index.html) and check the [source files](https://github.com/evpozdniakov/WebGL-2.0/tree/main/03.Uniforms).