import * as THREE from '../three.js/build/three.js';
import grassTexture from '../textures/terrain/grasslight-big.jpg';
// import { DualQuaternion } from './models/DualQuaternion';
import { ThirdPersonCamera } from './models/ThirdPersonCamera';
import { AirPlane } from './models/AirPlane';
let camera, controls, scene, renderer, centralObject, airplane, thirdPersonCamera;
let leftPressed = false;
let rightPressed = false;
let upPressed = false;
let downPressed = false;

//COLORS
var Colors = {
  red: 0xf25346,
  white: 0xd8d0d1,
  brown: 0x59332e,
  pink: 0xF5986E,
  brownDark: 0x23190f,
  blue: 0x68c3c0,
};

function randomIntFromInterval(min, max) { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min)
}

function createPlane() {
  airplane = new AirPlane([0, 100, 0]);
  airplane.mesh.scale.set(.25, .25, .25);

  scene.add(airplane.mesh);
}

const init = () => {

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

// Обраотка нажатия клавиш управления

const mauseMoveHandler = (e) => {
  const innerWidth = window.innerHeight;
  const innerHeight = window.innerHeight;

  const mediumHeightLine = innerHeight / 2;
  const mediumWidthLine = innerWidth / 2;

  debugger
}
const keyDownHandler = (e) => {
  if (e.keyCode == 37 || e.keyCode == 65 || e.keyCode == 97) { leftPressed = true; } // влево  A
  else if (e.keyCode == 38 || e.keyCode == 87 || e.keyCode == 119) { upPressed = true; } // вверх  W
  else if (e.keyCode == 39 || e.keyCode == 68 || e.keyCode == 100) { rightPressed = true; } // вправо D
  else if (e.keyCode == 40 || e.keyCode == 83 || e.keyCode == 115) { downPressed = true; } // вниз   S
}

// Обработка отжатия клавиш управления
const keyUpHandler = (e) => {
  if (e.keyCode == 37 || e.keyCode == 65 || e.keyCode == 97) { leftPressed = false; } // влево  A
  else if (e.keyCode == 38 || e.keyCode == 87 || e.keyCode == 119) { upPressed = false; } // вверх  W
  else if (e.keyCode == 39 || e.keyCode == 68 || e.keyCode == 100) { rightPressed = false; } // вправо D
  else if (e.keyCode == 40 || e.keyCode == 83 || e.keyCode == 115) { downPressed = false; } // вниз   S
}


const animate = () => {

  requestAnimationFrame(animate);

  airplane.propeller.rotation.x += 0.3;

  render();

}

const render = () => {
  if (leftPressed) { airplane.dq_pos = airplane.dq_pos.mul(airplane.dq_dx_left); }
  if (rightPressed) { airplane.dq_pos = airplane.dq_pos.mul(airplane.dq_dx_right); }
  if (upPressed) { airplane.dq_pos = airplane.dq_pos.mul(airplane.dq_dx_forward); }
  if (downPressed) { airplane.dq_pos = airplane.dq_pos.mul(airplane.dq_dx_backward); }

  airplane.move();
  thirdPersonCamera.Update();

  renderer.render(scene, camera);
}

init();
animate();

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
document.addEventListener("mousemove", keyUpHandler, false);