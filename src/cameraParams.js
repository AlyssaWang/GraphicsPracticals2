// Camera control parameters
export var cameraParams = {
  pitchAngle: 0,
  minPitchAngle: -90,
  maxPitchAngle: 90,

  yawAngle: 0,
  minYawAngle: -90,
  maxYawAngle: 90,

  rollCamera: false,

  rollAngle: 0,
  minRollAngle: -180,
  maxRollAngle: 180,

  trackLeftRight: 0,
  pushInPullOut: 0,
  craneUpDown: 0,

  step: 0.5,

  identityMatrix: mat4.identity(new Float32Array(16)),

  translationMatrix: new Float32Array(16),

  xRotationMatrix: new Float32Array(16),
	yRotationMatrix: new Float32Array(16),
	zRotationMatrix: new Float32Array(16),
}
