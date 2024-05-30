import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js'
import Stats from 'stats.js'
import { channel } from './gallery_socket.js';
import { scene, renderer } from './scene.js';
import { CameraRig, Light, PlayerRegistry } from './objects.js';

const fpsMeter = new Stats();
const camera_rig = new CameraRig(new THREE.Vector3(0, 0.3, -1));
const mainLight = new Light(new THREE.Vector3(0, 5, -10)); // main light in the scene
const brightenLight = new TWEEN.Tween(mainLight.drawable)
  .to({ intensity: 500 }, 5000)
  .easing(TWEEN.Easing.Quadratic.In);

// keymap of what keys are currently pressed
const keys = {
  a: false,
  s: false,
  d: false,
  w: false,
  shiftLeft: false,
  space: false,
};

// what animations are currently playing
const animations = {
  jumping: false,
};

let player_registry = null;

// only start up the three.js scene if we get the sign we're all connected from the phoenix live page
window.addEventListener("phx:start_scene", (_e) => {
  channel.join()
    .receive("ok", ({ players: players, id: id }) => {
      player_registry = new PlayerRegistry(id, players);

      prepareCanvas();

      channel.push("ready", { id: id });
    })
    .receive("error", resp => console.log("Unable to join", resp));
});

channel.on("player_joined", ({ player: player }) => player_registry.add(player));
channel.on("player_left", ({ id: id }) => player_registry.remove(id));
channel.on("player_moved", ({ id: id, pos: pos, rot: rot }) => player_registry.updatePlayer(id, pos, rot));

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
    if (keys[key] !== undefined) keys[key] = true;
  });

  document.body.addEventListener('keyup', (e) => {
    const key = e.code.replace('Key', '').toLowerCase();
    if (keys[key] !== undefined) keys[key] = false;
  });

  canvas.addEventListener('blur', (_e) => Object.keys(keys).forEach(key => keys[key] = false));
  window.addEventListener('blur', (_e) => Object.keys(keys).forEach(key => keys[key] = false));

  window.addEventListener('resize', (_e) => {
    camera_rig.resize();
    renderer.setSize(canvasHtml.offsetWidth, canvasHtml.offsetHeight);
  });

  brightenLight.start();

  animate();
}

function animate() {
  requestAnimationFrame(animate);
  fpsMeter.begin();

  camera_rig.update();
  TWEEN.update();

  if (player_registry.me()) {
    const me = player_registry.me().drawable;
    let speed = 0.0;
    let speedMod = 1.0;

    if (keys.shiftLeft) speedMod = 2.5;
    if (keys.w) speed += 0.01 * speedMod;
    if (keys.s) speed -= 0.01 * speedMod;
    if (keys.a) me.rotateY(0.05);
    if (keys.d) me.rotateY(-0.05);
    if (speed != 0.0) move(me, speed)

    if (keys.space && me.position.y == 0) jump(me);

    // Send updates if we are getting updates from the player, but not if we're animating
    // (animations send their own updates)
    const anyKeysPressed = Object.values(keys).some(key => key === true);
    const notPlayingAnimations = !Object.values(animations).some(animation => animation === true);
    if (anyKeysPressed && notPlayingAnimations) sendPosition(me);
  }

  renderer.render(scene, camera_rig.camera);

  fpsMeter.end();
}

function sendPosition(me) {
  channel.push("update_position", {
    id: player_registry.my_id,
    pos: me.position,
    rot: { x: me.rotation.x, y: me.rotation.y, z: me.rotation.z }
  });
}

function move(me, speed) {
  const before = me.position.clone();
  me.translateZ(speed);
  const after = me.position.clone();

  // Don't capture y-axis movement
  before.y = 0;
  after.y = 0;

  const dir = after.clone().sub(before).normalize();
  const dis = after.distanceTo(before);

  camera_rig.camera.position.addScaledVector(dir, dis);
  camera_rig.controls.target.copy(after)
}

function jump(me) {
  new TWEEN.Tween(me.position)
    .to({ y: me.position.y + 0.3 }, 250)
    .easing(TWEEN.Easing.Cubic.Out)
    .start()
    .onStart(() => animations.jumping = true)
    .onUpdate(() => sendPosition(me))
    .onComplete(() => {
      new TWEEN.Tween(me.position)
        .to({ y: 0 }, 250)
        .easing(TWEEN.Easing.Cubic.In)
        .start()
        .onUpdate(() => sendPosition(me))
        .onComplete(() => animations.jumping = false)
    })
}