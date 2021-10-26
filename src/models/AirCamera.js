import { DualQuaternion } from "./DualQuaternion";
import { Quaternion } from "./Quaternion";
import * as THREE from "../../three.js/build/three.js";
//COLORS
var Colors = {
  red: 0xf25346,
  white: 0xd8d0d1,
  brown: 0x59332e,
  pink: 0xf5986e,
  brownDark: 0x23190f,
  blue: 0x68c3c0,
};
class AirCamera {
  constructor(dq) {
    this.offset = new DualQuaternion.fromEulerVector(0, 0, 0, [0, -8, 0]);
    this.offsetEnd = new DualQuaternion.fromEulerVector(0, 0, 0, [20, 0, 0]);
    this.dq_pos = dq.mul(this.offset);
    this.mesh = new THREE.Object3D();

    this.mesh.name = "AirCamera";

    // Create the cabin
    const geomBase = new THREE.BoxGeometry(5, 5, 5, 1, 1, 1);
    const matBase = new THREE.MeshPhongMaterial({
      color: Colors.red,
      shading: THREE.FlatShading,
    });
    const base = new THREE.Mesh(geomBase, matBase);
    base.castShadow = true;
    base.receiveShadow = true;

    this.mesh.add(base);

    const geomGun = new THREE.BoxGeometry(20, 1, 1, 1, 1, 1);
    const matGun = new THREE.MeshPhongMaterial({
      color: Colors.brown,
      shading: THREE.FlatShading,
    });
    this.gun = new THREE.Mesh(geomGun, matGun);
    this.gun.castShadow = true;
    this.gun.receiveShadow = true;
    this.gun.position.set(10, -2, 0);
    this.mesh.add(this.gun);

    this.mesh.position.fromArray(this.dq_pos.getVector());
  }

  move(parentDQPosition, targetDQPosition) {
    this.dq_pos = this.offset.mul(parentDQPosition);
    const vector = this.dq_pos.getVector();
    this.mesh.position.fromArray(vector);

    if (targetDQPosition) {
      const dq_mouse_pos_about_fly =  this.dq_pos
        .inverse()
        .mul(targetDQPosition);

      // Угол между векторами орудия и мышки
      let q_gun_angle = new Quaternion.fromBetweenVectors(
        this.offsetEnd.getVector(),
        dq_mouse_pos_about_fly.getVector()
      );  
      
      this.mesh.setRotationFromEuler(
        new THREE.Euler(
          ...q_gun_angle.getEulerForThree()
        )
      );  
    }
  }
}

export { AirCamera };
