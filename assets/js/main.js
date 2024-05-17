import * as THREE from 'three';

// Initialize Three.js scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);

camera.position.z = 5;
camera.position.y = 2.5;

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

  updatePosition(player) {
    this.player.position.set(player.x, player.y, player.z);
  }
}

// Add the canvas to the current page
export function addCanvas() {
  document.body.appendChild(renderer.domElement);
}

// Animate the scene
export function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}