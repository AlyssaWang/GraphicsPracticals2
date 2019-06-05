export function initScene(gl) {
  // Error handling
  if (!gl) {
    alert('Unable to initialize WebGL. Your browser or machine may not support it.');
    return;
  }

  gl.clearColor(0, 0, 0, 1.0);
  gl.clearDepth(1.0); // Clear everything
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.enable(gl.DEPTH_TEST); // Enable depth testing
	gl.enable(gl.CULL_FACE);
  gl.depthFunc(gl.LEQUAL); // Near things obscure far things
	gl.frontFace(gl.CCW);
	gl.cullFace(gl.BACK);

  // Create a perspective matrix to simulate the distortion of perspective in a
  // camera. Our field of view is 45 degrees, with a width/height ratio that
  // matches the display size of the canvas and we only want to see objects
  // between 0.1 units and 100 units away from the camera.
  const fieldOfView = 45 * Math.PI / 180;   // in radians
  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  const zNear = 0.1;
  const zFar = 100.0;
  const projectionMatrix = mat4.create();

  // NOTE: glmatrix.js always has the first argument
  // as the destination to receive the result.
  mat4.perspective(projectionMatrix,
                   fieldOfView,
                   aspect,
                   zNear,
                   zFar);
}
