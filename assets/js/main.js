import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Initialize Three.js scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
const controls = new OrbitControls(camera, renderer.domElement);
renderer.setSize(window.innerWidth, window.innerHeight);

camera.position.set( 0, 1, 5 );
controls.update();

export class Player {
  constructor(geometry, material, position) {
    this.geometry = geometry;
    this.material = material;

    this.player = new THREE.Mesh(geometry, material);
    this.player.position.set(position.x, position.y, position.z);
  }

  addToScene() {
    scene.add(this.player);
  }

  removeFromScene() {
    scene.remove(this.player);
  }

  updatePosition(dx, dy, dz) {
    this.player.position.set(this.player.position.x + dx, this.player.position.y + dy, this.player.position.z + dz);
  }
}

export function fromPhoenix(player) {
  const geometry = new THREE.BoxGeometry();
  const material = new THREE.MeshBasicMaterial({ color: player.color });
  const position = new THREE.Vector3(player.x, player.y, player.z);
  const p = new Player(geometry, material, position);

  p.addToScene();

  return p;
}

// Add the canvas to the current page
export function addCanvas() {
  document.body.appendChild(renderer.domElement);
}

// Animate the scene
export function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}