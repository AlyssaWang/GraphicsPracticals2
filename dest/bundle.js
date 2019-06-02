(function () {
  'use strict';

  // Positions
  const positions = [
    // Front face
    -1.0, -1.0,  1.0,
     1.0, -1.0,  1.0,
     1.0,  1.0,  1.0,
    -1.0,  1.0,  1.0,

    // Back face
    -1.0, -1.0, -1.0,
    -1.0,  1.0, -1.0,
     1.0,  1.0, -1.0,
     1.0, -1.0, -1.0,

    // Top face
    -1.0,  1.0, -1.0,
    -1.0,  1.0,  1.0,
     1.0,  1.0,  1.0,
     1.0,  1.0, -1.0,

    // Bottom face
    -1.0, -1.0, -1.0,
     1.0, -1.0, -1.0,
     1.0, -1.0,  1.0,
    -1.0, -1.0,  1.0,

    // Right face
     1.0, -1.0, -1.0,
     1.0,  1.0, -1.0,
     1.0,  1.0,  1.0,
     1.0, -1.0,  1.0,

    // Left face
    -1.0, -1.0, -1.0,
    -1.0, -1.0,  1.0,
    -1.0,  1.0,  1.0,
    -1.0,  1.0, -1.0,
  ];

  // Colors
  const faceColors = [
    [1.0,  1.0,  1.0,  1.0],    // Front face: white
    [1.0,  0.0,  0.0,  1.0],    // Back face: red
    [0.0,  1.0,  0.0,  1.0],    // Top face: green
    [0.0,  0.0,  1.0,  1.0],    // Bottom face: blue
    [1.0,  1.0,  0.0,  1.0],    // Right face: yellow
    [1.0,  0.0,  1.0,  1.0],    // Left face: purple
  ];

  // Indices
  // Each face = two triangles, indices specify each triangle's position.
  const indices = [
    0,  1,  2,      0,  2,  3,    // front
    4,  5,  6,      4,  6,  7,    // back
    8,  9,  10,     8,  10, 11,   // top
    12, 13, 14,     12, 14, 15,   // bottom
    16, 17, 18,     16, 18, 19,   // right
    20, 21, 22,     20, 22, 23,   // left
  ];

  // Normals
  const vertexNormals = [
    // Front
     0.0,  0.0,  1.0,
     0.0,  0.0,  1.0,
     0.0,  0.0,  1.0,
     0.0,  0.0,  1.0,

    // Back
     0.0,  0.0, -1.0,
     0.0,  0.0, -1.0,
     0.0,  0.0, -1.0,
     0.0,  0.0, -1.0,

    // Top
     0.0,  1.0,  0.0,
     0.0,  1.0,  0.0,
     0.0,  1.0,  0.0,
     0.0,  1.0,  0.0,

    // Bottom
     0.0, -1.0,  0.0,
     0.0, -1.0,  0.0,
     0.0, -1.0,  0.0,
     0.0, -1.0,  0.0,

    // Right
     1.0,  0.0,  0.0,
     1.0,  0.0,  0.0,
     1.0,  0.0,  0.0,
     1.0,  0.0,  0.0,

    // Left
    -1.0,  0.0,  0.0,
    -1.0,  0.0,  0.0,
    -1.0,  0.0,  0.0,
    -1.0,  0.0,  0.0
  ];

  function initBuffers(gl, model) {

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Now pass the list of positions into WebGL to build the
    // shape. We do this by creating a Float32Array from the
    // JavaScript array, then use it to fill the current buffer.
    gl.bufferData(gl.ARRAY_BUFFER,
                  new Float32Array(positions),
                  gl.STATIC_DRAW);

    // Convert the array of colors into a table for all the vertices.
    var colors = [];
    for (var j = 0; j < faceColors.length; ++j) {
      const c = faceColors[j];
      // Repeat each color four times for the four vertices of the face
      colors = colors.concat(c, c, c, c);
    }

    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,
                  new Float32Array(colors),
                  gl.STATIC_DRAW);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
                  new Uint16Array(indices),
                  gl.STATIC_DRAW);

    const normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,
                  new Float32Array(vertexNormals),
                  gl.STATIC_DRAW);

    return {
      position: positionBuffer,
      normal: normalBuffer,
      color: colorBuffer,
      indices: indexBuffer,
    };
  }

  const vertexShaderText = `
  precision mediump float;

  attribute vec3 vertPosition;
  uniform mat4 mWorld;
  uniform mat4 mView;
  uniform mat4 mProj;

  void main()
  {
    gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);
  }
`;

  const fragmentShaderText = `
  void main()
  {
    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
  }
`;

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

  function initModel(canvas, gl, url) {
    var request = new XMLHttpRequest();
    request.open("GET", url);
    request.onreadystatechange = function () {
      if (request.readyState == 4) {
        runModels(canvas, gl, JSON.parse(request.responseText));
      }
  	};
  	request.send();
  }

  function runModels(canvas, gl, model) {

    var program = initShaderProgram(gl, vertexShaderText, fragmentShaderText);
    initBuffers(gl, model);

  	//
  	// Create buffer
  	//
  	var vertices = model.meshes[0].vertices;
  	var indices = [].concat.apply([], model.meshes[0].faces);

  	var posVertexBufferObject = gl.createBuffer();
  	gl.bindBuffer(gl.ARRAY_BUFFER, posVertexBufferObject);
  	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  	var indexBufferObject = gl.createBuffer();
  	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBufferObject);
  	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

  	gl.bindBuffer(gl.ARRAY_BUFFER, posVertexBufferObject);
  	var positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
  	gl.vertexAttribPointer(
  		positionAttribLocation, // Attribute location
  		3, // Number of elements per attribute
  		gl.FLOAT, // Type of elements
  		gl.FALSE,
  		3 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
  		0 // Offset from the beginning of a single vertex to this attribute
  	);
  	gl.enableVertexAttribArray(positionAttribLocation);

  	// Tell OpenGL state machine which program should be active.
  	gl.useProgram(program);

  	var matWorldUniformLocation = gl.getUniformLocation(program, 'mWorld');
  	var matViewUniformLocation = gl.getUniformLocation(program, 'mView');
  	var matProjUniformLocation = gl.getUniformLocation(program, 'mProj');

  	var worldMatrix = new Float32Array(16);
  	var viewMatrix = new Float32Array(16);
  	var projMatrix = new Float32Array(16);
  	mat4.identity(worldMatrix);
  	mat4.lookAt(viewMatrix, [0, 0, -8], [0, 0, 0], [0, 1, 0]);
  	mat4.perspective(projMatrix, glMatrix.toRadian(45), canvas.width / canvas.height, 0.1, 1000.0);

  	gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
  	gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
  	gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);

  	var xRotationMatrix = new Float32Array(16);
  	var yRotationMatrix = new Float32Array(16);

  	//
  	// Main render loop
  	//
  	var identityMatrix = new Float32Array(16);
  	mat4.identity(identityMatrix);
  	var angle = 0;
  	var loop = function () {
  		angle = performance.now() / 1000 / 6 * 2 * Math.PI;
  		mat4.rotate(yRotationMatrix, identityMatrix, angle, [0, 1, 0]);
  		mat4.rotate(xRotationMatrix, identityMatrix, angle / 4, [1, 0, 0]);
  		mat4.mul(worldMatrix, yRotationMatrix, xRotationMatrix);

  		gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);

      gl.clearColor(0, 0, 0, 1.0);
  		gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);

  		gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

  		requestAnimationFrame(loop);
  	};
  	requestAnimationFrame(loop);
  }

  function initScene(gl) {
    // Error handling
    if (!gl) {
      alert('Unable to initialize WebGL. Your browser or machine may not support it.');
      return;
    }

    gl.clearColor(1.0, 1.0, 1.0, 1.0);
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

  // gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque

  // Importing constants and functions

  main();

  function main() {
    const canvas = document.querySelector('#glCanvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

    initScene(gl);

    var urls = ["../models/gem.json",
                "../models/cube.json"];

    // "../models/cat.json"

    for (var i = 0; i < urls.length; i++) {
      var url = urls[i];
      initModel(canvas, gl, url);
    }

    // // Initialize a shader program; this is where all the lighting
    // // for the vertices and so forth is established.
    // const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
    //
    // // Collect all the info needed to use the shader program.
    // // Look up which attributes our shader program is using
    // // for aVertexPosition, aVertexColor and also
    // // look up uniform locations.
    // const programInfo = {
    //   program: shaderProgram,
    //   attribLocations: {
    //     vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
    //     vertexNormal: gl.getAttribLocation(shaderProgram, 'aVertexNormal'),
    //     vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor'),
    //   },
    //   uniformLocations: {
    //     projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
    //     modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
    //     normalMatrix: gl.getUniformLocation(shaderProgram, 'uNormalMatrix'),
    //     uSampler: gl.getUniformLocation(shaderProgram, 'uSampler'),
    //   },
    // };
    //
    // const buffers = initBuffers(gl);
    //
    // var then = 0;
    //
    // function render(now) {
    //   now *= 0.001;  // convert to seconds
    //   const deltaTime = now - then;
    //   then = now;
    //   drawScene(gl, programInfo, buffers, deltaTime);
    //   requestAnimationFrame(render);
    // }
    // requestAnimationFrame(render);
  }

}());
