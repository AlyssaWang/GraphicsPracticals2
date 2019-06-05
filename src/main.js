import {initScene} from './initScene.js';
import {initModel} from './drawModel.js';

main();

function main() {
  const canvas = document.querySelector('#glCanvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

  initScene(gl);

  var modelUrls = [
    // "../models/lotus_OBJ_high.json",
    "../models/gem.json",
    // "../models/cube.json"
  ];

  var textureUrls = [
    // "../models/green.png",
    "../models/cube.png",
  ];

  if (modelUrls.length = textureUrls.length) {
    for (var i = 0; i < modelUrls.length; i++) {
      var modelUrl = modelUrls[i];
      var textureUrl = textureUrls[i];
      initModel(canvas, gl, modelUrl, textureUrls);
    }
  }
}
