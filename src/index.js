import * as THREE from '../three.js/build/three.js';
// import { OrbitControls } from '../three.js/examples/jsm/controls/OrbitControls.js';
import grassTexture from '../textures/terrain/grasslight-big.jpg';
import { DualQuaternion } from './dual_quaternion';
let camera, controls, scene, renderer, centralObject, airplane, thirdPersonCamera;
let leftPressed = false;
let rightPressed = false;
let upPressed = false;
let downPressed = false;

function randomIntFromInterval(min, max) { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min)
}

//COLORS
var Colors = {
  red: 0xf25346,
  white: 0xd8d0d1,
  brown: 0x59332e,
  pink: 0xF5986E,
  brownDark: 0x23190f,
  blue: 0x68c3c0,
};

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

class AirPlane {
  constructor(position) {

    this.dq_pos = new DualQuaternion.fromEulerVector(0, 0,  0, position);
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

function createPlane() {
  airplane = new AirPlane([0, 100, 0]);
  airplane.mesh.scale.set(.25, .25, .25);

  scene.add(airplane.mesh);
}

init();
//render(); // remove when using next line for animation loop (requestAnimationFrame)
animate();

function init() {

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x68c3c0);
  scene.fog = new THREE.FogExp2(0xcccccc, 0.002);
  createPlane();

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  camera = new THREE.PerspectiveCamera(120, window.innerWidth / window.innerHeight, 1, 1000);
  camera.position.set(10, 100, 35);

  // controls

  // controls = new OrbitControls(camera, renderer.domElement);
  // controls.listenToKeyEvents(window); // optional

  //controls.addEventListener( 'change', render ); // call this only in static scenes (i.e., if there is no animation loop)

  // controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
  // controls.dampingFactor = 0.05;

  // controls.screenSpacePanning = false;

  // controls.minDistance = 100;
  // controls.maxDistance = 500;

  // controls.maxPolarAngle = Math.PI / 2;

  // world

  const geometry = new THREE.CylinderGeometry(0, 10, 30, 4, 1);

  for (let i = 0; i < 500; i++) {
    const rndInt = randomIntFromInterval(1, 6);
    const material = new THREE.MeshPhongMaterial({ color: Object.values(Colors)[rndInt], flatShading: true });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.x = Math.random() * 1600 - 800;
    mesh.position.y = 0;
    mesh.position.z = Math.random() * 1600 - 800;
    mesh.updateMatrix();
    mesh.matrixAutoUpdate = false;
    scene.add(mesh);
  }
  const loader = new THREE.TextureLoader();
  const groundTexture = loader.load(grassTexture);
  groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
  groundTexture.repeat.set(25, 25);
  groundTexture.anisotropy = 16;
  groundTexture.encoding = THREE.sRGBEncoding;

  const groundMaterial = new THREE.MeshLambertMaterial({ map: groundTexture });

  let groundMesh = new THREE.Mesh(new THREE.PlaneGeometry(20000, 20000), groundMaterial);
  groundMesh.position.y = -20;
  groundMesh.rotation.x = - Math.PI / 2;
  groundMesh.receiveShadow = true;
  scene.add(groundMesh);

  // lights

  scene.add(new THREE.AmbientLight(0x666666));

  const light = new THREE.DirectionalLight(0xdfebff, 1);
  light.position.set(50, 200, 100);
  light.position.multiplyScalar(1.3);

  light.castShadow = true;

  light.shadow.mapSize.width = 1024;
  light.shadow.mapSize.height = 1024;

  const d = 300;

  light.shadow.camera.left = - d;
  light.shadow.camera.right = d;
  light.shadow.camera.top = d;
  light.shadow.camera.bottom = - d;

  light.shadow.camera.far = 1000;

  thirdPersonCamera = new ThirdPersonCamera({
    camera: camera,
    target: airplane.mesh
  });

  scene.add(light);

  //

  window.addEventListener('resize', onWindowResize);

}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

}

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

// Обраотка нажатия клавиш управления
function keyDownHandler(e) {
  if (e.keyCode == 37 || e.keyCode == 65 || e.keyCode == 97) { leftPressed = true; } // влево  A
  else if (e.keyCode == 38 || e.keyCode == 87 || e.keyCode == 119) { upPressed = true; } // вверх  W
  else if (e.keyCode == 39 || e.keyCode == 68 || e.keyCode == 100) { rightPressed = true; } // вправо D
  else if (e.keyCode == 40 || e.keyCode == 83 || e.keyCode == 115) { downPressed = true; } // вниз   S
}

// Обработка отжатия клавиш управления
function keyUpHandler(e) {
  if (e.keyCode == 37 || e.keyCode == 65 || e.keyCode == 97) { leftPressed = false; } // влево  A
  else if (e.keyCode == 38 || e.keyCode == 87 || e.keyCode == 119) { upPressed = false; } // вверх  W
  else if (e.keyCode == 39 || e.keyCode == 68 || e.keyCode == 100) { rightPressed = false; } // вправо D
  else if (e.keyCode == 40 || e.keyCode == 83 || e.keyCode == 115) { downPressed = false; } // вниз   S
}


function animate() {

  requestAnimationFrame(animate);

  airplane.propeller.rotation.x += 0.3;

  // controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true
  render();

}

function render() {
  if (leftPressed) { airplane.dq_pos = airplane.dq_pos.mul(airplane.dq_dx_left); }
  if (rightPressed) { airplane.dq_pos = airplane.dq_pos.mul(airplane.dq_dx_right); }
  if (upPressed) { airplane.dq_pos = airplane.dq_pos.mul(airplane.dq_dx_forward); }
  if (downPressed) { airplane.dq_pos = airplane.dq_pos.mul(airplane.dq_dx_backward); }

  airplane.move();
  thirdPersonCamera.Update();

  renderer.render(scene, camera);

}