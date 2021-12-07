import { DualQuaternion } from "./DualQuaternion";
import * as THREE from "../../three.js/build/three.js";
import { AirTransmitter } from "./AirTransmitter";
import { AIR_PLANE_STATUSES, COLORS } from "../services";
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
      this.gun = new AirTransmitter(
        this.dq_pos,
        this.status !== AIR_PLANE_STATUSES.INITIAL,
        this.len
      );
    }
    this.mesh.name = "airPlane";

    // Create the cabin
    const geomCockpit = new THREE.BoxGeometry(15, 12, 12, 1, 1, 1);
    const matCockpit = new THREE.MeshPhongMaterial({
      color: COLORS.red,
      shading: THREE.FlatShading,
    });
    const cockpit = new THREE.Mesh(geomCockpit, matCockpit);
    cockpit.castShadow = true;
    cockpit.receiveShadow = true;
    this.mesh.add(cockpit);

    // Create Engine
    const geomEngine = new THREE.BoxGeometry(5, 12, 12, 1, 1, 1);
    const matEngine = new THREE.MeshPhongMaterial({
      color: COLORS.white,
      shading: THREE.FlatShading,
    });
    const engine = new THREE.Mesh(geomEngine, matEngine);
    engine.position.x = 10;
    engine.castShadow = true;
    engine.receiveShadow = true;
    this.mesh.add(engine);

    // Create Tailplane

    const geomTailPlane = new THREE.BoxGeometry(4, 5, 1, 1, 1, 1);
    const matTailPlane = new THREE.MeshPhongMaterial({
      color: COLORS.red,
      shading: THREE.FlatShading,
    });
    const tailPlane = new THREE.Mesh(geomTailPlane, matTailPlane);
    tailPlane.position.set(-9, 6, 0);
    tailPlane.castShadow = true;
    tailPlane.receiveShadow = true;
    this.mesh.add(tailPlane);

    const geomSideWing = new THREE.BoxGeometry(10, 2, 37, 1, 1, 1);
    const matSideWing = new THREE.MeshPhongMaterial({
      color: COLORS.red,
      shading: THREE.FlatShading,
    });
    const sideWing = new THREE.Mesh(geomSideWing, matSideWing);
    sideWing.position.set(0, 0, 0);
    sideWing.castShadow = true;
    sideWing.receiveShadow = true;
    this.mesh.add(sideWing);

    // Propeller

    const geomPropeller = new THREE.BoxGeometry(5, 2, 2, 1, 1, 1);
    const matPropeller = new THREE.MeshPhongMaterial({
      color: COLORS.brown,
      shading: THREE.FlatShading,
    });
    this.propeller = new THREE.Mesh(geomPropeller, matPropeller);
    this.propeller.castShadow = true;
    this.propeller.receiveShadow = true;

    // Blades

    const geomBlade = new THREE.BoxGeometry(1, 25, 5, 1, 1, 1);
    const matBlade = new THREE.MeshPhongMaterial({
      color: COLORS.brownDark,
      shading: THREE.FlatShading,
    });

    const blade = new THREE.Mesh(geomBlade, matBlade);
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

    // circle move constiables

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
