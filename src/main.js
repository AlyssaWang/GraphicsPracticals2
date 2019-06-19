import {cameraParams} from './cameraParams.js';
import {initCamera} from './initCamera.js';
import {initModel} from './initModel.js';
import {initScene} from './initScene.js';

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
      var textureUrl = textureUrls[i];
      initModel(canvas, gl, modelUrl, textureUrls);
    }
  }
}
