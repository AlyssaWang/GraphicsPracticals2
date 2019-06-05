export function initBuffers(gl, program, model) {
	var vertices = model.meshes[0].vertices; // will have to update for lotus
	var indices = [].concat.apply([], model.meshes[0].faces);
  var normals = 

  // POSITIONS
	var posVertexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, posVertexBufferObject);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  gl.vertexAttribPointer(
    gl.getAttribLocation(program, 'vertPosition'), // Attribute location
    3, // Number of elements per attribute
    gl.FLOAT, // Type of elements
    gl.FALSE,
    3 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
    0 // Offset from the beginning of a single vertex to this attribute
  );
  gl.enableVertexAttribArray(gl.getAttribLocation(program, 'vertPosition'));

  // INDICES
	var indexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBufferObject);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

  // NORMALS
  var normalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

  // TEXTURES
  var textureBufferObject = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, textureBufferObject);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  gl.vertexAttribPointer(
    gl.getAttribLocation(program, 'aTexture'),
    2,
    gl.FLOAT,
    gl.FALSE,
    0,
    0
  );
  gl.enableVertexAttribArray(gl.getAttribLocation(program, 'aTexture'));

  return {
    position: posVertexBufferObject,
    indices: indexBufferObject,
    // normal: normalBufferObject,
    texture: textureBufferObject,
  };
}
