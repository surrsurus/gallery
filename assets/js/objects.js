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
    this.id = player.id;
  }
}

export class PlayerRegistry {
  constructor(my_id, players) {
    this.players = {};
    this.me = null;
    this.my_id = my_id;

    players.map((player) => this.add(player));
  }

  add(player) {
    if (player.id == this.my_id) {
      this.me = new Player(player);
    } else {
      this.players[player.id] = new Player(player);
    }
  }

  checkCollision() {
    const all_players_but_me = Object.values(this.players).map((player) => player.drawable);

    for (let vertexIndex = 0; vertexIndex < this.me.drawable.geometry.attributes.position.array.length; vertexIndex += 3) {
      const localVertex = new THREE.Vector3().fromBufferAttribute(this.me.drawable.geometry.attributes.position, vertexIndex).clone();
      const globalVertex = localVertex.applyMatrix4(this.me.drawable.matrix);
      const directionVector = globalVertex.sub(this.me.drawable.position);
  
      const ray = new THREE.Raycaster(this.me.drawable.position.clone(), directionVector.clone().normalize());
      const collisionResults = ray.intersectObjects(all_players_but_me);
      if (collisionResults.length > 0 && collisionResults[0].distance < directionVector.length())
        return true;
    }
  
    return false;
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
  constructor(position = new THREE.Vector3(), lookAt = scene.position, fov = 90, near = 0.01, far = undefined) {
    this.camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, near, far);
    this.camera.position.copy(position);
    this.lookAt(lookAt);

    this.controls = new OrbitControls(this.camera, renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.enablePan = false;
  }

  lookAt(position) {
    this.camera.lookAt(position);
  }

  setTarget(position) {
    this.controls.target.copy(position);
  }

  attachTo(position, offset) {
    this.lookAt(position);
    this.setTarget(position);
    this.camera.position.copy(position).add(offset);
  }

  moveTo(before, after) {
    // Don't capture y-axis movement
    before.y = 0;
    after.y = 0;

    const dir = after.clone().sub(before).normalize();
    const dis = after.distanceTo(before);

    this.camera.position.addScaledVector(dir, dis);
    this.setTarget(after);
  }

  resize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  }

  update() {
    this.controls.update();
  }
}