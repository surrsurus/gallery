import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Initialize Three.js scene, camera, and renderer
const scene = new THREE.Scene();
const renderer = createRenderer();
const camera = createCamera();
const controls = createControls(camera);

class Drawable {
  constructor(drawable, position, autoAdd = true) {
    this.drawable = drawable;
    this.drawable.position.copy(position)

    if (autoAdd) {
      this.addToScene();
    }
  }

  addToScene() {
    scene.add(this.drawable)
  }

  removeFromScene() {
    scene.remove(this.drawable);
  }

  updatePosition(dx, dy, dz) {
    const delta_pos = new THREE.Vector3(dx, dy, dz)
    this.drawable.position.add(delta_pos);
  }
}

export class Player extends Drawable {
  constructor(geometry, material, position) {
    const player = new THREE.Mesh(geometry, material);
    super(player, position)
  }

  static fromPhoenix(player) {
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshLambertMaterial({ color: player.color });
    const position = new THREE.Vector3(player.x, player.y, player.z);

    return new Player(geometry, material, position);
  }
}

export class Light extends Drawable {
  constructor(position, color = 0xffffff, intensity = 1, distance = 0) {
    const light = new THREE.PointLight(color, intensity, distance);
    super(light, position)
  }
}

const mainLight = new Light(new THREE.Vector3(10, 10, 10));

// Add the canvas to the current page
export function addCanvas() {
  document.body.appendChild(renderer.domElement);

  return document.querySelectorAll('[data-engine="three.js r164"]')[0];
}

// Animate the scene
export function animate() {
  controls.update();

  // grow light in intensity when first loading
  // TODO: would be cool if i could do this and not constatly 
  // check this as part of my animation loop after it's finished
  if (mainLight.drawable.intensity < 250) {
    mainLight.drawable.intensity += 1
    console.log(mainLight.drawable.intensity)
  }

  renderer.render(scene, camera);

  requestAnimationFrame(animate);
}

export function moveCamera(dx, dy, dz) {
  const delta_pos = new THREE.Vector3(dx, dy, dz);
  camera.position.add(delta_pos);
  controls.target.add(delta_pos);
}

export function resetCamera() {
  // if you reset in the middle of a sweep, the camera 
  // will still move after the reset due to damping
  // this feels weird, so this little hack disables 
  // damping to stop that motion, then renables it after the reset
  controls.enableDamping = false;
  controls.update();
  controls.reset();
  controls.enableDamping = true;
  controls.update();
}

function createCamera() {
  const camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 0, 5);

  return camera;
}

function createControls(camera) {
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.update();
  controls.saveState();

  return controls;
}

function createRenderer() {
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);

  return renderer;
}
