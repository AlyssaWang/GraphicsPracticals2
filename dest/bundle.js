(function () {
  'use strict';

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

  function drawScene(canvas, gl, program, model) {
    var indices = [].concat.apply([], model.meshes[0].faces);

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
    var render = function () {
      angle = performance.now() / 1000 / 6 * 2 * Math.PI;
      mat4.rotate(yRotationMatrix, identityMatrix, angle, [0, 1, 0]);
      mat4.rotate(xRotationMatrix, identityMatrix, angle / 4, [1, 0, 0]);
      mat4.mul(worldMatrix, yRotationMatrix, xRotationMatrix);

      gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);

      gl.clearColor(0, 0, 0, 1.0);
      gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);

      gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

      requestAnimationFrame(render);
    };
    requestAnimationFrame(render);
  }


  // export function drawScene(gl, programInfo, buffers) {
  //   // Set the drawing position to the "identity" point (center of the scene)
  //   const modelViewMatrix = mat4.create();
  //
  //   // Deliver normal matrix to shader
  //   const normalMatrix = mat4.create();
  //   mat4.invert(normalMatrix,
  //               modelViewMatrix);
  //   mat4.transpose(normalMatrix,
  //                  normalMatrix);
  //
  //   // Tell WebGL how to pull out the positions from the position
  //   // buffer into the vertexPosition attribute
  //   {
  //     const numComponents = 3;
  //     const type = gl.FLOAT;
  //     const normalize = false;
  //     const stride = 0;
  //     const offset = 0;
  //     gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
  //     gl.vertexAttribPointer(
  //         programInfo.attribLocations.vertexPosition,
  //         numComponents,
  //         type,
  //         normalize,
  //         stride,
  //         offset);
  //     gl.enableVertexAttribArray(
  //         programInfo.attribLocations.vertexPosition);
  //   }
  //
  //   // Tell WebGL how to pull out the colors from the color buffer
  //   // into the vertexColor attribute.
  //   {
  //     const numComponents = 4;
  //     const type = gl.FLOAT;
  //     const normalize = false;
  //     const stride = 0;
  //     const offset = 0;
  //     gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
  //     gl.vertexAttribPointer(
  //         programInfo.attribLocations.vertexColor,
  //         numComponents,
  //         type,
  //         normalize,
  //         stride,
  //         offset);
  //     gl.enableVertexAttribArray(
  //         programInfo.attribLocations.vertexColor);
  //   }
  //
  //   // Tell WebGL how to pull out the normals from
  //   // the normal buffer into the vertexNormal attribute.
  //   {
  //     const numComponents = 3;
  //     const type = gl.FLOAT;
  //     const normalize = false;
  //     const stride = 0;
  //     const offset = 0;
  //     gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normal);
  //     gl.vertexAttribPointer(
  //         programInfo.attribLocations.vertexNormal,
  //         numComponents,
  //         type,
  //         normalize,
  //         stride,
  //         offset);
  //     gl.enableVertexAttribArray(
  //         programInfo.attribLocations.vertexNormal);
  //   }
  //
  //   // Tell WebGL which indices to use to index the vertices
  //   gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
  //
  //   // Tell WebGL to use our program when drawing
  //   gl.useProgram(programInfo.program);
  //
  //   // Set the shader uniforms
  //   gl.uniformMatrix4fv(
  //       programInfo.uniformLocations.projectionMatrix,
  //       false,
  //       projectionMatrix);
  //   gl.uniformMatrix4fv(
  //       programInfo.uniformLocations.modelViewMatrix,
  //       false,
  //       modelViewMatrix);
  //   gl.uniformMatrix4fv(
  //       programInfo.uniformLocations.normalMatrix,
  //       false,
  //       normalMatrix);
  //
  //   {
  //     const vertexCount = 36;
  //     const type = gl.UNSIGNED_SHORT;
  //     const offset = 0;
  //     gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
  //   }
  // }

  function initBuffers(gl, program, model) {
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

    return {
      position: posVertexBufferObject,
      indices: indexBufferObject,
    };
  }

  //   // Convert the array of colors into a table for all the vertices.
  //   var colors = [];
  //   for (var j = 0; j < faceColors.length; ++j) {
  //     const c = faceColors[j];
  //     // Repeat each color four times for the four vertices of the face
  //     colors = colors.concat(c, c, c, c);
  //   }
  //
  //   const colorBuffer = gl.createBuffer();
  //   gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  //   gl.bufferData(gl.ARRAY_BUFFER,
  //                 new Float32Array(colors),
  //                 gl.STATIC_DRAW);
  //
  //   const normalBuffer = gl.createBuffer();
  //   gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  //   gl.bufferData(gl.ARRAY_BUFFER,
  //                 new Float32Array(vertexNormals),
  //                 gl.STATIC_DRAW);
  //
  //   return {
  //     normal: normalBuffer,
  //     color: colorBuffer,
  //   };

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
        runModel(canvas, gl, JSON.parse(request.responseText));
      }
  	};
  	request.send();
  }

  function runModel(canvas, gl, model) {
    var program = initShaderProgram(gl, vertexShaderText, fragmentShaderText);
  	gl.useProgram(program);

    initBuffers(gl, program, model);

    drawScene(canvas, gl, program, model);
  }

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

  // gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque

  main();

  function main() {
    const canvas = document.querySelector('#glCanvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

    initScene(gl);

    var urls = [
                "../models/lotus_OBJ_high.json",
                "../models/gem.json",
                "../models/cube.json"
               ];

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
    // function render(now) {
    //   drawScene(gl, programInfo, buffers);
    //   requestAnimationFrame(render);
    // }
    // requestAnimationFrame(render);
  }

}());
