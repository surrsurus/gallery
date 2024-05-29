import * as THREE from 'three';
import Stats from 'stats.js'
import { channel } from './gallery_socket.js';
import { scene, renderer } from './scene.js';
import { CameraRig, Light, Player } from './objects.js';

const fpsMeter = new Stats();
const camera_rig = new CameraRig(new THREE.Vector3(0, 0.3, -1));
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
  // on join we get our id, and the list of current players
  channel.join()
    .receive("ok", ({ players: players, id: id }) => {
      // we prepare to render the other players, then tell the server we're ready to be rendered ourselves
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
  const statHtml = document.getElementById("stats-canvas");
  const canvasHtml = document.getElementById("gallery-canvas");

  // and canvas and let it be focusable to capture key events
  const canvas = canvasHtml.appendChild(renderer.domElement);
  canvas.tabIndex = 1;

  // enable fps meter and position it better
  // this will have it be positioned relative to it's container so it won't overlap the header
  fpsMeter.showPanel(0);
  const fpsMeterCanvas = statHtml.appendChild(fpsMeter.dom);
  fpsMeterCanvas.style.position = "absolute";

  document.body.addEventListener('keydown', (e) => {
    const key = e.code.replace('Key', '').toLowerCase();
    if (keys[key] !== undefined) { keys[key] = true; }
  });

  document.body.addEventListener('keyup', (e) => {
    const key = e.code.replace('Key', '').toLowerCase();
    if (keys[key] !== undefined) { keys[key] = false; }
  });

  window.addEventListener('resize', (_e) => {
    camera_rig.resize();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  animate();
}

function animate() {
  requestAnimationFrame(animate);
  fpsMeter.begin();

  camera_rig.update();

  // grow light in intensity when first loading
  // TODO: would be cool if i could do this and not constatly 
  // check this as part of my animation loop after it's finished
  if (mainLight.drawable.intensity < 500) {
    mainLight.drawable.intensity += 1;
  }

  if (current_players[my_id]) {
    const me = current_players[my_id].drawable;
    let speed = 0.0;
    let speedMod = 1.0;

    if (keys.shiftleft) { speedMod = 2.5; }
    if (keys.w) { speed = 0.01 * speedMod; } else if (keys.s) { speed = -0.01 * speedMod; }
    if (keys.a) { me.rotateY(0.05); } else if (keys.d) { me.rotateY(-0.05); }

    if (speed != 0.0) {
      me.translateZ(speed);

      const a = me.position.clone();
      const b = camera_rig.boom.position.clone();

      const dir = a.clone().sub(b).normalize();
      const dis = a.distanceTo(b) - camera_rig.boomLength;

      camera_rig.boom.position.addScaledVector(dir, dis);
      camera_rig.controls.target.copy(me.position)
      camera_rig.camera.lookAt(me.position);
    }

    // Send updates if we are getting updates from the player
    if (Object.values(keys).some(key => key === true)) {
      channel.push("update_position", {
        id: my_id,
        x: me.position.x,
        y: me.position.y,
        z: me.position.z,
        rot: me.rotation
      });
    }
  }

  renderer.render(scene, camera_rig.camera);

  fpsMeter.end();
}

function addNewPlayer(player_data) {
  current_players[player_data.id] = new Player(player_data);
}