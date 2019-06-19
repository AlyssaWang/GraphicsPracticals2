import {cameraParams} from './cameraParams.js';
import {moveCamera,
        applyCamera} from './initCamera.js';

export function drawModel(canvas, gl, object, programInfo) {
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

  // Transformations
  var translationMatrix = new Float32Array(16);
  var translation1 = [0, 0, 0];
  var translation2 = [-40, 0, 0];

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
