(function () {
  'use strict';

  // Camera control parameters
  var cameraParams = {
    pitchAngle: 0,
    minPitchAngle: -90,
    maxPitchAngle: 90,

    yawAngle: 0,
    minYawAngle: -90,
    maxYawAngle: 90,

    rollCamera: false,

    rollAngle: 0,
    minRollAngle: -180,
    maxRollAngle: 180,

    trackLeftRight: 0,
    pushInPullOut: 0,
    craneUpDown: 0,

    step: 0.5,

    identityMatrix: mat4.identity(new Float32Array(16)),

    translationMatrix: new Float32Array(16),

    xRotationMatrix: new Float32Array(16),
  	yRotationMatrix: new Float32Array(16),
  	zRotationMatrix: new Float32Array(16),
  };

  // Modified from https://sites.google.com/site/csc8820/educational/move-a-camera

  // Registers key presses and mouse movements to camera movements.
  function initCamera(canvas, params) {
  	// Keyboard controls
  	document.onkeydown = function(event) {
  		switch(event.keyCode) {
  			case 37: // Use left arrow to move the camera to the left.
  				params.trackLeftRight -= params.step;
  				break;
  			case 39: // Use right arrow to move the camera to the right.
  				params.trackLeftRight += params.step;
  				break;
  			case 38: // Use up arrow to move the camera upward.
  				params.craneUpDown += params.step;
  				break;
  			case 40: // Use down arrow to move the camera downward.
  				params.craneUpDown -= params.step;
  				break;
  			case 79: // Use o key to move the camera outward.
  				params.pushInPullOut += params.step;
  				break;
  			case 73: // Use i key to move the camera forward.
  				params.pushInPullOut -= params.step;
  				break;
  			default: return;
  		}
  	};

  	// Mouse controls
  	var lastX = 0, lastY = 0;
  	var dMouseX = 0, dMouseY = 0;
  	var trackingMouseMotion = false;

  	// If a mouse button is pressed, save the current mouse location
  	// and start tracking mouse motion.
  	canvas.onmousedown = function(event) {
  		var x = event.clientX;
  		var y = event.clientY;

  		var rect = event.target.getBoundingClientRect();
  		// Check if the mouse cursor is in canvas.
  		if (rect.left <= x && rect.right > x &&
  			rect.top <= y && rect.bottom > y) {
  			lastX = x;
  			lastY = y;
  			trackingMouseMotion = true;
  		}
  	};

  	// If the mouse button is release, stop tracking mouse motion.
  	canvas.onmouseup = function(event) {
  		trackingMouseMotion = false;
  	};

  	// Calculate how far the mouse cusor has moved and convert the mouse motion
  	// to rotation angles.
  	canvas.onmousemove = function(event) {
  		var x = event.clientX;
  		var y = event.clientY;

  		if (trackingMouseMotion) {
  			var scale = 1;
  			// Calculate how much the mouse has moved along X and Y axis, and then
  			// normalize them based on the canvas' width and height.
  			dMouseX = (x - lastX)/canvas.width;
  			dMouseY = (y - lastY)/canvas.height;

  			if (!params.rollCamera) {
  				// For camera pitch and yaw motions
  				scale = 30;
  				// Add the mouse motion to the current rotation angle so that the rotation
  				// is added to the previous rotations.
  				// Use scale to control the speed of the rotation.
  				params.yawAngle += scale * dMouseX;
  				// Impose the upper and lower limits to the rotation angle.
  				params.yawAngle = Math.max(Math.min(
  					params.yawAngle, params.maxYawAngle), params.minYawAngle);

  				params.pitchAngle += scale * dMouseY;
  				params.pitchAngle = Math.max(Math.min(
  					params.pitchAngle, params.maxPitchAngle), params.minPitchAngle);
  			} else {
  				// For camera roll motion
  				scale = 100;

  				// Add the mouse motion delta to the rotation angle, don't just replace it.
  				// Use scale to control the speed of the rotation.
  				params.rollAngle += scale * dMouseX;
  				params.rollAngle %= 360;
  			}
  		}

  		// Save the current mouse location in order to calculate the next mouse motion.
  		lastX = x;
  		lastY = y;
  	};
  }

  // Transforms the scene as per camera movements.
  function moveCamera(params) {
  	// Rotation
  	mat4.rotate(params.xRotationMatrix, params.identityMatrix, params.pitchAngle, [1, 0, 0]);
  	mat4.rotate(params.yRotationMatrix, params.identityMatrix, params.yawAngle, [0, 1, 0]);
  	mat4.rotate(params.zRotationMatrix, params.identityMatrix, params.rollAngle, [0, 0, 1]);

  	// Translation
  	mat4.translate(params.translationMatrix, params.identityMatrix,
  		[-params.trackLeftRight, -params.craneUpDown, params.pushInPullOut]);
  }

  // Applies camera transformations to the scene.
  function applyCamera(params, worldMatrix) {
  	// Rotation
  	mat4.mul(worldMatrix, params.xRotationMatrix, worldMatrix);
  	mat4.mul(worldMatrix, params.yRotationMatrix, worldMatrix);
  	mat4.mul(worldMatrix, params.zRotationMatrix, worldMatrix);

  	// Translation
  	mat4.mul(worldMatrix, params.translationMatrix, worldMatrix);
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

    // Uniforms
    gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix,
                        gl.FALSE,
                        viewMatrix);
    gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix,
                        gl.FALSE,
                        projMatrix);

    // Textures
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, object.texture);
    gl.uniform1i(programInfo.uniformLocations.uSampler, 0);

    // Normals
    var normalMatrix = mat4.create();
    mat4.invert(normalMatrix, viewMatrix);
    mat4.transpose(normalMatrix, normalMatrix);

    // Identity
    var identityMatrix = new Float32Array(16);
    mat4.identity(identityMatrix);

    var xRotationMatrix = new Float32Array(16);
    var yRotationMatrix = new Float32Array(16);
    var angle = 0;

    // Main render loop
    var render = function () {
      gl.clearColor(0.0, 0.0, 0.0, 1.0);
      gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);

      gl.uniformMatrix4fv(programInfo.uniformLocations.worldMatrix,
                          gl.FALSE,
                          worldMatrix);
      gl.uniformMatrix4fv(programInfo.uniformLocations.normalMatrix,
                          gl.FALSE,
                          normalMatrix);

      // Transformation parameters
      // angle = performance.now() / 1000 / 6 * 2 * Math.PI; // Use only without camera
      mat4.rotate(yRotationMatrix, identityMatrix, angle, [0, 1, 0]);
      mat4.rotate(xRotationMatrix, identityMatrix, angle / 4, [1, 0, 0]);
      moveCamera(cameraParams);

      // Transformations
      mat4.mul(worldMatrix, yRotationMatrix, xRotationMatrix);
      applyCamera(cameraParams, worldMatrix);

      gl.drawElements(gl.TRIANGLES, object.indices.length, gl.UNSIGNED_SHORT, object.indexBufferObject);

      requestAnimationFrame(render);
    };
    requestAnimationFrame(render);
  }

  // Creates buffers for positions, indices, normals, and textures.
  function initBuffers(gl, program, model) {
  	var vertices = model.meshes[0].vertices;
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

    // To apply universal lighting w/o camera:
    // highp vec4 transformedNormal = mNorm * mWorld * vec4(aVertexNormal, 1.0);
    highp vec4 transformedNormal = mNorm * vec4(aVertexNormal, 1.0);

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

  // Opens an XMLHttpRequest to parse a JSON file. Sends to parseModel().
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

  // Creates shaders, buffers, uniform locations, and textures.
  // Sends all of the above to drawModel().
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
      indices: [].concat.apply([], model.meshes[0].faces),
      texture: loadTexture(gl, textureUrl),
    };

    initBuffers(gl, programInfo.program, model);
  	gl.useProgram(programInfo.program);
    drawModel(canvas, gl, object, programInfo);
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

  main();

  function main() {
    const canvas = document.querySelector('#glCanvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

    initScene(gl);
    initCamera(canvas, cameraParams);

    // Currently unable to load more than one model at a time.
    var modelUrls = [
      // "../models/cube.json"
      "../models/gem.json",
      // "../models/lotus_OBJ_high.json",
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
