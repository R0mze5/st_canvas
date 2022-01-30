import * as THREE from 'three';

// setup renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearColor(0x333333, 1);

document.body.appendChild(renderer.domElement);

// create a scene
const scene = new THREE.Scene();

// create a camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 500);
camera.position.z = -50;
camera.lookAt(scene.position);

const light = new THREE.DirectionalLight(0xffffff, 0.5);
light.position.set(0, 0, -1);
scene.add(light);

// hold data about shapes
const shapes:THREE.Mesh[] = [];
//

const animate = function () {
  renderer.render(scene, camera);
  requestAnimationFrame(animate);

  camera.position.setZ(camera.position.z + 1);

  // shapes rotating
  shapes.forEach((shape) => {
    shape.rotateX(0.01);
    // shape.position.setZ(shape.position.z - 1);
  });
};

animate();

let hue = 0;

// shape creating
const createShape = function (x:number, y: number) {
  const geometries = [
    new THREE.ConeGeometry(10, 20, 30),
    new THREE.BoxGeometry(15, 15, 15),
    new THREE.TorusGeometry(5, 3, 16, 100),
    new THREE.SphereGeometry(8, 32, 32),
  ];

  const rand = Math.floor(Math.random() * geometries.length);

  const geometry = geometries[rand];

  const emissiveColor = new THREE.Color(`hsl(${hue}, 100%, 50%)`);

  const material = new THREE.MeshLambertMaterial({
    color: 0xffffff,
    emissive: emissiveColor,
  });

  const shape = new THREE.Mesh(geometry, material);
  shape.position.set(
    (window.innerWidth / 2) - x,
    (window.innerHeight / 2) - y,
    camera.position.z + 500,
  );
  shape.rotateX(0.5);
  shape.rotateZ(0.5);

  shapes.push(shape);
  scene.add(shape);
  hue += 1;
};

// createShape(100, 100);

let isMouseDown = false;

function allowDraw() {
  isMouseDown = true;
}

function disallowDraw() {
  isMouseDown = false;
}

function draw(event:MouseEvent) {
  if (isMouseDown) {
    createShape(event.pageX, event.pageY);
  }
}

// function touchMove(event:TouchEvent) {
//   if (isMouseDown) {
//     createShape(event.touches, event.pageY);
//   }
// }

window.addEventListener('mousedown', allowDraw);
window.addEventListener('touchstart', allowDraw);

window.addEventListener('mouseup', disallowDraw);
window.addEventListener('touchend', disallowDraw);

window.addEventListener('mousemove', draw);
// window.addEventListener('touchmove', touchMove);

window.addEventListener('resize', function () {
  camera.aspect = window.innerWidth / this.window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
});
