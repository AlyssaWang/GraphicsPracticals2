// Redo?? Lots of error handling
// From https://www.youtube.com/watch?time_continue=751&v=sM9n73-HiNA

// Load a text resource from a file over the network
export function loadJSON(gl, url) {
	var m = new Model(); // a global var to hold our model data

	var request = new XMLHttpRequest();
	request.open("GET", url);
	request.onreadystatechange = function () {
    if (request.readyState == 4) {
      handleLoadedModel(gl, m, JSON.parse(request.responseText));
    }
	}
	request.send();
}

function Model() {
  this.vbo = [-1,-1,-1]; // init an array with -1
  this.vertexCount = 0; // this will be usefull for glDrawArrays
}

function handleLoadedModel(gl, m, object) {
	console.log("handleLoadedModel");

	var positionArray = new Float32Array(object.meshes[0].vertices);
	m.vbo[0] = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, m.vbo[0]);
	gl.bufferData(gl.ARRAY_BUFFER, positionArray , gl.STATIC_DRAW);

	var normalsArray = new Float32Array(object.meshes[0].normals);
	m.vbo[1] = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, m.vbo[1]);
	gl.bufferData(gl.ARRAY_BUFFER, normalsArray , gl.STATIC_DRAW);

	var texCoordsArray = new Float32Array(object.meshes[0].texturecoords);
	m.vbo[2] = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, m.vbo[2]);
	gl.bufferData(gl.ARRAY_BUFFER, texCoordsArray , gl.STATIC_DRAW);

	// finally let's keep track of the number of vertices
	m.vertexCount = object.meshes[0].normals.length / 3; // Normals have always 3 components
}
