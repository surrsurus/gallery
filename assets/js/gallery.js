import * as THREE from 'three';
import { channel } from './gallery_socket.js';
import { scene, renderer } from './scene.js';
import { CameraControls, Light, Player } from './objects.js';

const camera_controls = new CameraControls();
const mainLight = new Light(new THREE.Vector3(0, 5, -10)); // main light in the scene

// keymap of what keys are currently pressed
const keys = {
  a: false,
  s: false,
  d: false,
  w: false,
  shiftleft: false,
};

let my_id = null; // store player id
let current_players = {}; // store players met during the current session

// only start up the three.js scene if we get the sign we're all connected from the phoenix live page
window.addEventListener("phx:start_scene", (_e) => {
  // on join we get our id, and current players
  channel.join()
    .receive("ok", ({ players: players, id: id }) => {
      // we render the players, then tell the server we're ready
      // this will cause the server to send out messages letting everyone else know we can be rendered
      players.map(addNewPlayer);
      my_id = id;

      prepareCanvas();

      channel.push("ready", { id: id });
    })
    .receive("error", resp => { console.log("Unable to join", resp) });
});

// new player ready, start rendering them
channel.on("player_joined", ({ player: player_data }) => addNewPlayer(player_data));

// player left, stop rendering them
channel.on("player_left", ({ id: id }) => {
  current_players[id].removeFromScene();
  delete current_players[id];
});

// player position changed, update them
channel.on("player_moved", ({ id: id, x: x, y: y, z: z, rot: rot }) => {
  if (my_id != id) {
    current_players[id].updatePosition(x, y, z, rot);
  }
});

function prepareCanvas() {
  const canvas = document.body.appendChild(renderer.domElement);

  // let canvas be focusable so the event listener can catch key events
  canvas.tabIndex = 1;

  document.body.addEventListener('keydown', (e) => {
    const key = e.code.replace('Key', '').toLowerCase();
    if (keys[key] !== undefined) { keys[key] = true; }
  });

  document.body.addEventListener('keyup', (e) => {
    const key = e.code.replace('Key', '').toLowerCase();
    if (keys[key] !== undefined) { keys[key] = false; }
  });

  window.addEventListener('resize', (_e) => {
    camera_controls.resize();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  animate();
}

function animate() {
  requestAnimationFrame(animate);

  camera_controls.update();

  // grow light in intensity when first loading
  // TODO: would be cool if i could do this and not constatly 
  // check this as part of my animation loop after it's finished
  if (mainLight.drawable.intensity < 500) {
    mainLight.drawable.intensity += 1;
  }

  if (current_players[my_id]) {
    let speed = 0.0;
    let speedMod = 1.0;

    if (keys.shiftleft) { speedMod = 2.5; }

    if (keys.w) { speed = 0.01 * speedMod; } else if (keys.s) { speed = -0.01 * speedMod; }

    if (keys.a) {
      current_players[my_id].drawable.rotateY(0.05);
    } else if (keys.d) {
      current_players[my_id].drawable.rotateY(-0.05);
    }

    if (speed != 0.0) {
      current_players[my_id].drawable.translateZ(speed);
  
      const a = new THREE.Vector3;
      const b = new THREE.Vector3;

      a.lerp(current_players[my_id].drawable.position, 0.4);
      b.copy(camera_controls.boom.position);
  
      const dir = a.clone().sub(b).normalize();
      const dis = a.distanceTo(b) - camera_controls.coronaSafetyDistance;
      camera_controls.boom.position.addScaledVector(dir, dis);
      camera_controls.controls.target.copy(current_players[my_id].drawable.position)
  
      camera_controls.camera.lookAt(current_players[my_id].drawable.position);  
    }

    // Send updates if we are getting updates from the player
    if (Object.values(keys).some(v => v === true)) {
      channel.push("update_position", { 
        id: my_id, 
        x: current_players[my_id].drawable.position.x, 
        y: current_players[my_id].drawable.position.y, 
        z: current_players[my_id].drawable.position.z, 
        rot: current_players[my_id].drawable.rotation 
      });
    }
  }

  renderer.render(scene, camera_controls.camera);
}

function addNewPlayer(player_data) {
  current_players[player_data.id] = new Player(player_data);
}