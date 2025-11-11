# WebGL-2.0

This is an outline of the ["WebGL 2.0" videos by Andrew Adamson](https://www.youtube.com/playlist?list=PLPbmjY2NVO_X1U1JzLxLDdRn4NmtxyQQo)

[See all chapters](https://github.com/evpozdniakov/WebGL-2.0/blob/main/README.md)

## 09.Mimpams (Textures Part 2)

### What is a mipmap

A mipmap is a chain of progressively smaller versions of the same texture (each level is typically half the width and height of the previous one, down to 1×1).

Its purpose is to improve **rendering quality and performance** when textures are displayed at smaller sizes or sharp viewing angles.

Instead of always sampling from the full-resolution image, the GPU automatically chooses the most appropriate mipmap level based on how large the texture appears on screen.

Why it matters:
- Reduces aliasing and shimmering when textures are minified (far away or at steep angles).
- Improves cache locality and can be faster than sampling a single large texture.
- Costs about **33% extra memory** for the full chain (1 + 1/4 + 1/16 + … ≈ 4/3 of the base level).

### How to make a mipmap

In WebGL you can build the chain automatically or manually.

#### Automatic generation

This is very easy — just call `generateMipmap()` function.

```js
gl.bindTexture(gl.TEXTURE_2D, tex);
// This line sets our png image at the level 0 (original texture).
gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, png);
// And this line generates 1+ levels of the mipmap
gl.generateMipmap(gl.TEXTURE_2D);
```

#### Manual generation

You may want to generate the mipmap manually when:

- You want higher-quality downsampling than the driver's default.
- You're generating textures at each level programmatically.

You will have to call `texImage2D()` for each level with an image roughly **half the width and height** of the previous one, until you reach a 1×1 image.

```js
gl.bindTexture(gl.TEXTURE_2D, tex);
// Level 0 — base image
gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, png);
// Levels 1+
gl.texImage2D(gl.TEXTURE_2D, 1, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, png1);
gl.texImage2D(gl.TEXTURE_2D, 2, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, png2);
...
// Last level N — must be 1×1 pixels
gl.texImage2D(gl.TEXTURE_2D, N, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, pngN);
```

#### Rules for calculating image sizes per level

Each mipmap level (starting from level 0) must have dimensions reduced by approximately half compared to the previous level.

##### Odd dimensions

If the original image width or height is odd, the division by two produces a fraction — in this case, the result is **floored**.

For example:

- 101 → 50 → 25 → 12 → 6 → 3 → 1

##### Non-square textures

If *one side is much larger/smaller* than the other (for example, 1024×32), mipmapping continues halving each dimension independently.

The smaller dimension will reach 1 pixel first, while the larger side will keep halving until it also reaches 1.

For example:

- (1024×32) → (512×16) → (256×8) → (128×4) → (64×2) → (32×1) → (16×1) → (8×1) → (4×1) → (2×1) → (1×1)

### How to use a mipmap

Once you have mip levels, you enable them via minification filters.

Basic setup:

```js
// To use mipmaps for minification choose one of four options:

// nearest texel from nearest level
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_NEAREST);

// linear texel from nearest level
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);

// nearest texel, blend between two levels
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);

// trilinear filtering
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
```

See the [Mipmap in action](https://evpozdniakov.github.io/WebGL-2.0/09.Mipmaps%20(Textures%20Part%202)/index.html) and check the [source files](https://github.com/evpozdniakov/WebGL-2.0/tree/main/09.Mipmaps%20(Textures%20Part%202)).
