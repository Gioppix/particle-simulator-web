// import { useState } from "react";

// <button onClick={() => setCount((count) => count + 1)}>
//   count is {count}
// </button>
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { Reflector } from "three/addons/objects/Reflector.js";
import { get_id } from "./globals";

export default function Graphics({ forceMul }: { forceMul: number }) {
  // const [count, setCount] = useState(0);

  let camera: THREE.PerspectiveCamera;
  let scene: THREE.Scene;
  let renderer: THREE.WebGLRenderer;

  let cameraControls: OrbitControls;

  let sphereGroup: THREE.Object3D;
  let smallSphere: THREE.Mesh;

  let groundMirror: Reflector;
  let verticalMirror: Reflector;

  let container: HTMLElement | null;

  const id = get_id();

  useEffect(() => {
    console.log(`${id}: inside useEffect`);
    init();
    return () => {
      clean_up();
    };
  }, []);

  function clean_up() {
    console.log(`${id}: cleaning`);
    renderer?.dispose();
    container?.replaceChildren();
  }

  function init() {
    container = document.getElementById(id);
    if (!container) throw new Error(`container (#${id}) not found`);

    // renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setAnimationLoop(animate);
    container.appendChild(renderer.domElement);

    // scene
    scene = new THREE.Scene();

    // camera
    camera = new THREE.PerspectiveCamera(
      45,
      /*will be set later */ 100,
      1,
      500,
    );
    camera.position.set(0, 75, 160);

    cameraControls = new OrbitControls(camera, renderer.domElement);
    cameraControls.target.set(0, 40, 0);
    cameraControls.maxDistance = 400;
    cameraControls.minDistance = 10;
    cameraControls.update();

    //

    const planeGeo = new THREE.PlaneGeometry(100.1, 100.1);

    // reflectors/mirrors

    let geometry, material;

    geometry = new THREE.CircleGeometry(40, 64);
    groundMirror = new Reflector(geometry, {
      clipBias: 0.003,
      // textureWidth: 1 * window.devicePixelRatio,
      // textureHeight: 1 * window.devicePixelRatio,
      color: 0xb5b5b5,
    });
    groundMirror.position.y = 0.5;
    groundMirror.rotateX(-Math.PI / 2);
    scene.add(groundMirror);

    geometry = new THREE.PlaneGeometry(100, 100);
    verticalMirror = new Reflector(geometry, {
      clipBias: 0.003,
      // textureWidth: 1 * window.devicePixelRatio,
      // textureHeight: 1 * window.devicePixelRatio,
      color: 0xc1cbcb,
    });
    verticalMirror.position.y = 50;
    verticalMirror.position.z = -50;
    scene.add(verticalMirror);

    sphereGroup = new THREE.Object3D();
    scene.add(sphereGroup);

    geometry = new THREE.CylinderGeometry(
      0.1,
      15 * Math.cos((Math.PI / 180) * 30),
      0.1,
      24,
      1,
    );
    material = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      emissive: 0x8d8d8d,
    });
    const sphereCap = new THREE.Mesh(geometry, material);
    sphereCap.position.y = -15 * Math.sin((Math.PI / 180) * 30) - 0.05;
    sphereCap.rotateX(-Math.PI);

    geometry = new THREE.SphereGeometry(
      15,
      24,
      24,
      Math.PI / 2,
      Math.PI * 2,
      0,
      (Math.PI / 180) * 120,
    );
    const halfSphere = new THREE.Mesh(geometry, material);
    halfSphere.add(sphereCap);
    halfSphere.rotateX((-Math.PI / 180) * 135);
    halfSphere.rotateZ((-Math.PI / 180) * 20);
    halfSphere.position.y = 7.5 + 15 * Math.sin((Math.PI / 180) * 30);

    sphereGroup.add(halfSphere);

    geometry = new THREE.IcosahedronGeometry(5, 0);
    material = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      emissive: 0x7b7b7b,
      flatShading: true,
    });
    smallSphere = new THREE.Mesh(geometry, material);
    scene.add(smallSphere);

    // walls
    const planeTop = new THREE.Mesh(
      planeGeo,
      new THREE.MeshPhongMaterial({ color: 0xffffff }),
    );
    planeTop.position.y = 100;
    planeTop.rotateX(Math.PI / 2);
    scene.add(planeTop);

    const planeBottom = new THREE.Mesh(
      planeGeo,
      new THREE.MeshPhongMaterial({ color: 0xffffff }),
    );
    planeBottom.rotateX(-Math.PI / 2);
    scene.add(planeBottom);

    const planeFront = new THREE.Mesh(
      planeGeo,
      new THREE.MeshPhongMaterial({ color: 0x7f7fff }),
    );
    planeFront.position.z = 50;
    planeFront.position.y = 50;
    planeFront.rotateY(Math.PI);
    scene.add(planeFront);

    const planeRight = new THREE.Mesh(
      planeGeo,
      new THREE.MeshPhongMaterial({ color: 0x00ff00 }),
    );
    planeRight.position.x = 50;
    planeRight.position.y = 50;
    planeRight.rotateY(-Math.PI / 2);
    scene.add(planeRight);

    const planeLeft = new THREE.Mesh(
      planeGeo,
      new THREE.MeshPhongMaterial({ color: 0xff0000 }),
    );
    planeLeft.position.x = -50;
    planeLeft.position.y = 50;
    planeLeft.rotateY(Math.PI / 2);
    scene.add(planeLeft);

    // lights
    const mainLight = new THREE.PointLight(0xe7e7e7, 2.5, 250, 0);
    mainLight.position.y = 60;
    scene.add(mainLight);

    const greenLight = new THREE.PointLight(0x00ff00, 0.5, 1000, 0);
    greenLight.position.set(550, 50, 0);
    scene.add(greenLight);

    const redLight = new THREE.PointLight(0xff0000, 0.5, 1000, 0);
    redLight.position.set(-550, 50, 0);
    scene.add(redLight);

    const blueLight = new THREE.PointLight(0xbbbbfe, 0.5, 1000, 0);
    blueLight.position.set(0, 50, 550);
    scene.add(blueLight);

    onWindowResize();
    window.addEventListener("resize", onWindowResize);
  }

  function onWindowResize() {
    if (!container) return;
    const width = container.clientWidth;
    const heigth = container.clientHeight;
    if (camera) {
      camera.aspect = width / heigth;
      camera.updateProjectionMatrix();
    }

    renderer.setSize(width, heigth);

    groundMirror
      ?.getRenderTarget()
      .setSize(
        width * window.devicePixelRatio,
        heigth * window.devicePixelRatio,
      );
    verticalMirror
      ?.getRenderTarget()
      .setSize(
        width * window.devicePixelRatio,
        heigth * window.devicePixelRatio,
      );
  }

  const forceMulRef = useRef(forceMul);
  useEffect(() => {
    forceMulRef.current = forceMul;
  }, [forceMul]);

  let position = 0;
  let last_time = Date.now();
  function animate() {
    const delta = (Date.now() - last_time) * 0.1;
    position = position + delta * 0.01 * forceMulRef.current;

    sphereGroup.rotation.y -= 0.002;

    smallSphere.position.set(
      Math.cos(position) * 30,
      Math.abs(Math.cos(position * 3)) * 20 + 5,
      Math.sin(position) * 30,
    );
    smallSphere.rotation.y = Math.PI / 2 - position * 0.1;
    smallSphere.rotation.z = position * 0.8;

    sphereGroup.rotation.y = Math.PI / 2 - position * 0.1;

    renderer.render(scene, camera);
    last_time = Date.now();
  }

  return (
    <div className="h-full w-full">
      <div className="absolute bottom-0 left-0 text-white"> {forceMul} </div>
      <div className="h-full w-full" id={id}></div>
    </div>
  );
}
