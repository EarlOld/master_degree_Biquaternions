import { DualQuaternion } from "./DualQuaternion";
import { Quaternion } from "./Quaternion";
import * as THREE from "../../three.js/build/three.js";
import { COLORS } from "../services";

class AirTransmitter {
  constructor(dq, haveGun = true, len) {
    this.offset = new DualQuaternion.fromEulerVector(0, 0, 0, [0, -8, 0]);
    this.offsetEnd = new DualQuaternion.fromEulerVector(0, 0, 0, [100, 0, 0]);
    this.dq_pos = dq.mul(this.offset);
    this.mesh = new THREE.Object3D();
    this.len = len;

    this.mesh.name = "AirTransmitter";

    // Create the cabin
    const geomBase = new THREE.BoxGeometry(5, 5, 5, 1, 1, 1);
    const matBase = new THREE.MeshPhongMaterial({
      color: COLORS.red,
      shading: THREE.FlatShading,
    });
    const base = new THREE.Mesh(geomBase, matBase);
    base.castShadow = true;
    base.receiveShadow = true;

    this.mesh.add(base);
    if (haveGun) {
      this.setGun(false, true);
    }

    this.mesh.position.fromArray(this.dq_pos.getVector());
  }

  setGun(connected = false, initial = false) {
    const geomGun = new THREE.BoxGeometry(
      connected ? this.len : 20,
      1,
      1,
      1,
      1,
      1
    );
    const matGun = new THREE.MeshPhongMaterial({
      color: connected ? COLORS.brownDark : COLORS.red,
      shading: THREE.FlatShading,
    });
    this.mesh.remove(this.gun);
    this.gun = new THREE.Mesh(geomGun, matGun);
    this.gun.castShadow = true;
    this.gun.receiveShadow = true;
    this.gun.position.set(connected ? this.len / 2 : 10, 0, 0);
    this.mesh.add(this.gun);
  }

  move(parentDQPosition, targetDQPosition) {
    this.dq_pos = this.offset.mul(parentDQPosition);
    const vector = this.dq_pos.getVector();
    this.mesh.position.fromArray(vector);

    if (targetDQPosition) {
      this.setGun(true);

      const dq_mouse_pos_about_fly = this.dq_pos
        .inverse()
        .mul(targetDQPosition);

      let q_gun_angle = new Quaternion.fromBetweenVectors(
        this.offsetEnd.getVector(),
        dq_mouse_pos_about_fly.getVector()
      );

      this.mesh.setRotationFromQuaternion(
        new THREE.Quaternion(
          q_gun_angle.q[1],
          q_gun_angle.q[2],
          q_gun_angle.q[3],
          q_gun_angle.q[0]
        )
      );
    } else {
      this.setGun();
    }
  }
}

export { AirTransmitter };
