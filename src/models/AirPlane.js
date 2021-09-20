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
class AirPlane {
  constructor(position) {

    this.dq_pos = new DualQuaternion.fromEulerVector(0, 0, 0, position);
    this.dq_dx_left = new DualQuaternion.fromEulerVector(0, 0, 0, [0, 0, -1]);
    this.dq_dx_right = new DualQuaternion.fromEulerVector(0, 0, 0, [0, 0, 1]);
    this.dq_dx_forward = new DualQuaternion.fromEulerVector(0, 0, 0, [1, 0, 0]);
    this.dq_dx_backward = new DualQuaternion.fromEulerVector(0, 0, 0, [-1, 0, 0]);
    this.mesh = new THREE.Object3D();
    this.mesh.name = "airPlane";

    // Create the cabin
    var geomCockpit = new THREE.BoxGeometry(60, 50, 50, 1, 1, 1);
    var matCockpit = new THREE.MeshPhongMaterial({ color: Colors.red, shading: THREE.FlatShading });
    var cockpit = new THREE.Mesh(geomCockpit, matCockpit);
    cockpit.castShadow = true;
    cockpit.receiveShadow = true;
    this.mesh.add(cockpit);

    // Create Engine
    var geomEngine = new THREE.BoxGeometry(20, 50, 50, 1, 1, 1);
    var matEngine = new THREE.MeshPhongMaterial({ color: Colors.white, shading: THREE.FlatShading });
    var engine = new THREE.Mesh(geomEngine, matEngine);
    engine.position.x = 40;
    engine.castShadow = true;
    engine.receiveShadow = true;
    this.mesh.add(engine);

    // Create Tailplane

    var geomTailPlane = new THREE.BoxGeometry(15, 20, 5, 1, 1, 1);
    var matTailPlane = new THREE.MeshPhongMaterial({ color: Colors.red, shading: THREE.FlatShading });
    var tailPlane = new THREE.Mesh(geomTailPlane, matTailPlane);
    tailPlane.position.set(-35, 25, 0);
    tailPlane.castShadow = true;
    tailPlane.receiveShadow = true;
    this.mesh.add(tailPlane);

    // Create Wing

    var geomSideWing = new THREE.BoxGeometry(40, 8, 150, 1, 1, 1);
    var matSideWing = new THREE.MeshPhongMaterial({ color: Colors.red, shading: THREE.FlatShading });
    var sideWing = new THREE.Mesh(geomSideWing, matSideWing);
    sideWing.position.set(0, 0, 0);
    sideWing.castShadow = true;
    sideWing.receiveShadow = true;
    this.mesh.add(sideWing);

    // Propeller

    var geomPropeller = new THREE.BoxGeometry(20, 10, 10, 1, 1, 1);
    var matPropeller = new THREE.MeshPhongMaterial({ color: Colors.brown, shading: THREE.FlatShading });
    this.propeller = new THREE.Mesh(geomPropeller, matPropeller);
    this.propeller.castShadow = true;
    this.propeller.receiveShadow = true;

    // Blades

    var geomBlade = new THREE.BoxGeometry(1, 100, 20, 1, 1, 1);
    var matBlade = new THREE.MeshPhongMaterial({ color: Colors.brownDark, shading: THREE.FlatShading });

    var blade = new THREE.Mesh(geomBlade, matBlade);
    blade.position.set(8, 0, 0);
    blade.castShadow = true;
    blade.receiveShadow = true;
    this.propeller.add(blade);
    this.propeller.position.set(50, 0, 0);
    this.mesh.add(this.propeller);

    this.mesh.position.fromArray(this.dq_pos.getVector());
  }

  move() {
    const vector = this.dq_pos.getVector();
    const real = this.dq_pos.getReal().getEuler();
    debugger
    this.mesh.position.fromArray(vector);
    this.mesh.rotation.set(real[0], real[1], real[2]);
    // camera.position.set(vector[0], vector[1] - 100, vector[2] - 100);
  }
};

export { AirPlane };