import * as THREE from 'three';
import { scene, renderer } from './scene.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

class Drawable {
  constructor(drawable, position, autoAdd = true) {
    this.drawable = drawable;
    this.drawable.position.copy(position);

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

  updatePosition(x, y, z, rot) {
    this.drawable.position.x = x;
    this.drawable.position.y = y;
    this.drawable.position.z = z;

    this.drawable.rotation.x = rot._x;
    this.drawable.rotation.y = rot._y;
    this.drawable.rotation.z = rot._z;
  }
}

export class Player extends Drawable {
  constructor(payload) {
    const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
    const material = new THREE.MeshLambertMaterial({ color: payload.color });

    const position = new THREE.Vector3(payload.x, payload.y, payload.z);
    const player = new THREE.Mesh(geometry, material);
    player.rotation.x = payload.rot._x;
    player.rotation.y = payload.rot._y;
    player.rotation.z = payload.rot._z;

    super(player, position);
  }
}

export class Light extends Drawable {
  constructor(position, color = 0xffffff, intensity = 1, distance = 0) {
    const light = new THREE.PointLight(color, intensity, distance);
    super(light, position)
  }
}

export class CameraRig {
  constructor() {
    this.coronaSafetyDistance = 0.3;

    this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 10);
    this.camera.position.set(0, 0.3, -1);
    this.camera.lookAt(scene.position);

    this.boom = new THREE.Object3D;
    this.boom.position.z = -this.coronaSafetyDistance;
    this.boom.add(this.camera);

    this.controls = new OrbitControls(this.camera, renderer.domElement);
    this.controls.enableDamping = true;
  }

  resize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  }

  update() {
    this.controls.update();
  }
}