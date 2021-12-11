import React, { useEffect, useState, useCallback } from "react";
import { Button, Radio, Space, Drawer, Table } from "antd";
import * as THREE from "../../three.js/build/three.js";
import grassTexture from "../../textures/terrain/grasslight-big.jpg";
import DownSquareOutlined from "@ant-design/icons/DownSquareOutlined";
import UpSquareOutlined from "@ant-design/icons/UpSquareOutlined";
import MenuUnfoldOutlined from "@ant-design/icons/MenuUnfoldOutlined";
import MenuFoldOutlined from "@ant-design/icons/MenuFoldOutlined";
import { AirPlane } from "../models/AirPlane";
import { MiniMap } from "../models/MiniMap";
const OrbitControls = require("three-orbit-controls")(THREE);
import CreateAirModal from "./CreateAirModal/index.jsx";
import { AIR_PLANE_STATUSES, COLORS } from "../services/index.js";
import "./styles.less";

var camera,
  scene,
  renderer,
  miniMap,
  controls;

window.airplanes = {};

const { airplanes } = window;

var activeAirPlane, activeCamera, activeIndex;

const App = () => {
  const [activeAirIndex, setActiveAirIndex] = useState(-1);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  activeAirPlane = airplanes[activeAirIndex];

  const randomIntFromInterval = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
  };

  const hanleMiniMapClick = useCallback(
    (e) => {
      activeAirPlane?.moveFromMiniMap({
        ...e.target.dataset,
      });
    },
    [activeAirPlane]
  );

  const createPlane = (values) => {
    const newIndex = Object.values(airplanes).length;

    airplanes[newIndex] = new AirPlane({
      position: [0, 30, newIndex * 200],
      ...values,
      id: newIndex,
    });

    setActiveAirIndex(newIndex);
    scene.add(airplanes[newIndex].mesh);
    if (airplanes[newIndex].gun) {
      scene.add(airplanes[newIndex].gun.mesh);
    }
  };

  const onWindowResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
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
        element?.move(airplanes[element.targetIndex]?.dq_pos);
      }
    }

    if (activeCamera?.Update && !activeIndex) activeCamera?.Update();
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

    activeCamera = camera;
    controls.update();
    const geometry = new THREE.CylinderGeometry(0, 10, 30, 4, 1);

    for (let i = 0; i < 500; i++) {
      const rndInt = randomIntFromInterval(1, 6);
      const material = new THREE.MeshPhongMaterial({
        color: Object.values(COLORS)[rndInt],
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
    scene.add(light);
    createPlane({
      // angle: 30,
      len: 300,
      radius: 60,
      status: AIR_PLANE_STATUSES.INITIAL,
    });

    window.addEventListener("resize", onWindowResize);
    animate();
  }, []);

  const handeActiveAirPlaneHeight = (value) => {
    if (value > 0) {
      activeAirPlane?.moveUp();
    } else {
      activeAirPlane?.moveDown();
    }
  };

  const dataSource = Object.values(airplanes).map((item) => ({
    name: `AirPlane #${item.id}`,
    index: item.id,
    targetIndex: item.targetIndex,
    position: item.dq_pos.getVector().toString()
  }));

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Position",
      dataIndex: "position",
      key: "position",
    },
    {
      title: "Index",
      dataIndex: "index",
      key: "index",
    },
    {
      title: "Target index",
      dataIndex: "targetIndex",
      key: "targetIndex",
    },
  ];

  return (
    <>
      <Drawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        width={600}
        placement="left"
      >
        <Table dataSource={dataSource} columns={columns} pagination={false} rowKey="index" />
      </Drawer>
      <CreateAirModal
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSubmit={(values) => createPlane(values)}
      />
      <div className="height-settings">
        <UpSquareOutlined onClick={() => handeActiveAirPlaneHeight(1)} />
        <DownSquareOutlined onClick={() => handeActiveAirPlaneHeight(-1)} />
      </div>
      <div className="drawer-trigger">
        <Button
          icon={drawerVisible ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
          onClick={() => setDrawerVisible(true)}
        />
      </div>

      <div className="drawer-body">
        <h3>Settings</h3>
        <div style={{ marginTop: 16 }}>
          <Button type="primary" onClick={() => setIsModalVisible(true)}>
            Create Plane
          </Button>
        </div>
        {/* <div style={{ margin: "16px 0" }}>Use Orbit Controls Camera</div>
        <div style={{ marginBottom: "16px" }}>
          <Switch
            checked={activeCameraIndex}
            onChange={(checked) => setActiveCameraIndex(checked)}
          />
        </div> */}
        <div style={{ margin: "16px 0" }}>Choose Airplane</div>
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
      </div>
    </>
  );
};

App.propTypes = {};

export default App;
