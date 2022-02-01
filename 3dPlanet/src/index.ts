import {
  AdditiveBlending,
  AmbientLight,
  BufferGeometry,
  Float32BufferAttribute,
  Fog,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  PerspectiveCamera,
  PointLight,
  Points,
  PointsMaterial,
  QuadraticBezierCurve3,
  Scene,
  SphereGeometry,
  Spherical,
  TextureLoader,
  TorusGeometry,
  TubeGeometry,
  Vector3,
  WebGLRenderer,
} from 'three';

const textureEarthElement = document.querySelector('.texture-earth');
const textureEarthSrc = textureEarthElement?.getAttribute('src');

const textureMoonElement = document.querySelector('.texture-moon');
const textureMoonSrc = textureMoonElement?.getAttribute('src');

const renderer = new WebGLRenderer({
  antialias: true,
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearColor(0x000000, 1);

document.body.appendChild(renderer.domElement);

const scene = new Scene();

scene.fog = new Fog(0x000000, 0.1, 7000);

function addLight() {
  // const ambientLight = new AmbientLight(0x777777);
  // scene.add(ambientLight);

  const pointLight = new PointLight(0xffffff, 1, 0);
  pointLight.position.set(500, 500, -5000);
  scene.add(pointLight);
}

addLight();

const camera = new PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 10000);
camera.position.z = -3000;

const textureLoader = new TextureLoader();

function makePlanet(diameter: number, textureSource?: string |null) {
  const geometry = new SphereGeometry(diameter, 256, 256);
  const material = new MeshLambertMaterial({
    // color: 0x2727e6,
  });

  if (textureSource) {
    const texture = textureLoader.load(textureSource || '');
    material.setValues({ color: undefined, map: texture });
  } else {
    material.setValues({ color: 0x2727e6 });
  }

  const sphere = new Mesh(geometry, material);

  scene.add(sphere);

  return sphere;
}

function makeRing(width: number, color?:string | number) {
  const geometry = new TorusGeometry(width, 5, 16, 100);
  const material = new MeshBasicMaterial({ color });
  const ring = new Mesh(geometry, material);

  ring.geometry.rotateX(Math.PI / 2);
  // ring.rotateY(Math.PI / 2);
  ring.geometry.rotateZ(Math.PI / 10);

  scene.add(ring);

  return ring;
}

function makeStars() {
  const geometry = new BufferGeometry();
  const vertices = [];

  for (let i = 0; i < 5000; i++) {
    // vertices.push(
    //   2000 * Math.random() - 1000,
    //   2000 * Math.random() - 1000,
    //   2000 * Math.random() - 1000,
    // );

    const sphericalPoint = new Spherical(
      900 + Math.random() * 2000,
      2 * Math.PI * Math.random(),
      Math.PI * Math.random(),
    );

    const point = new Vector3();
    point.setFromSpherical(sphericalPoint);

    vertices.push(point.x, point.y, point.z);
  }

  geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3));

  const material = new PointsMaterial({
    color: 0xffffff,
    blending: AdditiveBlending,
    transparent: true,
    depthTest: true,
    depthWrite: false,
    // fog: true,
    // size: 50,
  });

  const stars = new Points(geometry, material);

  scene.add(stars);

  return stars;
}

function makeLine() {
  const path = new QuadraticBezierCurve3(
    new Vector3(800, 0, 0),
    new Vector3(1200, 0, -1200),
    new Vector3(0, 0, -800),
  );

  const geometry = new TubeGeometry(path, 60, 8, 20, false);
  const material = new MeshBasicMaterial({
    color: 0xff0000,
  });

  const mesh = new Mesh(geometry, material);

  scene.add(mesh);

  return mesh;
}

const planet = makePlanet(800, textureEarthSrc);
const moon = makePlanet(100, textureMoonSrc);
const stars = makeStars();

// const line = makeLine();

moon.translateX(1800);
// const ring1 = makeRing(1100, 0xff4141F);
// const ring2 = makeRing(1200, 0xffffff);
// const ring3 = makeRing(1300, 0xffdb00);

const planetGroup = new Group();
// planetGroup.add(planet);
planetGroup.add(moon);

scene.add(planetGroup);

let cameraCurrentX = 0;
let cameraCurrentY = 0;

let cameraAimX = 0;
let cameraAimY = 0;

function animate() {
  const cameraDiffX = cameraAimX - cameraCurrentX;
  const cameraDiffY = cameraAimY - cameraCurrentY;

  cameraCurrentX += cameraDiffX * 0.05;
  cameraCurrentY += cameraDiffY * 0.05;

  // camera.position.x = cameraCurrentX;
  // camera.position.y = cameraCurrentY;

  const sphere = new Spherical(
    3000,
    (cameraCurrentY * 0.001) - Math.PI / 2,
    (cameraCurrentX * 0.001),
  );

  camera.position.setFromSpherical(sphere);

  camera.lookAt(scene.position);
  renderer.render(scene, camera);
  window.requestAnimationFrame(animate);

  // ring1.geometry.rotateY(0.004);
  // ring2.geometry.rotateY(-0.002);
  // ring3.geometry.rotateY(-0.003);

  // stars.rotateX(0.001);
  stars.rotateY(0.0001);
  // stars.rotateZ(0.004);

  planet.rotateY(0.005);
  // line.rotateY(0.005);
  planetGroup.rotateY(0.001);
}

// window.addEventListener('scroll', (event) => {
//   const scrollPosition = window.scrollY;
//   planet.rotation.set(0, scrollPosition / 100, 0);
// });

animate();

function addMouseControl() {
  let isMouseDown = false;
  let startX = 0;
  let startY = 0;

  document.addEventListener('mousedown', ({ pageX, pageY }) => {
    isMouseDown = true;

    startX = pageX;
    startY = pageY;
  });

  document.addEventListener('mouseup', () => {
    isMouseDown = false;
  });

  window.addEventListener('mousemove', (event) => {
    if (isMouseDown) {
      // cameraAimX = ((window.innerWidth / 2) - event.pageX) * 4;
      // cameraAimY = ((window.innerHeight / 2) - event.pageY) * 4;
      cameraAimX += (event.pageX - startX) * 4;
      cameraAimY += (event.pageY - startY) * 4;

      startX = event.pageX;
      startY = event.pageY;
    }
  });
}

addMouseControl();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
});
