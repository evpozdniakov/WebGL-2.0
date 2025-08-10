# WebGL-2.0

This is an outline of the ["WebGL 2.0" videos by Andrew Adamson](https://www.youtube.com/playlist?list=PLPbmjY2NVO_X1U1JzLxLDdRn4NmtxyQQo)

## Hello World

### Basic WebGL app

It requires 3 things:
1. Canvas element
2. WebGL context
3. WebGL program

#### Canvas element

This is easy, just add it into your page and give it some width and height. You may want to add a `class` or `id` attribute for convinience.
```html
<canvas width="200" height="200" id="myCanvas"></canvas>
```

#### WebGL rendering context

To get it you run the following command.

```js
const canvas = document.getElementById('myCanvas');
const gl = canvas.getContext('webgl2');
```

#### WebGL program

You need to create a program, then do some magic to make it a valid program, and finally use it. You may have several valid programs, but only one can be used at a time.

```js
const program = gl.createProgram();

// do magic

gl.useProgram(program);
```

### Valid WebGL program

To make and use a valid WebGL program you need to:
- create shaders
- link the program
- make a draw call

The WebGL program consists of exactly two shaders—no more, no less. These must be of two different types:

- Vertex shader
- Fragment shader

Creating a shader is a procedure which consists of 4 steps:

1. Create shader object
2. Set shader source
2. Compile
3. Attach to the program

#### Creating Vertex shader

The `vertexShaderSource` contains shader program code written in <abbr title="OpenGL Shading Language">GLSL</abbr>. You write it for your video card. It will understand and execute it.

```js
const vertexShaderSource = `#version 300 es
void main()
{
  gl_Position = vec4(0.0, 0.0, 0.0, 1.0);
  gl_PointSize = 10.0;
}`;
const vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, vertexShaderSource);
gl.compileShader(vertexShader);
gl.attachShader(program, vertexShader);
```

#### Creating Fragment shader

The `fragmentShaderSource` is also written in GLSL for your <abbr title="Graphics Processing Unit">GPU</abbr>.

```js
const fragmentShaderSource = `#version 300 es
precision mediump float;
out vec4 fragColor;
void main()
{
  fragColor = vec4(1.0, 0.0, 0.0, 1.0);
}`;
const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, fragmentShaderSource);
gl.compileShader(fragmentShader);
gl.attachShader(program, fragmentShader);
```

#### Linking the program

The purpose of linking the program is to combine two shaders into a single executable.

```js
gl.linkProgram(program);
```

This command may fail due to errors in the shader source codes. If it does, you want to see the reason in your dev console.

```js
if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
  console.log(gl.getShaderInfoLog(vertexShader));
  console.log(gl.getShaderInfoLog(fragmentShader));
}
```

#### Making a draw call

A **draw call** is a command that tells WebGL to render geometry based on the currently active shaders, buffers, and settings. Each draw call typically produces **one frame** of a rendered image. To animate scenes, we need hundreds or even thousands of draw calls, each **slightly different** from the previous one—usually by updating positions, colors, or other data to reflect changes over time.

In our simple WebGL program, we are rendering a static image, so we only need a single draw call.

```js
gl.drawArrays(gl.POINTS, 0, 1);
```

Now our program should work properly. Give it a try, [run it](https://evpozdniakov.github.io/WebGL-2.0/01.Programs%20(Hello%20World)/index.html) in your browser, or [view source](https://github.com/evpozdniakov/WebGL-2.0/blob/main/01.Programs%20(Hello%20World)/index.html) in GitHub.

## Precision

The GPU must know the *precision* of each variable used in shaders, and it’s up to you to specify it.

The precision can be one of three values: `lowp`, `mediump`, or `highp`:
- `lowp` – Better performance but lower rendering quality.
- `mediump` – A good balance between performance and quality (default choice for many cases).
- `highp` – Highest precision and quality, but can reduce performance.

### Set precision

There are two ways of setting the precision. You can set *default* precision for a type or *individual* precision for each variable. You can use either of them or a combination.

#### Default precision
You can set a default precision for all variables of a given type in your shader.  
This is usually done at the top of your shader code. For example:

```glsl
precision mediump float;
```

In this case, every float in the shader will use mediump precision unless you explicitly set a different one for a specific variable.

Default precision is especially useful for fragment shaders, where precision can significantly impact performance and rendering quality.


#### Individual precision

You can also set precision for each variable individually. This is done directly in the variable declaration. For example:

```glsl
highp vec3 position;
lowp vec4 color;
```

Here, position uses the highest precision available, while color uses the lowest precision.

Individual precision gives you more control and is useful when different variables have different requirements for accuracy and performance.

#### A note about precision defaults

In most cases, default precision is already set for all types in both vertex and fragment shaders.

The *exception* is the `float` type in fragment shaders—for these, setting a precision is **mandatory**. If you don’t specify it, the shader will fail to compile and WebGL will throw an error.

At a minimum, you should include this in your fragment shader:

```glsl
precision mediump float;
```

#### A note about `int` precision in shaders

While most developers think about precision mainly for floating-point types, integer types also have default precisions—and they differ between vertex and fragment shaders.

- In vertex shaders, `int` defaults to `highp`.
- In fragment shaders, `int` defaults to `mediump`.

This difference can cause *mismatched precision errors* if the same uniform is used in both shaders but relies on the default precision.

To avoid this, it is better to set individual precision for uniforms if they are used in both shaders.

```glsl
// In both vertex and fragment shaders
uniform highp int uIndex;
```

## Uniforms

They are **global variables** used in shaders. This means we can set their values in our JavaScript code, and those values will be accessible inside the shader programs (both vertex and fragment shaders). However, the process can feel a bit counterintuitive: we must first **declare** the uniform variables in our GLSL shader code. Only after that can we **locate** and **assign values** to them from JavaScript.

You may ask yourself, what does "locate" mean in this context?

### Locating a uniform

Shader code and JavaScript run in separate environments. The shader runs on the GPU, while JavaScript runs on the CPU. Just naming something in one place doesn’t automatically link it to the other. In WebGL, locating a uniform means asking the system where that variable actually lives in the shader program.

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

Function like these can be used to set an array of single values. And each value can then be found in the program by index, which is also a uniform value. In the example below we set 3 colors, 3 sizes, 3 coords, and one index. In the draw call we will be able to change only our index to render a specific item.

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
gl.uniform1fv(uSizeLocation, sizes); // `size` is already a flat array
gl.uniform2fv(uCoordsLocation, flatCoords);

// Finally render the dots
for (let i = 0; i < 3; i += 1) {
  gl.uniform1i(uIndexLocation, i);
  gl.drawArrays(gl.POINTS, 0, 1);
}
```
