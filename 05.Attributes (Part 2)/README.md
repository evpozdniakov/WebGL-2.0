# WebGL-2.0

This is an outline of the ["WebGL 2.0" videos by Andrew Adamson](https://www.youtube.com/playlist?list=PLPbmjY2NVO_X1U1JzLxLDdRn4NmtxyQQo)

[See all chapters](https://github.com/evpozdniakov/WebGL-2.0/blob/main/README.md)

## 04.Attributes (Part 2)

### Default (fallback) value

We can assign a **default value** to each attribute. In this case, the attribute's value will stay the same for all vertices and won't change over time.

This might seem useless, but it actually has a few practical uses:

- **Shared shaders:** You might use the same shader in different programs.  
  In some cases, certain attributes are not needed and can safely use a fixed default value.  
- **Debugging:** Before you enable an attribute with `enableVertexAttribArray(...)`, WebGL will use its default value as a fallback — this can help verify that your shader logic is correct.

#### Assigning default value

To set a default value for an attribute, you can use one of the following `gl.vertexAttrib*()` methods. These functions are similar to the ones used for setting uniform values, but there are some key differences. For example, to assign a default value to an attribute of type `int`, you need to call the method `gl.vertexAttribI4i()` and pass your value followed by three zeros (to fill the unused components of a `ivec4`).

```js
// Float types
/* float */  gl.vertexAttrib1f(attribLoc, a);
/* vec2  */  gl.vertexAttrib2f(attribLoc, a, b);
/* vec3  */  gl.vertexAttrib3f(attribLoc, a, b, c);
/* vec4  */  gl.vertexAttrib4f(attribLoc, a, b, c, d);

// Int types
/* int */    gl.vertexAttribI4i(attribLoc, a, 0, 0, 0);
/* ivec2 */  gl.vertexAttribI4i(attribLoc, a, b, 0, 0);
/* ivec3 */  gl.vertexAttribI4i(attribLoc, a, b, c, 0);
/* ivec4 */  gl.vertexAttribI4i(attribLoc, a, b, c, d);

// Unsigned int types
/* uint */   gl.vertexAttribI4ui(attribLoc, a, 0, 0, 0);
/* uvec2 */  gl.vertexAttribI4ui(attribLoc, a, b, 0, 0);
/* uvec3 */  gl.vertexAttribI4ui(attribLoc, a, b, c, 0);
/* uvec4 */  gl.vertexAttribI4ui(attribLoc, a, b, c, d);
```

### Again about `vertexAttribPointer`

Have you ever wondered how this method knows **which buffer** to use? It takes six parameters — but none of them refers directly to a buffer!

The answer is simple: `vertexAttribPointer` always uses the **buffer currently bound** to the target `gl.ARRAY_BUFFER`.

When you call `gl.bindBuffer(gl.ARRAY_BUFFER, someBuffer)`, you're telling WebGL that from now on, all attribute pointer settings and buffer operations refer to this buffer. So you need to call `vertexAttribPointer(...)` before you bind the next buffer.

Let's now talk in details about two arguments of this method, `type` and `normalized`.

#### Argument `type`

This is the **third argument** of the method. In our earlier examples, we always used `gl.FLOAT` because our buffer data was stored in a `Float32Array`.

However, if you use a different **typed array** to create your buffer, you must pass the corresponding `type` value to match the data format.

| JS Typed Array | `type` parameter     | Bytes |
|----------------|----------------------|-------------------|
|  Int8Array     |  gl.BYTE             | 1                 |
|  Uint8Array    |  gl.UNSIGNED_BYTE    | 1                 |
|  Int16Array    |  gl.SHORT            | 2                 |
|  Uint16Array   |  gl.UNSIGNED_SHORT   | 2                 |
|  Int32Array    |  gl.INT              | 4                 |
|  Uint32Array   |  gl.UNSIGNED_INT     | 4                 |
|  Float32Array  |  gl.FLOAT            | 4                 |


#### Argument `normalized`

This is the **fourth argument** of the method. When set to `false`, this argument has **no effect** — the data is read exactly as it appears in the buffer. When set to `true`, WebGL will **normalize** the data, meaning it converts integer values to a floating-point range depending on whether the data type is signed or unsigned:

- For **signed** integers (`gl.BYTE`, `gl.SHORT`, `gl.INT`) values are mapped from `[-range, +range]` to `[-1.0, +1.0]`
- For **unsigned** integers (`gl.UNSIGNED_BYTE`, `gl.UNSIGNED_SHORT`, `gl.UNSIGNED_INT`) values are mapped from `[0, range]` to `[0.0, 1.0]`

It can be beneficial to use `normalized=true` to shorten buffer data. Below are two examples which do the same thing, but the `colorData` JS buffer in the first example is 4 times smaller than in the second.

```js
const colorData = new Uint8Array([
  0,   100, 0,  // DarkGreen
  154, 205, 50, // YellowGreen
  107, 142, 35, // OliveDrab
  128, 128, 0,  // Olive
  85,  107, 47, // DarkOliveGreen
]);

const colorBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.bufferData(gl.ARRAY_BUFFER, colorData, gl.STATIC_DRAW);
gl.vertexAttribPointer(aColorLocation, 3, gl.UNSIGNED_BYTE, true, 3, 0);

console.log(colorData.byteLength); // 15
```

```js
const colorData = new Float32Array([
  0,     0.392, 0,     // DarkGreen
  0.604, 0.804, 0.196, // YellowGreen
  0.42,  0.557, 0.137, // OliveDrab
  0.502, 0.502, 0,     // Olive
  0.333, 0.42,  0.184  // DarkOliveGreen
]);

const colorBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.bufferData(gl.ARRAY_BUFFER, colorData, gl.STATIC_DRAW);
gl.vertexAttribPointer(aColorLocation, 3, gl.FLOAT, true, 12, 0);

console.log(colorData.byteLength); // 60
```

### Now about `vertexAttribIPointer`

This method is almost the same as `vertexAttribPointer`, but notice the extra **I** in its name — that stands for **integer**.

The main difference is that it **does not include** the `normalized` argument. Everything else works exactly the same way.

Use this method when the attribute type in your shader is an **integer type** — that is, `int`, `uint`, `ivec*`, or `uvec*`.

In other words, use `vertexAttribIPointer` when your GLSL attribute **expects integer values**, not simply when your buffer happens to contain integer data.

If the attribute in GLSL is a **floating-point type** (`float`, `vec*`), you should use `vertexAttribPointer` instead — even if your buffer stores integers. In that case, WebGL can automatically convert or normalize the values as needed.