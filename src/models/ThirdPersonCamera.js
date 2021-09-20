
import * as THREE from '../../three.js/build/three.js';

class ThirdPersonCamera {
  constructor(params) {
    this._params = params;
    this._camera = params.camera;

    this._currentPosition = new THREE.Vector3();
    this._currentLookat = new THREE.Vector3();
  }

  _CalculateIdealOffset() {
    const idealOffset = new THREE.Vector3(-20, 30, 0);
    idealOffset.applyQuaternion(this._params.target.quaternion);
    idealOffset.add(this._params.target.position);
    return idealOffset;
  }

  _CalculateIdealLookat() {
    const idealLookat = new THREE.Vector3(90, -20, 0);
    idealLookat.applyQuaternion(this._params.target.quaternion);
    idealLookat.add(this._params.target.position);
    return idealLookat;
  }

  Update(timeElapsed = 1) {
    const idealOffset = this._CalculateIdealOffset();
    const idealLookat = this._CalculateIdealLookat();

    // const t = 0.05;
    // const t = 4.0 * timeElapsed;
    const t = 1.0 - Math.pow(0.001, timeElapsed);

    this._currentPosition.lerp(idealOffset, t);
    this._currentLookat.lerp(idealLookat, t);

    this._camera.position.copy(this._currentPosition);
    this._camera.lookAt(this._currentLookat);
  }
}

export { ThirdPersonCamera };