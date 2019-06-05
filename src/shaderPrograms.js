export const vertexShaderText = `
  precision mediump float;

  attribute vec3 vertPosition;
  uniform mat4 mWorld;
  uniform mat4 mView;
  uniform mat4 mProj;

  attribute vec2 aTexture;
  varying highp vec2 vTexture;

  void main()
  {
    gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);
    vTexture = aTexture;
  }
`

export const fragmentShaderText = `
  varying highp vec2 vTexture;
  uniform sampler2D uSampler;

  void main(void) {
    gl_FragColor = texture2D(uSampler, vTexture);
    // gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
  }
`
