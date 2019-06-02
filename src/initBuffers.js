export function initBuffers(gl, program, model) {
	var vertices = model.meshes[0].vertices;
	var indices = [].concat.apply([], model.meshes[0].faces);

	var posVertexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, posVertexBufferObject);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

	var indexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBufferObject);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

	gl.bindBuffer(gl.ARRAY_BUFFER, posVertexBufferObject);
	var positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
	gl.vertexAttribPointer(
		positionAttribLocation, // Attribute location
		3, // Number of elements per attribute
		gl.FLOAT, // Type of elements
		gl.FALSE,
		3 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
		0 // Offset from the beginning of a single vertex to this attribute
	);
	gl.enableVertexAttribArray(positionAttribLocation);

  return {
    position: posVertexBufferObject,
    indices: indexBufferObject,
  };
}

//   // Convert the array of colors into a table for all the vertices.
//   var colors = [];
//   for (var j = 0; j < faceColors.length; ++j) {
//     const c = faceColors[j];
//     // Repeat each color four times for the four vertices of the face
//     colors = colors.concat(c, c, c, c);
//   }
//
//   const colorBuffer = gl.createBuffer();
//   gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
//   gl.bufferData(gl.ARRAY_BUFFER,
//                 new Float32Array(colors),
//                 gl.STATIC_DRAW);
//
//   const normalBuffer = gl.createBuffer();
//   gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
//   gl.bufferData(gl.ARRAY_BUFFER,
//                 new Float32Array(vertexNormals),
//                 gl.STATIC_DRAW);
//
//   return {
//     normal: normalBuffer,
//     color: colorBuffer,
//   };
