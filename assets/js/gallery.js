import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js'
import Stats from 'stats.js'
import { channel } from './gallery_socket.js';
import { scene, renderer } from './scene.js';
import { CameraRig, Light, PlayerRegistry } from './objects.js';

const gridHelper = new THREE.GridHelper(40, 40);
const axesHelper = new THREE.AxesHelper();

const fpsMeter = new Stats();
const camera_rig = new CameraRig();
const camera_offset = new THREE.Vector3(0, 0.3, -1);

new Light(new THREE.Vector3(0, 5, -10), 0xffffff, 500); // main light in the scene

// Turns light on over time, disabled because there's no point right now
// const brightenLight = new TWEEN.Tween(mainLight.drawable)
//   .to({ intensity: 500 }, 5000)
//   .easing(TWEEN.Easing.Quadratic.In);

// keymap of what keys are currently pressed
const keys = {
  a: false,
  s: false,
  d: false,
  w: false,
  shiftleft: false,
  space: false,
};

// what animations are currently playing
const animations = {
  jumping: false,
};

let player_registry = null;

// request existing players and ourselves, then ready up
window.addEventListener("phx:start_scene", (_e) => {
  channel.join()
    .receive("ok", ({ players: players, you: me }) => {
      player_registry = new PlayerRegistry(players, me);

      camera_rig.attachTo(me.pos, camera_offset);

      prepareCanvas();

      channel.push("ready", { id: me.id });
    })
    .receive("error", resp => console.log("Unable to join", resp));
});

channel.on("player_joined", ({ player: player }) => {if (player_registry) player_registry.add(player);});
channel.on("player_left", ({ id: id }) => {if (player_registry) player_registry.remove(id);});
channel.on("player_moved", ({ id: id, pos: pos, rot: rot }) => {if (player_registry) player_registry.updatePlayer(id, pos, rot);});

function prepareCanvas() {
  const statHtml = document.getElementById("stats-canvas");
  const canvasHtml = document.getElementById("gallery-canvas");

  renderer.setSize(canvasHtml.offsetWidth, canvasHtml.offsetHeight);

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

  const disableInput = (_e) => Object.keys(keys).forEach(key => keys[key] = false);
  canvas.addEventListener('blur', disableInput);
  window.addEventListener('blur', disableInput);

  window.addEventListener('resize', (_e) => {
    camera_rig.resize();
    renderer.setSize(canvasHtml.offsetWidth, canvasHtml.offsetHeight);
  });

  // brightenLight.start();

  scene.add(gridHelper);
  scene.add(axesHelper);

  animate();
}

function animate() {
  requestAnimationFrame(animate);
  fpsMeter.begin();

  camera_rig.update();
  TWEEN.update();

  const me = player_registry.me;

  if (me) { 
    let speed = 0.0;
    let speedMod = 1.0;

    if (keys.shiftleft) speedMod = 2.5;
    if (keys.w) speed += 0.01 * speedMod;
    if (keys.s) speed -= 0.01 * speedMod;
    if (keys.a) me.drawable.rotateY(0.05);
    if (keys.d) me.drawable.rotateY(-0.05);
    if (speed != 0.0) move(me, speed);

    if (keys.space && me.drawable.position.y == 0) jump(me);

    // Testing: Check collision
    if (player_registry.currentlyColliding()) move(me, -speed - 0.01);

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
    id: player_registry.me.id,
    pos: me.drawable.position,
    rot: { x: me.drawable.rotation.x, y: me.drawable.rotation.y, z: me.drawable.rotation.z }
  });
}

function move(me, speed) {
  const before = me.drawable.position.clone();
  me.drawable.translateZ(speed);
  const after = me.drawable.position.clone();

  camera_rig.moveTo(before, after);
}

function jump(me) {
  new TWEEN.Tween(me.drawable.position)
    .to({ y: me.drawable.position.y + 0.3 }, 250)
    .easing(TWEEN.Easing.Cubic.Out)
    .start()
    .onStart(() => animations.jumping = true)
    .onUpdate(() => sendPosition(me))
    .onComplete(() => {
      new TWEEN.Tween(me.drawable.position)
        .to({ y: 0 }, 250)
        .easing(TWEEN.Easing.Cubic.In)
        .start()
        .onUpdate(() => sendPosition(me))
        .onComplete(() => animations.jumping = false)
    });
}