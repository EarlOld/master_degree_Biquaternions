import React, { useEffect, useState, useCallback } from "react";
import PropTypes from "prop-types";
import { Drawer, Button, Radio, Space } from "antd";
import * as THREE from "../../three.js/build/three.js";
import grassTexture from "../../textures/terrain/grasslight-big.jpg";
// import { DualQuaternion } from './models/DualQuaternion';
import { ThirdPersonCamera } from "../models/ThirdPersonCamera";
import { AirPlane } from "../models/AirPlane";
import { MiniMap } from "../models/MiniMap";
const OrbitControls = require("three-orbit-controls")(THREE);
import "antd/dist/antd.css";
import "./styles.less";

let camera,
  scene,
  renderer,
  airplanes = {},
  thirdPersonCamera,
  miniMap,
  airCamera,
  controls;

var activeAirPlane;

let leftPressed = false;
let rightPressed = false;
let upPressed = false;
let downPressed = false;
let move = false;

//COLORS
const Colors = {
  red: 0xf25346,
  white: 0xd8d0d1,
  brown: 0x59332e,
  pink: 0xf5986e,
  brownDark: 0x23190f,
  blue: 0x68c3c0,
};

const App = () => {
  const [visible, setVisible] = useState(false);
  const [activeAirIndex, setActiveAirIndex] = useState(-1);
  activeAirPlane = airplanes[activeAirIndex];
  const showDrawer = () => {
    setVisible(true);
  };

  const onClose = () => {
    setVisible(false);
  };

  const randomIntFromInterval = (min, max) => {
    // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min);
  };

  const hanleMiniMapClick = useCallback(
    (e) => {
      console.log("hanleMiniMapClick", e);
      activeAirPlane?.moveFromMiniMap({
        ...e.target.dataset,
      });
    },
    [activeAirPlane]
  );

  const createPlane = () => {
    const newIndex = activeAirIndex + 1;
    airplanes[newIndex] = new AirPlane([0, 20, newIndex * 100]);
    setActiveAirIndex(newIndex);
    scene.add(airplanes[newIndex].mesh);
  };

  const onWindowResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
  };

  // Обраотка нажатия клавиш управления

  const mauseMoveHandler = (e) => {
    const innerWidth = window.innerHeight;
    const innerHeight = window.innerHeight;

    const mediumHeightLine = innerHeight / 2;
    const mediumWidthLine = innerWidth / 2;
    const diffOnBaseVertical = Math.abs(mediumHeightLine - e.offsetY) > 50;
    const diffOnBaseHorzontal = Math.abs(mediumWidthLine - e.offsetX) > 50;

    rightPressed = false;
    downPressed = false;
    leftPressed = false;
    upPressed = false;

    if (diffOnBaseVertical && diffOnBaseHorzontal) {
      if (e.offsetX < mediumHeightLine && e.offsetY < mediumWidthLine) {
        leftPressed = true;
        upPressed = true;
      } else if (e.offsetX > mediumHeightLine && e.offsetY < mediumWidthLine) {
        rightPressed = true;
        upPressed = true;
      } else if (e.offsetX > mediumHeightLine && e.offsetY > mediumWidthLine) {
        rightPressed = true;
        downPressed = true;
      } else if (e.offsetX < mediumHeightLine && e.offsetY > mediumWidthLine) {
        leftPressed = true;
        downPressed = true;
      }
    } else if (diffOnBaseVertical) {
      if (e.offsetY < mediumWidthLine) {
        upPressed = true;
      } else if (e.offsetY > mediumWidthLine) {
        downPressed = true;
      }
    } else if (diffOnBaseHorzontal) {
      if (e.offsetX < mediumHeightLine) {
        leftPressed = true;
      } else if (e.offsetX > mediumHeightLine) {
        rightPressed = true;
      }
    }
  };
  const keyDownHandler = (e) => {
    // if (e.keyCode == 37 || e.keyCode == 65 || e.keyCode == 97) { leftPressed = true; } // влево  A
    // if (e.keyCode == 38 || e.keyCode == 87 || e.keyCode == 119) { move = true; } // вверх  W
    // else if (e.keyCode == 39 || e.keyCode == 68 || e.keyCode == 100) { rightPressed = true; } // вправо D
    // else if (e.keyCode == 40 || e.keyCode == 83 || e.keyCode == 115) { downPressed = true; } // вниз   S
  };

  // Обработка отжатия клавиш управления
  const keyUpHandler = (e) => {
    // if (e.keyCode == 37 || e.keyCode == 65 || e.keyCode == 97) { leftPressed = false; } // влево  A
    // if (e.keyCode == 38 || e.keyCode == 87 || e.keyCode == 119) { move = false; } // вверх  W
    // else if (e.keyCode == 39 || e.keyCode == 68 || e.keyCode == 100) { rightPressed = false; } // вправо D
    // else if (e.keyCode == 40 || e.keyCode == 83 || e.keyCode == 115) { downPressed = false; } // вниз   S
  };

  const animate = useCallback(() => {
    requestAnimationFrame(animate);
    controls.update();
    render();
  }, [activeAirPlane]);

  const render = useCallback(() => {
    for (const key in airplanes) {
      if (Object.hasOwnProperty.call(airplanes, key)) {
        const element = airplanes[key];
        element.propeller.rotation.x += 0.3;
        element?.move({
          move,
          leftPressed,
          rightPressed,
          upPressed,
          downPressed,
        });
      }
    }
   
    // thirdPersonCamera.Update();

    renderer.render(scene, camera);
  }, [activeAirPlane]);

  useEffect(() => {
    miniMap = new MiniMap({
      width: 20,
      height: 20,
      onMapClick: hanleMiniMapClick,
    });

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x68c3c0);
    // scene.fog = new THREE.FogExp2(0xcccccc, 0.002);
    createPlane();

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      1,
      10000
    );
    camera.position.set(10, 100, 35);
    controls = new OrbitControls(camera, renderer.domElement);
    controls.update();
    const geometry = new THREE.CylinderGeometry(0, 10, 30, 4, 1);

    for (let i = 0; i < 500; i++) {
      const rndInt = randomIntFromInterval(1, 6);
      const material = new THREE.MeshPhongMaterial({
        color: Object.values(Colors)[rndInt],
        flatShading: true,
      });
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

    const groundMaterial = new THREE.MeshLambertMaterial({
      map: groundTexture,
    });

    let groundMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(20000, 20000),
      groundMaterial
    );
    groundMesh.position.y = -20;
    groundMesh.rotation.x = -Math.PI / 2;
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

    light.shadow.camera.left = -d;
    light.shadow.camera.right = d;
    light.shadow.camera.top = d;
    light.shadow.camera.bottom = -d;

    light.shadow.camera.far = 1000;

    // thirdPersonCamera = new ThirdPersonCamera({
    //   camera: camera,
    //   target: airplane.mesh
    // });

    scene.add(light);

    window.addEventListener("resize", onWindowResize);
    animate();
  }, []);

  return (
    <>
      <Button className="drawer-trigger" type="primary" onClick={showDrawer}>
        Open Settings
      </Button>
      <Drawer
        title="Settings"
        placement="right"
        onClose={onClose}
        visible={visible}
      >
        <div>
          <Button type="primary" onClick={() => createPlane([0, 60, 0])}>
            Create Plane
          </Button>
        </div>
        <div>Choose Airplane</div>
        <Radio.Group
          onChange={(e) => setActiveAirIndex(e.target.value)}
          value={activeAirIndex}
        >
          <Space direction="vertical">
            {Array(Object.values(airplanes).length)
              .fill(1)
              .map((item, index) => (
                <Radio value={index}>Airplane {index + 1}</Radio>
              ))}
          </Space>
        </Radio.Group>
      </Drawer>
    </>
  );
};

App.propTypes = {};

export default App;
