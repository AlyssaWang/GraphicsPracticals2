export function drawScene(canvas, gl, program, model) {
  var indices = [].concat.apply([], model.meshes[0].faces);

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
  var render = function () {
    angle = performance.now() / 1000 / 6 * 2 * Math.PI;
    mat4.rotate(yRotationMatrix, identityMatrix, angle, [0, 1, 0]);
    mat4.rotate(xRotationMatrix, identityMatrix, angle / 4, [1, 0, 0]);
    mat4.mul(worldMatrix, yRotationMatrix, xRotationMatrix);

    gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);

    gl.clearColor(0, 0, 0, 1.0);
    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);

    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

    requestAnimationFrame(render);
  };
  requestAnimationFrame(render);
}


// export function drawScene(gl, programInfo, buffers) {
//   // Set the drawing position to the "identity" point (center of the scene)
//   const modelViewMatrix = mat4.create();
//
//   // Deliver normal matrix to shader
//   const normalMatrix = mat4.create();
//   mat4.invert(normalMatrix,
//               modelViewMatrix);
//   mat4.transpose(normalMatrix,
//                  normalMatrix);
//
//   // Tell WebGL how to pull out the positions from the position
//   // buffer into the vertexPosition attribute
//   {
//     const numComponents = 3;
//     const type = gl.FLOAT;
//     const normalize = false;
//     const stride = 0;
//     const offset = 0;
//     gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
//     gl.vertexAttribPointer(
//         programInfo.attribLocations.vertexPosition,
//         numComponents,
//         type,
//         normalize,
//         stride,
//         offset);
//     gl.enableVertexAttribArray(
//         programInfo.attribLocations.vertexPosition);
//   }
//
//   // Tell WebGL how to pull out the colors from the color buffer
//   // into the vertexColor attribute.
//   {
//     const numComponents = 4;
//     const type = gl.FLOAT;
//     const normalize = false;
//     const stride = 0;
//     const offset = 0;
//     gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
//     gl.vertexAttribPointer(
//         programInfo.attribLocations.vertexColor,
//         numComponents,
//         type,
//         normalize,
//         stride,
//         offset);
//     gl.enableVertexAttribArray(
//         programInfo.attribLocations.vertexColor);
//   }
//
//   // Tell WebGL how to pull out the normals from
//   // the normal buffer into the vertexNormal attribute.
//   {
//     const numComponents = 3;
//     const type = gl.FLOAT;
//     const normalize = false;
//     const stride = 0;
//     const offset = 0;
//     gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normal);
//     gl.vertexAttribPointer(
//         programInfo.attribLocations.vertexNormal,
//         numComponents,
//         type,
//         normalize,
//         stride,
//         offset);
//     gl.enableVertexAttribArray(
//         programInfo.attribLocations.vertexNormal);
//   }
//
//   // Tell WebGL which indices to use to index the vertices
//   gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
//
//   // Tell WebGL to use our program when drawing
//   gl.useProgram(programInfo.program);
//
//   // Set the shader uniforms
//   gl.uniformMatrix4fv(
//       programInfo.uniformLocations.projectionMatrix,
//       false,
//       projectionMatrix);
//   gl.uniformMatrix4fv(
//       programInfo.uniformLocations.modelViewMatrix,
//       false,
//       modelViewMatrix);
//   gl.uniformMatrix4fv(
//       programInfo.uniformLocations.normalMatrix,
//       false,
//       normalMatrix);
//
//   {
//     const vertexCount = 36;
//     const type = gl.UNSIGNED_SHORT;
//     const offset = 0;
//     gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
//   }
// }
