import {vertexShaderText,
        fragmentShaderText} from './shaderPrograms.js';

import {drawScene} from './drawScene.js';
import {initBuffers} from './initBuffers.js';
import {initShaderProgram} from './initShaderProgram.js';

export function initModel(canvas, gl, url) {
  var request = new XMLHttpRequest();
  request.open("GET", url);
  request.onreadystatechange = function () {
    if (request.readyState == 4) {
      runModel(canvas, gl, JSON.parse(request.responseText));
    }
	}
	request.send();
}

function runModel(canvas, gl, model) {
  var program = initShaderProgram(gl, vertexShaderText, fragmentShaderText);
	gl.useProgram(program);

  initBuffers(gl, program, model);

  drawScene(canvas, gl, program, model);
}
