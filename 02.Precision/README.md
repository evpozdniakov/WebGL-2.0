# WebGL-2.0

This is an outline of the ["WebGL 2.0" videos by Andrew Adamson](https://www.youtube.com/playlist?list=PLPbmjY2NVO_X1U1JzLxLDdRn4NmtxyQQo)

[See all chapters](https://github.com/evpozdniakov/WebGL-2.0/blob/main/README.md)

## 02.Precision

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