import { DualQuaternion } from './DualQuaternion';
import * as THREE from '../../three.js/build/three.js';
 //COLORS
var Colors = {
  red: 0xf25346,
  white: 0xd8d0d1,
  brown: 0x59332e,
  pink: 0xF5986E,
  brownDark: 0x23190f,
  blue: 0x68c3c0,
};
class AirCamera {
  constructor(position) {
    this.dq_pos = new DualQuaternion.fromEulerVector(0, 0, 0, position);
   
    this.mesh.name = "airPlane";

    // Create the cabin
    var geomCockpit = new THREE.BoxGeometry(60, 5, 5, 1, 1, 1);
    var matCockpit = new THREE.MeshPhongMaterial({ color: Colors.red, shading: THREE.FlatShading });
    var cockpit = new THREE.Mesh(geomCockpit, matCockpit);
    cockpit.castShadow = true;
    cockpit.receiveShadow = true;
    this.mesh.add(cockpit);


    var geomPropeller = new THREE.BoxGeometry(20, 10, 10, 1, 1, 1);
    var matPropeller = new THREE.MeshPhongMaterial({ color: Colors.brown, shading: THREE.FlatShading });
    this.propeller = new THREE.Mesh(geomPropeller, matPropeller);
    this.propeller.castShadow = true;
    this.propeller.receiveShadow = true;

    this.mesh.position.fromArray(this.dq_pos.getVector());
  }

  move(parentDQPosition) {
    if (move) {
      this.dq_pos = this.dq_pos.mul(parentDQPosition);
    }
    const vector = this.dq_pos.getVector();
    const real = this.dq_pos.getReal().getEuler();
    this.mesh.position.fromArray(vector);
    this.mesh.rotation.set(real[0], real[1], real[2]);
  }
};

export { AirCamera };