# WebGL-2.0

This is an outline of the ["WebGL 2.0" videos by Andrew Adamson](https://www.youtube.com/playlist?list=PLPbmjY2NVO_X1U1JzLxLDdRn4NmtxyQQo)

[See all chapters](https://github.com/evpozdniakov/WebGL-2.0/blob/main/README.md)

## 01.Programs (Hello World)

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

To get it you need to run this code:

```js
const canvas = document.querySelector('#myCanvas');
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

The `vertexShaderSource` contains shader program code written in OpenGL Shading Language (**GLSL**). You write it for your video card. It will understand and execute it.

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

The `fragmentShaderSource` is also written in GLSL for your Graphics Processing Unit (**GPU**).

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
