import { DualQuaternion } from "./DualQuaternion";
import * as THREE from "../../three.js/build/three.js";
import { AirCamera } from "./AirCamera";
//COLORS
var Colors = {
  red: 0xf25346,
  white: 0xd8d0d1,
  brown: 0x59332e,
  pink: 0xf5986e,
  brownDark: 0x23190f,
  blue: 0x68c3c0,
};
class AirPlane {
  constructor({ position, targetPosition, targetIndex }) {
    this.moveTime = 500;

    this.targetPosition = targetPosition;
    this.targetIndex = targetIndex;
    this.pathForMove = [];
    this.dq_pos = new DualQuaternion.fromEulerVector(0, 0, 0, position);
    this.dq_dx_left = new DualQuaternion.fromEulerVector(0, 0, 0, [0, 0, -3]);
    this.dq_dx_right = new DualQuaternion.fromEulerVector(0, 0, 0, [0, 0, 3]);
    this.dq_dx_forward = new DualQuaternion.fromEulerVector(0, 0, 0, [1, 0, 0]);
    this.dq_dx_backward = new DualQuaternion.fromEulerVector(
      0,
      0,
      0,
      [-1, 0, 0]
    );
    this.dq_dx_up = new DualQuaternion.fromEulerVector(0, 0, 0, [0, 1, 0]);
    this.dq_dx_down = new DualQuaternion.fromEulerVector(0, 0, 0, [0, -1, 0]);
    this.mesh = new THREE.Object3D();
    this.gun = new AirCamera(this.dq_pos);
    this.mesh.name = "airPlane";

    // Create the cabin
    var geomCockpit = new THREE.BoxGeometry(15, 12, 12, 1, 1, 1);
    var matCockpit = new THREE.MeshPhongMaterial({
      color: Colors.red,
      shading: THREE.FlatShading,
    });
    var cockpit = new THREE.Mesh(geomCockpit, matCockpit);
    cockpit.castShadow = true;
    cockpit.receiveShadow = true;
    this.mesh.add(cockpit);

    // Create Engine
    var geomEngine = new THREE.BoxGeometry(5, 12, 12, 1, 1, 1);
    var matEngine = new THREE.MeshPhongMaterial({
      color: Colors.white,
      shading: THREE.FlatShading,
    });
    var engine = new THREE.Mesh(geomEngine, matEngine);
    engine.position.x = 10;
    engine.castShadow = true;
    engine.receiveShadow = true;
    this.mesh.add(engine);

    // Create Tailplane

    var geomTailPlane = new THREE.BoxGeometry(4, 5, 1, 1, 1, 1);
    var matTailPlane = new THREE.MeshPhongMaterial({
      color: Colors.red,
      shading: THREE.FlatShading,
    });
    var tailPlane = new THREE.Mesh(geomTailPlane, matTailPlane);
    tailPlane.position.set(-9, 6, 0);
    tailPlane.castShadow = true;
    tailPlane.receiveShadow = true;
    this.mesh.add(tailPlane);

    // Create Wing

    var geomSideWing = new THREE.BoxGeometry(10, 2, 37, 1, 1, 1);
    var matSideWing = new THREE.MeshPhongMaterial({
      color: Colors.red,
      shading: THREE.FlatShading,
    });
    var sideWing = new THREE.Mesh(geomSideWing, matSideWing);
    sideWing.position.set(0, 0, 0);
    sideWing.castShadow = true;
    sideWing.receiveShadow = true;
    this.mesh.add(sideWing);

    // Propeller

    var geomPropeller = new THREE.BoxGeometry(5, 2, 2, 1, 1, 1);
    var matPropeller = new THREE.MeshPhongMaterial({
      color: Colors.brown,
      shading: THREE.FlatShading,
    });
    this.propeller = new THREE.Mesh(geomPropeller, matPropeller);
    this.propeller.castShadow = true;
    this.propeller.receiveShadow = true;

    // Blades

    var geomBlade = new THREE.BoxGeometry(1, 25, 5, 1, 1, 1);
    var matBlade = new THREE.MeshPhongMaterial({
      color: Colors.brownDark,
      shading: THREE.FlatShading,
    });

    var blade = new THREE.Mesh(geomBlade, matBlade);
    blade.position.set(2, 0, 0);
    blade.castShadow = true;
    blade.receiveShadow = true;
    this.propeller.add(blade);
    this.propeller.position.set(12, 0, 0);
    this.mesh.add(this.propeller);

    this.mesh.position.fromArray(this.dq_pos.getVector());

    // circle move variables

    this.angle = (0.5 * Math.PI) / 180;
    this.currentAngle = 0;
    this.radius = 2;
  }

  setTargetPosition(targetPosition) {
    this.targetPosition = targetPosition;
  }

  setTargetIndex(targetIndex) {
    this.targetIndex = targetIndex;
  }

  moveFromMiniMap({ onPointEqual = 50, i = 0, j = 0 }) {
    if (j && i) {
      const endXPoint = i * onPointEqual;
      const endYPoint = j * onPointEqual;
      const x = endXPoint / this.moveTime;
      const y = endYPoint / this.moveTime;
      const z = 500 / this.moveTime;
      for (let index = 0; index < this.moveTime; index++) {
        if (this.moveTime / 2 >= index) {
          this.pathForMove.unshift(
            new DualQuaternion.fromEulerVector(0, 0, 0, [x, 0, y])
          );
        } else if (this.moveTime / 2 < index) {
          this.pathForMove.unshift(
            new DualQuaternion.fromEulerVector(0, 0, 0, [x, 0, y])
          );
        }
      }
    }
  }

  move(targetPosition) {
    this.propeller.rotation.x += 0.3;

    // if (move) {
    //   this.dq_pos = this.dq_pos.mul(this.dq_dx_forward);
    //   if (leftPressed) {
    //     this.dq_pos = this.dq_pos.mul(this.dq_dx_left);
    //   }
    //   if (rightPressed) {
    //     this.dq_pos = this.dq_pos.mul(this.dq_dx_right);
    //   }
    //   if (upPressed) {
    //     this.dq_pos = this.dq_pos.mul(this.dq_dx_up);
    //   }
    //   if (downPressed) {
    //     this.dq_pos = this.dq_pos.mul(this.dq_dx_down);
    //   }
    // }

    if (this.pathForMove?.length) {
      const nextPos = this.pathForMove.pop();
      this.dq_pos = this.dq_pos.mul(nextPos);
    }
    if (this.targetIndex) {
      this.currentAngle += this.angle;
      const x = this.radius * Math.sin(this.currentAngle);
      const y = this.radius * Math.cos(this.currentAngle);
      const angleDualQuaternion = new DualQuaternion.fromEulerVector(0, 0, 0, [
        x,
        0,
        y,
      ]);
      this.dq_pos = this.dq_pos.mul(angleDualQuaternion);
    }

    this.gun.move(this.dq_pos, targetPosition);
    const vector = this.dq_pos.getVector();
    // const real = this.dq_pos.getReal().getEuler();
    this.mesh.position.fromArray(vector);
    // this.mesh.rotation.set(real[0], real[1], real[2]);
    // camera.position.set(vector[0], vector[1] - 100, vector[2] - 100);
  }
}

export { AirPlane };
