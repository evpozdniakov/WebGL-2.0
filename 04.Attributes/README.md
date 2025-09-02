# WebGL-2.0

This is an outline of the ["WebGL 2.0" videos by Andrew Adamson](https://www.youtube.com/playlist?list=PLPbmjY2NVO_X1U1JzLxLDdRn4NmtxyQQo)

[See all chapters](https://github.com/evpozdniakov/WebGL-2.0/blob/main/README.md)

## 04.Attributes

Without attributes, we can't render anything more interesting than single dots. Attributes change that: they let us define multiple vertices in one draw call, which makes it possible to draw a line (2 vertices), a triangle (3 vertices), or even complex 3D objects (hundreds or thousands of vertices).

Attributes are the properties we assign to each vertex. They can hold things like the vertex's position in 2D or 3D space, its color (with transparency), its texture coordinates, and other data.

### Attributes vs uniforms

| Uniforms | Attributes |
|----------|------------|
| Can be used in both **vertex** and **fragment** shaders | Available only in the **vertex shader** |
| Remain **constant** during a draw call | Can be **different for each vertex** |
| Good for passing **global data** (e.g. transformation matrices, time, light direction) | Good for passing **per-vertex data** (e.g. positions, colors, texture coordinates) |

### Attribute locations

Attribute locations work just like uniform locations:

- they're just numbers
- they don't change over time
- you only need to find them once

#### Looking up for attribute location

To find the attribute location you use `getAttribLocation()` method, which is similar to one for uniforms:

```js
const aCoordsLocation = gl.getAttribLocation(program, 'aCoords');
```

#### Setting attribute location

Unlike uniform locations, the attribute location can be defined by us in advance. There are two ways to achieve that.

##### Option 1

We can define the attribute location **in JS code**. It needs to be done **before linking** the program.

```js
const aCoordsLocation = 0;
gl.bindAttribLocation(program, aCoordsLocation, 'aCoords');
```

##### Option 2

We can define the attribute location **in GLSL code**. This option is available only in **GLSL ES 3.0**

```glsl
#version 300 es
layout(location = 0) in vec4 aCoords;
```

#### Enabling attribute

By default, all attributes are **disabled** in WebGL. If an attribute is disabled, the GPU will ignore buffer data and instead use a constant value (usually zero) for every vertex.

To tell WebGL to read data for an attribute from the currently bound buffer, we need to **enable** it with `enableVertexAttribArray`, passing in its location:

```js
gl.enableVertexAttribArray(aCoordLocation);
```

It can be done at any moment prior to a draw call.

### Data

Now let's prepare the data. We will need to put them into an array and use this array as a source for the GLSL buffer.

#### Homogeneous data

Let's set up our data for **3 vertices**. For each vertex, we want to specify its:

- 2D coordinates
- color
- point size

These are different kinds of data:  

- Coordinates are floats in the range **-1.0 to 1.0**.  
- Point size is a positive integer, usually between **1 and ~100**.  
- Color values are floats in the range **0.0 to 1.0**.

Since we want to combine all of them into a **single data structure** (because eventually this data will go into a GLSL buffer), we need to make them **homogeneous**. That means converting everything to the same type.

For this, we'll use a `Float32Array`. (Unfortunately you cannot use `Float16Array` since it is not accepted by WebGL 2.0 for some reason.)

```js
const data = new Float32Array([
  // Coords       Point size      Color
  -0.5, 0.5,      50,             0,   0.5, 1,    // 1st vertex
  0,   -0.5,      40,             1,   0.5, 0,    // 2nd vertex
  0.5,  0.5,      20,             0.8, 0,   0.8,  // 3rd vertex
]);
```

#### GLSL buffer

To send our data to the GPU, we need to set up a **buffer**. The steps are:

1. **Create** a buffer object.  
2. **Bind** it to a binding point (in this case `ARRAY_BUFFER`).  
3. **Upload** our data into the bound buffer. 

Here's how that looks in code:

```js
const buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
```

It may look like magic now, but don't worry—the details of these steps will be explained later.

#### Linking data to attributes

Up to now we have:

- attribute locations
- a single buffer with all the data

To the GPU, that buffer is just a flat list of numbers. It doesn’t know which bytes are
*coordinates* vs *color* vs *point size*. We use `vertexAttribPointer` to describe the
layout of that data **for each attribute**. This is the most interesting part but also the most complicated.

##### `vertexAttribPointer` arguments

```js
gl.vertexAttribPointer(
  index,      // Attribute location.
  size,       // How many components (numbers) are required by the attribute.
              // This value depends on the attribute's type:
              // - for type `int` or `uint` or `float` it is 1,
              // - for `vec2` it is 2,
              // - for `vec3` it is 3,
              // - and for `vec4` it is 4.
              // This value can be nothing else but 1, 2, 3 or 4.
  type,       // Type of data in the buffer; for floats it is always `gl.FLOAT`.
  normalized: // Should be set to `false`. (This parameter will be explained later.)
  stride:     // How many bytes in the buffer are reserved for a single vertex
  offset:     // How many bytes need to be skipped to get to the attribute data
)
```

##### Example with coords attribute

```js
gl.vertextArrtrbPointer(
  aCoordLocation, // coords attribute
  2,              // `vec2` -> 2 components (x and y)
  gl.FLOAT,       //
  false,          //
  24,             // 6 floats (2 for coords, 1 point size and 3 for RGB color)
                  // multiplied by 4 bytes (in `Float32Array` each element
                  // takes 32 bits or 4 bytes)
  0,              // Nothing to skip as the coords are the first floats
                  // in the vertex data
);
```

### Draw call

After setting up our data and linking it to attributes, we also need to change the way
we make a **draw call**.

When rendering a single dot earlier, we used:

```js
gl.drawArrays(gl.POINTS, 0, 1);
```

Now, to render a triangle from 3 vertices, we write:

```js
gl.drawArrays(gl.TRIANGLES, 0, 3);
```

Arguments explained:

- First argument (mode) – how to connect the vertices (gl.POINTS, gl.LINES, gl.TRIANGLES, etc.).
- Second argument (first) – where to start reading vertices in the buffer (usually 0).
- Third argument (count) – how many vertices to read from the buffer.

So here, `gl.TRIANGLES` means “every group of 3 vertices forms a triangle,”
0 means “start from the beginning of the buffer,”
and 3 means “read 3 vertices total.”

See the [attributes in action](https://evpozdniakov.github.io/WebGL-2.0/04.Attributes/index.html) and check the [source files](https://github.com/evpozdniakov/WebGL-2.0/tree/main/04.Attributes).