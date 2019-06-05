export function initBuffers(gl, program, model) {
	var vertices = model.meshes[0].vertices; // will have to update for lotus
	var indices = [].concat.apply([], model.meshes[0].faces);
  var normals = model.meshes[0].normals;

  // POSITIONS
	var posVertexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, posVertexBufferObject);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  gl.vertexAttribPointer(
    gl.getAttribLocation(program, 'aVertexPosition'), // Attribute location
    3, // Number of elements per attribute
    gl.FLOAT, // Type of elements
    gl.FALSE, // Normalize
    0, // Size of an individual vertex
    0 // Offset from the beginning of a single vertex to this attribute
  );
  gl.enableVertexAttribArray(gl.getAttribLocation(program, 'aVertexPosition'));

  // INDICES
	var indexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBufferObject);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

  // NORMALS
  var normalBufferObject = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBufferObject);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
  gl.vertexAttribPointer(
    gl.getAttribLocation(program, 'aVertexNormal'),
    3,
    gl.FLOAT,
    gl.FALSE,
    0,
    0);
  gl.enableVertexAttribArray(gl.getAttribLocation(program, 'aVertexNormal'));

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
    normal: normalBufferObject,
    texture: textureBufferObject,
  };
}
