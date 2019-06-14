// Modified from https://sites.google.com/site/csc8820/educational/move-a-camera

// Registers key presses and mouse movements to camera movements.
export function initCamera(canvas, params) {
	// Keyboard controls
	document.onkeydown = function(event) {
		switch(event.keyCode) {
			case 37: // Use left arrow to move the camera to the left.
				params.trackLeftRight -= params.step;
				break;
			case 39: // Use right arrow to move the camera to the right.
				params.trackLeftRight += params.step;
				break;
			case 38: // Use up arrow to move the camera upward.
				params.craneUpDown += params.step;
				break;
			case 40: // Use down arrow to move the camera downward.
				params.craneUpDown -= params.step;
				break;
			case 79: // Use o key to move the camera outward.
				params.pushInPullOut += params.step;
				break;
			case 73: // Use i key to move the camera forward.
				params.pushInPullOut -= params.step;
				break;
			default: return;
		}
	}

	// Mouse controls
	var lastX = 0, lastY = 0;
	var dMouseX = 0, dMouseY = 0;
	var trackingMouseMotion = false;

	// If a mouse button is pressed, save the current mouse location
	// and start tracking mouse motion.
	canvas.onmousedown = function(event) {
		var x = event.clientX;
		var y = event.clientY;

		var rect = event.target.getBoundingClientRect();
		// Check if the mouse cursor is in canvas.
		if (rect.left <= x && rect.right > x &&
			rect.top <= y && rect.bottom > y) {
			lastX = x;
			lastY = y;
			trackingMouseMotion = true;
		}
	}

	// If the mouse button is release, stop tracking mouse motion.
	canvas.onmouseup = function(event) {
		trackingMouseMotion = false;
	}

	// Calculate how far the mouse cusor has moved and convert the mouse motion
	// to rotation angles.
	canvas.onmousemove = function(event) {
		var x = event.clientX;
		var y = event.clientY;

		if (trackingMouseMotion) {
			var scale = 1;
			// Calculate how much the mouse has moved along X and Y axis, and then
			// normalize them based on the canvas' width and height.
			dMouseX = (x - lastX)/canvas.width;
			dMouseY = (y - lastY)/canvas.height;

			if (!params.rollCamera) {
				// For camera pitch and yaw motions
				scale = 30;
				// Add the mouse motion to the current rotation angle so that the rotation
				// is added to the previous rotations.
				// Use scale to control the speed of the rotation.
				params.yawAngle += scale * dMouseX;
				// Impose the upper and lower limits to the rotation angle.
				params.yawAngle = Math.max(Math.min(
					params.yawAngle, params.maxYawAngle), params.minYawAngle);

				params.pitchAngle += scale * dMouseY;
				params.pitchAngle = Math.max(Math.min(
					params.pitchAngle, params.maxPitchAngle), params.minPitchAngle);
			} else {
				// For camera roll motion
				scale = 100;

				// Add the mouse motion delta to the rotation angle, don't just replace it.
				// Use scale to control the speed of the rotation.
				params.rollAngle += scale * dMouseX;
				params.rollAngle %= 360;
			}
		}

		// Save the current mouse location in order to calculate the next mouse motion.
		lastX = x;
		lastY = y;
	}
}

// Transforms the scene as per camera movements.
export function moveCamera(params) {
	// Rotation
	mat4.rotate(params.xRotationMatrix, params.identityMatrix, params.pitchAngle, [1, 0, 0]);
	mat4.rotate(params.yRotationMatrix, params.identityMatrix, params.yawAngle, [0, 1, 0]);
	mat4.rotate(params.zRotationMatrix, params.identityMatrix, params.rollAngle, [0, 0, 1]);

	// Translation
	mat4.translate(params.translationMatrix, params.identityMatrix,
		[-params.trackLeftRight, -params.craneUpDown, params.pushInPullOut]);
}

// Applies camera transformations to the scene.
export function applyCamera(params, worldMatrix) {
	// Rotation
	mat4.mul(worldMatrix, params.xRotationMatrix, worldMatrix);
	mat4.mul(worldMatrix, params.yRotationMatrix, worldMatrix);
	mat4.mul(worldMatrix, params.zRotationMatrix, worldMatrix);

	// Translation
	mat4.mul(worldMatrix, params.translationMatrix, worldMatrix);
}
