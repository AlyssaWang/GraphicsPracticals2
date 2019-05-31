export const vertexShaderText = `
  precision mediump float;

  attribute vec3 vertPosition;
  uniform mat4 mWorld;
  uniform mat4 mView;
  uniform mat4 mProj;

  void main()
  {
    gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);
  }
`

export const fragmentShaderText = `
  void main()
  {
    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
  }
`
