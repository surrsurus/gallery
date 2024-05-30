import * as THREE from 'three';
import { scene, renderer } from './scene.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

class Drawable {
  constructor(drawable, position, autoAdd = true) {
    this.drawable = drawable;
    this.drawable.position.copy(position);

    if (autoAdd) this.addToScene();
  }

  addToScene() {
    scene.add(this.drawable);
  }

  removeFromScene() {
    scene.remove(this.drawable);
  }

  update(pos, rot) {
    this.drawable.position.x = pos.x;
    this.drawable.position.y = pos.y;
    this.drawable.position.z = pos.z;

    this.drawable.rotation.x = rot.x;
    this.drawable.rotation.y = rot.y;
    this.drawable.rotation.z = rot.z;
  }
}

class Player extends Drawable {
  constructor(player) {
    const geometry = new THREE.BoxGeometry(0.19, 0.21, 0.19);
    const material = new THREE.MeshLambertMaterial({ color: player.color });

    const position = new THREE.Vector3(player.pos.x, player.pos.y, player.pos.z);
    const player_mesh = new THREE.Mesh(geometry, material);
    player_mesh.rotation.x = player.rot.x;
    player_mesh.rotation.y = player.rot.y;
    player_mesh.rotation.z = player.rot.z;

    super(player_mesh, position);
  }
}

export class PlayerRegistry {
  constructor(my_id, players) {
    this.players = {};
    this.my_id = my_id;

    players.map((player) => this.players[player.id] = new Player(player));
  }

  add(player) {
    this.players[player.id] = new Player(player);
  }

  get(id) {
    return this.players[id];
  }

  me() {
    return this.players[this.my_id];
  }

  remove(id) {
    this.players[id].removeFromScene();
    delete this.players[id];
  }

  updatePlayer(id, pos, rot) {
    if (this.my_id != id) this.players[id].update(pos, rot);
  }
}

export class Light extends Drawable {
  constructor(position, color = 0xffffff, intensity = 1, distance = 0) {
    const light = new THREE.PointLight(color, intensity, distance);
    super(light, position);
  }
}

export class CameraRig {
  constructor(position, lookAt = scene.position, fov = 90, near = 0.01, far = undefined) {
    this.camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, near, far);
    this.camera.position.copy(position);
    this.camera.lookAt(lookAt);

    this.controls = new OrbitControls(this.camera, renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.enablePan = false;
  }

  resize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  }

  update() {
    this.controls.update();
  }
}