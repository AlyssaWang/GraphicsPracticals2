(function () {
  'use strict';

  function initScene(gl) {
    // Error handling
    if (!gl) {
      alert('Unable to initialize WebGL. Your browser or machine may not support it.');
      return;
    }

    gl.clearColor(0, 0, 0, 1.0);
    gl.clearDepth(1.0); // Clear everything
  	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  	gl.enable(gl.DEPTH_TEST); // Enable depth testing
  	gl.enable(gl.CULL_FACE);
    gl.depthFunc(gl.LEQUAL); // Near things obscure far things
  	gl.frontFace(gl.CCW);
  	gl.cullFace(gl.BACK);

    // Create a perspective matrix to simulate the distortion of perspective in a
    // camera. Our field of view is 45 degrees, with a width/height ratio that
    // matches the display size of the canvas and we only want to see objects
    // between 0.1 units and 100 units away from the camera.
    const fieldOfView = 45 * Math.PI / 180;   // in radians
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100.0;
    const projectionMatrix = mat4.create();

    // NOTE: glmatrix.js always has the first argument
    // as the destination to receive the result.
    mat4.perspective(projectionMatrix,
                     fieldOfView,
                     aspect,
                     zNear,
                     zFar);
  }

  const vertexShaderText = `
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

    highp vec4 transformedNormal = mNorm * mWorld * vec4(aVertexNormal, 1.0);

    highp float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0);
    vLighting = ambientLight + (directionalLightColor * directional);
  }
`;

  const fragmentShaderText = `
  varying highp vec2 vTexture;
  varying highp vec3 vLighting;

  uniform sampler2D uSampler;

  void main(void) {
    highp vec4 texelColor = texture2D(uSampler, vTexture);

    gl_FragColor = vec4(texelColor.rgb * vLighting, texelColor.a);
  }
`;

  function initBuffers(gl, program, model) {
  	var vertices = model.meshes[0].vertices; // will have to update for lotus
  	var indices = [].concat.apply([], model.meshes[0].faces);
    var normals = model.meshes[0].normals;

    // POSITIONS
  	var posVertexBufferObject = gl.createBuffer();
  	gl.bindBuffer(gl.ARRAY_BUFFER, posVertexBufferObject);
  	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    gl.vertexAttribPointer(
      gl.getAttribLocation(program, 'aVertexPosition'), // Attribute location
      3, // Number of elements per attribute
      gl.FLOAT, // Type of elements
      gl.FALSE, // Normalize
      0, // Size of an individual vertex
      0 // Offset from the beginning of a single vertex to this attribute
    );
    gl.enableVertexAttribArray(gl.getAttribLocation(program, 'aVertexPosition'));

    // INDICES
  	var indexBufferObject = gl.createBuffer();
  	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBufferObject);
  	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    // NORMALS
    var normalBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBufferObject);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
    gl.vertexAttribPointer(
      gl.getAttribLocation(program, 'aVertexNormal'),
      3,
      gl.FLOAT,
      gl.FALSE,
      0,
      0);
    gl.enableVertexAttribArray(gl.getAttribLocation(program, 'aVertexNormal'));

    // TEXTURES
    var textureBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, textureBufferObject);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    gl.vertexAttribPointer(
      gl.getAttribLocation(program, 'aTexture'),
      2,
      gl.FLOAT,
      gl.FALSE,
      0,
      0
    );
    gl.enableVertexAttribArray(gl.getAttribLocation(program, 'aTexture'));

    return {
      position: posVertexBufferObject,
      indices: indexBufferObject,
      normal: normalBufferObject,
      texture: textureBufferObject,
    };
  }

  // Creates a shader of the given type, uploads the source and
  // compiles it.
  function loadShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    // Error handling
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }

    return shader;
  }

  function initShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // If creating the shader program failed, alert
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
      return null;
    }

    return shaderProgram;
  }

  // https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Using_textures_in_WebGL
  // Initialize a texture and load an image.
  // When the image finished loading copy it into the texture.

  function loadTexture(gl, url) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Because images have to be download over the internet
    // they might take a moment until they are ready.
    // Until then put a single pixel in the texture so we can
    // use it immediately. When the image has finished downloading
    // we'll update the texture with the contents of the image.
    const level = 0;
    const internalFormat = gl.RGBA;
    const width = 1;
    const height = 1;
    const border = 0;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;
    const pixel = new Uint8Array([0, 0, 255, 255]);  // opaque blue
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                  width, height, border, srcFormat, srcType,
                  pixel);

    const image = new Image();
    image.onload = function() {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                    srcFormat, srcType, image);

      // WebGL1 has different requirements for power of 2 images
      // vs non power of 2 images so check if the image is a
      // power of 2 in both dimensions.
      if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
         // Yes, it's a power of 2. Generate mips.
         gl.generateMipmap(gl.TEXTURE_2D);
      } else {
         // No, it's not a power of 2. Turn off mips and set
         // wrapping to clamp to edge
         gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
         gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
         gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      }
    };
    image.src = url;

    return texture;
  }

  function isPowerOf2(value) {
    return (value & (value - 1)) == 0;
  }

  function drawModel(canvas, gl, object, programInfo) {
    var worldMatrix = new Float32Array(16);
    var viewMatrix = new Float32Array(16);
    var projMatrix = new Float32Array(16);
    mat4.identity(worldMatrix);
    mat4.lookAt(viewMatrix, [0, 0, -8], [0, 0, 0], [0, 1, 0]);
    mat4.perspective(projMatrix,
                     glMatrix.toRadian(45),
                     canvas.width / canvas.height,
                     0.1,
                     1000.0);

    gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix,
                        gl.FALSE,
                        viewMatrix);
    gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix,
                        gl.FALSE,
                        projMatrix);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, object.texture);
    gl.uniform1i(programInfo.uniformLocations.uSampler, 0);

    var normalMatrix = mat4.create();
    mat4.invert(normalMatrix, viewMatrix);
    mat4.transpose(normalMatrix, normalMatrix);

    var xRotationMatrix = new Float32Array(16);
    var yRotationMatrix = new Float32Array(16);

    //
    // Main render loop
    //
    var identityMatrix = new Float32Array(16);
    mat4.identity(identityMatrix);
    var angle = 0;
    var render = function () {
      gl.clearColor(0, 0, 0, 1.0);
      gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);

      gl.uniformMatrix4fv(programInfo.uniformLocations.worldMatrix,
                          gl.FALSE,
                          worldMatrix);

      // Lighting
      gl.uniformMatrix4fv(programInfo.uniformLocations.normalMatrix,
                          gl.FALSE,
                          normalMatrix);

      // Rotation
      angle = performance.now() / 1000 / 6 * 2 * Math.PI;
      mat4.rotate(yRotationMatrix, identityMatrix, angle, [0, 1, 0]);
      mat4.rotate(xRotationMatrix, identityMatrix, angle / 4, [1, 0, 0]);
      mat4.mul(worldMatrix, yRotationMatrix, xRotationMatrix);

      gl.drawElements(gl.TRIANGLES, object.indices.length, gl.UNSIGNED_SHORT, 0);

      requestAnimationFrame(render);
    };
    requestAnimationFrame(render);
  }

  function initModel(canvas, gl, modelUrl, textureUrl) {
    var request = new XMLHttpRequest();
    request.open("GET", modelUrl);
    request.onreadystatechange = function () {
      if (request.readyState == 4) {
        parseModel(canvas, gl, JSON.parse(request.responseText), textureUrl);
      }
  	};
  	request.send();
  }

  function parseModel(canvas, gl, model, textureUrl) {
    var shaderProgram = initShaderProgram(gl, vertexShaderText, fragmentShaderText);
    var programInfo = {
      program: shaderProgram,
      uniformLocations: {
        worldMatrix: gl.getUniformLocation(shaderProgram, 'mWorld'),
        projectionMatrix: gl.getUniformLocation(shaderProgram, 'mProj'),
        modelViewMatrix: gl.getUniformLocation(shaderProgram, 'mView'),
        normalMatrix: gl.getUniformLocation(shaderProgram, 'mNorm'),
        uSampler: gl.getUniformLocation(shaderProgram, 'uSampler'),
      },
    };

    var object = {
      buffers: initBuffers(gl, programInfo.program, model),
      indices: [].concat.apply([], model.meshes[0].faces),
      texture: loadTexture(gl, textureUrl),
    };

  	gl.useProgram(programInfo.program);

    drawModel(canvas, gl, object, programInfo);
  }

  main();

  function main() {
    const canvas = document.querySelector('#glCanvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

    initScene(gl);

    var modelUrls = [
      // "../models/lotus_OBJ_high.json",
      "../models/gem.json",
      // "../models/cube.json"
    ];

    var textureUrls = [
      // "../models/green.png",
      "../models/squares.png",
    ];

    if (modelUrls.length = textureUrls.length) {
      for (var i = 0; i < modelUrls.length; i++) {
        var modelUrl = modelUrls[i];
        initModel(canvas, gl, modelUrl, textureUrls);
      }
    }
  }

}());
