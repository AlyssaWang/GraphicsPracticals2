(function () {
  'use strict';

  // Positions

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

  function initModel(canvas, gl, url) {
    var request = new XMLHttpRequest();
    request.open("GET", url);
    request.onreadystatechange = function () {
      if (request.readyState == 4) {
        console.log(JSON.parse(request.responseText));
        runModels(canvas, gl, JSON.parse(request.responseText));
      }
  	};
  	request.send();
  }

  function runModels(canvas, gl, model) {
  	//
  	// Create shaders
  	//
  	var vertexShader = gl.createShader(gl.VERTEX_SHADER);
  	var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

  	gl.shaderSource(vertexShader, vertexShaderText);
  	gl.shaderSource(fragmentShader, fragmentShaderText);

  	gl.compileShader(vertexShader);
  	if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
  		console.error('ERROR compiling vertex shader!', gl.getShaderInfoLog(vertexShader));
  		return;
  	}

  	gl.compileShader(fragmentShader);
  	if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
  		console.error('ERROR compiling fragment shader!', gl.getShaderInfoLog(fragmentShader));
  		return;
  	}

  	var program = gl.createProgram();
  	gl.attachShader(program, vertexShader);
  	gl.attachShader(program, fragmentShader);
  	gl.linkProgram(program);
  	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
  		console.error('ERROR linking program!', gl.getProgramInfoLog(program));
  		return;
  	}
  	gl.validateProgram(program);
  	if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
  		console.error('ERROR validating program!', gl.getProgramInfoLog(program));
  		return;
  	}

    console.log("runModels");

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

  		gl.clearColor(0.75, 0.85, 0.8, 1.0);
  		gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);

  		gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

  		requestAnimationFrame(loop);
  	};
  	requestAnimationFrame(loop);
  }

  // Creates a shader of the given type, uploads the source and

  // Importing constants and functions

  main();

  function main() {
    const canvas = document.querySelector('#glCanvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

    // Error handling
    if (!gl) {
      alert('Unable to initialize WebGL. Your browser or machine may not support it.');
      return;
    }

    gl.clearColor(0.75, 0.85, 0.8, 1.0);
    gl.clearDepth(1.0);
  	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  	gl.enable(gl.DEPTH_TEST);
  	gl.enable(gl.CULL_FACE);
    gl.depthFunc(gl.LEQUAL);
  	gl.frontFace(gl.CCW);
  	gl.cullFace(gl.BACK);


    var urls = ["../models/gem.json",
                "../models/cube.json"];

    // "../models/cat.json"

    for (var i = 0; i < urls.length; i++) {
      var url = urls[i];
      console.log(url);
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
