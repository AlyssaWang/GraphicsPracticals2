export const vertexShaderText = `
  precision mediump float;

  uniform mat4 mWorld;
  uniform mat4 mView;
  uniform mat4 mProj;
  uniform mat4 mNorm;

  attribute vec2 aTexture;
  attribute vec3 aVertexNormal;
  attribute vec3 aVertexPosition;

  varying highp vec2 vTexture;
  varying highp vec3 vLighting;

  void main()
  {
    gl_Position = mProj * mView * mWorld * vec4(aVertexPosition, 1.0);
    vTexture = aTexture;

    // Apply lighting effect
    highp vec3 ambientLight = vec3(0.3, 0.3, 0.3);
    highp vec3 directionalLightColor = vec3(1, 1, 1);
    highp vec3 directionalVector = normalize(vec3(0.85, 0.8, 0.75));

    // To apply universal lighting w/o camera:
    // highp vec4 transformedNormal = mNorm * mWorld * vec4(aVertexNormal, 1.0);
    highp vec4 transformedNormal = mNorm * vec4(aVertexNormal, 1.0);

    highp float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0);
    vLighting = ambientLight + (directionalLightColor * directional);
  }
`

export const fragmentShaderText = `
  varying highp vec2 vTexture;
  varying highp vec3 vLighting;

  uniform sampler2D uSampler;

  void main(void) {
    highp vec4 texelColor = texture2D(uSampler, vTexture);

    gl_FragColor = vec4(texelColor.rgb * vLighting, texelColor.a);
  }
`
