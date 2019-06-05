import {vertexShaderText,
        fragmentShaderText} from './shaderPrograms.js';

import {initBuffers} from './initBuffers.js';
import {initShaderProgram} from './initShaderProgram.js';
import {loadTexture} from './loadTexture.js';
import {drawModel} from './drawModel.js';

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
