import {
  AmbientLight,
  Color,
  CylinderGeometry,
  DirectionalLight,
  Group, Mesh, MeshLambertMaterial, PerspectiveCamera, Raycaster, Scene, SphereGeometry, TextureLoader, Vector2, Vector3, WebGLRenderer,
} from 'three';
import gsap from 'gsap';

import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';

const catHref = document.querySelector('.cat')?.getAttribute('href');
const eyeHref = document.querySelector('.eye')?.getAttribute('href');

function initRenderer() {
  const renderer = new WebGLRenderer({
    antialias: true,

  });

  renderer.shadowMap.enabled = true;
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setClearColor(0xffffff);
  document.body.appendChild(renderer.domElement);
  return renderer;
}

function initScene() {
  const scene = new Scene();
  return scene;
}

function initCamera() {
  const camera = new PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 10000);
  camera.position.z = -50;
  return camera;
}

const renderer = initRenderer();
const scene = initScene();
const camera = initCamera();

function initLight() {
  const ambientLight = new AmbientLight(0xcccccc);
  scene.add(ambientLight);

  const directionalLight = new DirectionalLight(0xcccccc, 0.5);

  directionalLight.position.set(20, 20, -20);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 300;
  directionalLight.shadow.mapSize.height = 300;
  directionalLight.shadow.camera.near = 0.1;
  directionalLight.shadow.camera.far = 10000;
  directionalLight.shadow.camera.top = 100;
  directionalLight.shadow.camera.bottom = -100;
  directionalLight.shadow.camera.left = -100;
  directionalLight.shadow.camera.right = 100;

  scene.add(directionalLight);
}

initLight();

function addEye() {
  if (!eyeHref) return null;

  const texture = new TextureLoader().load(eyeHref);
  const geometry = new SphereGeometry(0.25, 128, 128);

  const material = new MeshLambertMaterial({
    map: texture,
  });

  const mesh = new Mesh(geometry, material);
  return mesh;
}

let cat: null | Group = null;

const rightEye = addEye();
const leftEye = addEye();

const catGroup = new Group();
scene.add(catGroup);

function loadCat() {
  if (!catHref) return;
  const fbxLoader = new FBXLoader();
  fbxLoader.load(
    catHref,
    (object) => {
      object.rotateY(Math.PI);
      object.translateY(-5);

      // const material = new MeshLambertMaterial({
      //   color: 0x333333,
      // });

      // object.traverse((child) => {
      //   // eslint-disable-next-line no-param-reassign
      //   child.customDepthMaterial = material;
      //   // eslint-disable-next-line no-param-reassign
      //   child.castShadow = true;
      // });

      cat = object;

      if (rightEye && leftEye) {
        const translateX = 0.7;
        const translateY = 10;
        const translateZ = 7;
        leftEye.position.set(
          -1 * translateX,
          translateY,
          translateZ,
        );
        rightEye.position.set(
          translateX,
          translateY,
          translateZ,
        );
        cat.add(leftEye);
        cat.add(rightEye);
      }

      catGroup.add(object);
    },
    (xhr) => {
      console.log(`${(xhr.loaded / xhr.total) * 100}% loaded`);
    },
    (error) => {
      console.log(error);
    },
  );
}

function render() {
  renderer.render(scene, camera);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  render();
}

let floorColor = '#cccccc';

function addFloor() {
  const geometry = new CylinderGeometry(10, 15, 3, 40);
  const material = new MeshLambertMaterial({
    color: new Color(floorColor),
    // color: 0x00ffff,
  });

  const mesh = new Mesh(geometry, material);
  mesh.receiveShadow = true;

  scene.add(mesh);

  return mesh;
}

let cameraAimX = 0;
let cameraAimY = 0;
let cameraAimZ = -900;

const fly = new Vector3(0, 0, -900);

document.addEventListener('mousemove', (event) => {
  cameraAimX = (window.innerWidth / 2) - event.pageX;
  cameraAimY = (window.innerHeight / 2) - event.pageY;

  fly.set(cameraAimX, 2 * cameraAimY, -400);
});

document.addEventListener('wheel', (event) => {
  cameraAimZ -= event.deltaY;
  cameraAimZ = Math.max(cameraAimZ, -800);
  cameraAimZ = Math.min(cameraAimZ, -100);
});

function animate() {
  // if (cat) {
  //   catGroup.rotateY(0.01);
  // }

  const cameraDiffX = cameraAimX / 20 - camera.position.x;
  const cameraDiffY = cameraAimY / 20 - camera.position.y;
  const cameraDiffZ = cameraAimZ / 20 - camera.position.z;

  camera.position.x += (cameraDiffX * 0.05);
  camera.position.y += (cameraDiffY * 0.05);
  camera.position.z += (cameraDiffZ * 0.05);

  // leftEye?.lookAt(camera.position);
  // rightEye?.lookAt(camera.position);

  leftEye?.lookAt(fly);
  rightEye?.lookAt(fly);

  camera.lookAt(scene.position);
  render();
  requestAnimationFrame(animate);
}

const floor = addFloor();
floor.position.y = -6;

catGroup.add(floor);

loadCat();
animate();
window.addEventListener('resize', onWindowResize, false);

document.querySelector('nav')?.addEventListener('click', (event) => {
  const element: HTMLElement = event?.target as HTMLElement;

  if (!element) return;

  if (element.tagName?.toLowerCase() !== 'a') return;

  event.preventDefault();
  const color = element.style.backgroundColor;

  if (!color) return;

  const transition = {
    color: floorColor,
  };

  gsap.to(transition, {
    color,
    onUpdate() {
      floor.material.color = new Color(transition.color);
      floorColor = transition.color;
    },
  }).duration(0.5);
});

document.addEventListener('click', (event) => {
  if (!leftEye || !rightEye) return;
  const mouse = new Vector2();
  const raycaster = new Raycaster();

  mouse.set(
    (event.pageX / window.innerWidth) * 2 - 1,
    (event.pageY / window.innerHeight) * -2 + 1,
  );

  raycaster.setFromCamera(mouse, camera);

  const intersections = raycaster.intersectObjects([leftEye, rightEye]);

  intersections.forEach((intersection) => {
    // intersection.object.visible = false;
    // eslint-disable-next-line no-param-reassign
    (intersection.object as Mesh).material = new MeshLambertMaterial({
      color: 0xff00ff,
    });
  });
});
