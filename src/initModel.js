import {vertexShaderText,
        fragmentShaderText} from './shaderPrograms.js';

import {initBuffers} from './initBuffers.js';
import {initShaderProgram} from './initShaderProgram.js';

export function initModel(canvas, gl, url) {
  var request = new XMLHttpRequest();
  request.open("GET", url);
  request.onreadystatechange = function () {
    if (request.readyState == 4) {
      runModels(canvas, gl, JSON.parse(request.responseText));
    }
	}
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
