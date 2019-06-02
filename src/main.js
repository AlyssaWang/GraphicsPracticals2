import {initModel} from './initModel.js';
import {initScene} from './initScene.js';

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
