import {vertexShaderText,
        fragmentShaderText} from './shaderPrograms.js';

import {initBuffers} from './initBuffers.js';
import {initShaderProgram} from './initShaderProgram.js';
import {loadTexture} from './loadTexture.js';

export function initModel(canvas, gl, modelUrl, textureUrl) {
  var request = new XMLHttpRequest();
  request.open("GET", modelUrl);
  request.onreadystatechange = function () {
    if (request.readyState == 4) {
      parseModel(canvas, gl, JSON.parse(request.responseText), textureUrl);
    }
	}
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
      uSampler: gl.getUniformLocation(shaderProgram, 'uSampler'),
    },
  };

  var buffers = initBuffers(gl, programInfo.program, model);
  var indices = [].concat.apply([], model.meshes[0].faces);
  var texture = loadTexture(gl, textureUrl);

  var object = {
    buffers: buffers,
    indices: indices,
    texture: texture,
  };

	gl.useProgram(programInfo.program);

  drawObject(canvas, gl, object, programInfo);
}

function drawObject(canvas, gl, object, programInfo) {
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

  var xRotationMatrix = new Float32Array(16);
  var yRotationMatrix = new Float32Array(16);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, object.texture);
  gl.uniform1i(programInfo.uniformLocations.uSampler, 0);

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

    gl.uniformMatrix4fv(programInfo.uniformLocations.worldMatrix,
                        gl.FALSE,
                        worldMatrix);

    gl.clearColor(0, 0, 0, 1.0);
    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);

    gl.drawElements(gl.TRIANGLES, object.indices.length, gl.UNSIGNED_SHORT, 0);

    requestAnimationFrame(render);
  };
  requestAnimationFrame(render);
}
