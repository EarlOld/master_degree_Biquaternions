import { DualQuaternion } from "./DualQuaternion";
import * as THREE from "../../three.js/build/three.js";
import { TextGeometry } from "../../three.js/examples/jsm/geometries/TextGeometry.js";
import { FontLoader } from "../../three.js/examples/jsm/loaders/FontLoader";

const loader = new FontLoader();

import { AirCamera } from "./AirCamera";
import { AIR_PLANE_STATUSES } from "../services";
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
  constructor({
    position,
    targetPosition,
    targetIndex,
    len,
    radius,
    id,
    status = AIR_PLANE_STATUSES.SEARCH,
  }) {
    this.moveTime = 50;
    this.status = status;
    this.id = id;
    this.len = len;
    this.radius = radius;
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
    this.dq_dx_up = new DualQuaternion.fromEulerVector(0, 0, 0, [0, 10, 0]);
    this.dq_dx_down = new DualQuaternion.fromEulerVector(0, 0, 0, [0, -10, 0]);
    this.mesh = new THREE.Object3D();
    if (this.status !== AIR_PLANE_STATUSES.INITIAL) {
      this.gun = new AirCamera(
        this.dq_pos,
        this.status !== AIR_PLANE_STATUSES.INITIAL,
        this.len
      );
    }
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

    // Text

    // loader.load("Roboto_Bold.json", function (font) {
    //   const geometry = new TextGeometry(this.id, {
    //     font: font,
    //     size: 80,
    //     height: 5,
    //     curveSegments: 12,
    //     bevelEnabled: true,
    //     bevelThickness: 10,
    //     bevelSize: 8,
    //     bevelOffset: 0,
    //     bevelSegments: 5,
    //   });
    //   var matTextPlane = new THREE.MeshBasicMaterial({
    //     color: Colors.red,
    //   });
    //   var textPlane = new THREE.Mesh(geometry, matTextPlane);
    //   textPlane.position.set(100, 100, 100);
    //   this.mesh.add(textPlane);
    // });

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

    const geometry = new THREE.SphereGeometry(this.radius, 32, 16);
    const material = new THREE.MeshBasicMaterial({
      color: 0xffff00,
      wireframe: true,
      opacity: 0.5,
    });
    const sphere = new THREE.Mesh(geometry, material);
    this.findSphere = sphere;
    this.mesh.add(this.findSphere);

    this.mesh.position.fromArray(this.dq_pos.getVector());

    // circle move variables

    this.angle = (0.5 * Math.PI) / 180;
    this.currentAngle = 0;
  }

  setTargetPosition(targetPosition) {
    this.targetPosition = targetPosition;
  }

  setTarget(element) {
    if (element) {
      this.targetIndex = element.id;
      this.targetPosition = element.dq_pos;
      this.status = AIR_PLANE_STATUSES.WATCH;

      this.moveToParentWithMaxDistance([this.len, 0, 0]);
    } else {
      this.targetIndex = undefined;
      this.targetPosition = undefined;
      this.status = AIR_PLANE_STATUSES.SEARCH;
    }
  }

  search() {
    if (window.airplanes) {
      if (this.targetPosition && this.status === AIR_PLANE_STATUSES.WATCH) {
        const a = new THREE.Vector3(...this.dq_pos.getVector());
        const b = new THREE.Vector3(...this.targetPosition.getVector());

        if (Math.abs(a.distanceTo(b)) > this.len) {
          this.setTarget(null);
        }
      } else {
        for (const key in window.airplanes) {
          if (Object.hasOwnProperty.call(window.airplanes, key)) {
            const element = window.airplanes[key];
            if (element.id !== this.id && element.targetIndex !== this.id) {
              const a = new THREE.Vector3(...this.dq_pos.getVector());
              const b = new THREE.Vector3(...element.dq_pos.getVector());

              if (Math.abs(a.distanceTo(b)) <= this.radius * 2) {
                this.setTarget(element);
              }
            }
          }
        }
      }
    }
  }

  moveToParentWithMaxDistance(vector) {
    const x = vector[0] / this.moveTime;
    const y = vector[2] / this.moveTime;
    const z = vector[2] / this.moveTime;
    const pathForMove = [];
    this.pathForMove = [];
    for (let index = 0; index < this.moveTime; index++) {
      pathForMove.unshift(
        new DualQuaternion.fromEulerVector(0, 0, 0, [x, y, z])
      );
    }

    if (!this.toParentInterval) {
      this.toParentInterval = setInterval(() => {
        const nextPos = pathForMove.pop();
        if (nextPos) {
          const dq_pos = this.dq_pos.mul(nextPos);

          const a = new THREE.Vector3(...dq_pos.getVector());
          const b = new THREE.Vector3(...this.targetPosition.getVector());

          if (Math.abs(a.distanceTo(b)) <= this.len) {
            this.dq_pos = dq_pos;
          } else {
            clearInterval(this.toParentInterval);
            this.toParentInterval = undefined;
          }
        } else {
          clearInterval(this.toParentInterval);
          this.toParentInterval = undefined;
        }
      }, 10);
    }
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

  moveUp = () => {
    this.dq_pos = this.dq_pos.mul(this.dq_dx_up);
  };

  moveDown = () => {
    this.dq_pos = this.dq_pos.mul(this.dq_dx_down);
  };

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

    if (this.status === AIR_PLANE_STATUSES.SEARCH) {
      this.gun.mesh.rotation.y += 0.04;
      this.findSphere.visible = true;
    } else if (this.status === AIR_PLANE_STATUSES.WATCH) {
      this.findSphere.visible = false;
    } else if (this.status === AIR_PLANE_STATUSES.INITIAL) {
      this.findSphere.visible = false;
    }

    if (this.status !== AIR_PLANE_STATUSES.INITIAL) {
      this.search();
    }

    if (this.pathForMove?.length) {
      const nextPos = this.pathForMove.pop();
      this.dq_pos = this.dq_pos.mul(nextPos);
    }

    if (targetPosition && this.targetPosition) {
      if (this.targetPosition) {
        const nextPos = this.targetPosition.inverse().mul(targetPosition);
        this.dq_pos = this.dq_pos.mul(nextPos);
      }

      this.targetPosition = targetPosition;
    }
    // if (this.targetIndex && this.status === AIR_PLANE_STATUSES.WATCH) {
    //   this.currentAngle += this.angle;
    //   const x = this.radius * Math.sin(this.currentAngle);
    //   const y = this.radius * Math.cos(this.currentAngle);
    //   const angleDualQuaternion = new DualQuaternion.fromEulerVector(0, 0, 0, [
    //     x,
    //     0,
    //     y,
    //   ]);
    //   this.dq_pos = this.dq_pos.mul(angleDualQuaternion);
    // }

    if (this.status !== AIR_PLANE_STATUSES.INITIAL) {
      this.gun.move(this.dq_pos, this.targetPosition);
    }
    const vector = this.dq_pos.getVector();
    this.mesh.position.fromArray(vector);
  }
}

export { AirPlane };
