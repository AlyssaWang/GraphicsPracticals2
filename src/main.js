// Importing constants and functions
import {positions,
        faceColors,
        indices,
        vertexNormals} from './constants.js';

import {drawScene} from './drawScene.js';
import {initBuffers} from './initBuffers.js';
import {initModel} from './initModel.js';
import {initShaderProgram} from './initShaderProgram.js';

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
