// If you want to use Phoenix channels, run `mix help phx.gen.channel`
// to get started and then uncomment the line below.
// import "./user_socket.js"

// You can include dependencies in two ways.
//
// The simplest option is to put them in assets/vendor and
// import them using relative paths:
//
//     import "../vendor/some-package.js"
//
// Alternatively, you can `npm install some-package --prefix assets` and import
// them using a path starting with the package name:
//
//     import "some-package"
//

// Include phoenix_html to handle method=PUT/DELETE in forms and buttons.
import "phoenix_html"
// Establish Phoenix Socket and LiveView configuration.
import { Socket } from "phoenix"
import { LiveSocket } from "phoenix_live_view"
import topbar from "../vendor/topbar"
import * as THREE from 'three';
import { socket, channel } from "./gallery_socket.js"

import { animate, addCanvas, Player } from './main.js';

let csrfToken = document.querySelector("meta[name='csrf-token']").getAttribute("content")
let liveSocket = new LiveSocket("/live", Socket, {
  longPollFallbackMs: 2500,
  params: { _csrf_token: csrfToken },
  metadata: {
    keydown: (e, _el) => {
      return {
        key: e.key,
        metaKey: e.metaKey,
        repeat: e.repeat
      }
    }
  }
})

// Show progress bar on live navigation and form submits
topbar.config({ barColors: { 0: "#29d" }, shadowColor: "rgba(0, 0, 0, .3)" })
window.addEventListener("phx:page-loading-start", _info => topbar.show(300))
window.addEventListener("phx:page-loading-stop", _info => topbar.hide())

// connect if there are any LiveViews on the page
liveSocket.connect()

// store player id
let my_id = null;

// store players met during the current session
let current_players = {};

window.addEventListener("phx:start_scene", (_e) => {
  addCanvas();
  animate();
});

channel.join()
  .receive("ok", ({players: players, id: id}) => {
    players.map(player => addPlayer(player));
    my_id = id;

    channel.push("ready", {id: id});
  })
  .receive("error", resp => { console.log("Unable to join", resp) });

channel.on("player_joined", ({ player: player }) => addPlayer(player));

channel.on("player_left", ({ id: id }) => current_players[id].removeFromScene());

channel.on("player_moved", ({ id: id, dx: dx, dy: dy, dz: dz }) => current_players[id].updatePosition(dx, dy, dz));

document.addEventListener('keydown', function(event) {
  switch (event.key) {
    case 'w':
    case 'W':
      channel.push("update_position", {id: my_id, dx: 0, dy: 1, dz: 0});
      break;
    case 'a':
    case 'A':
      channel.push("update_position", {id: my_id, dx: -1, dy: 0, dz: 0});
      break;
    case 's':
    case 'S':
      channel.push("update_position", {id: my_id, dx: 0, dy: -1, dz: 0});
      break;
    case 'd':
    case 'D':
      channel.push("update_position", {id: my_id, dx: 1, dy: 0, dz: 0});
      break;
    default:
      return;
  }
});

function addPlayer(player) {
  const geometry = new THREE.BoxGeometry();
  const material = new THREE.MeshBasicMaterial({ color: player.color });
  const position = new THREE.Vector3(player.x, player.y, player.z);
  const p = new Player(geometry, material, position);

  current_players[player.id] = p;
  p.addToScene();
}

// expose liveSocket on window for web console debug logs and latency simulation:
// >> liveSocket.enableDebug()
// >> liveSocket.enableLatencySim(1000)  // enabled for duration of browser session
// >> liveSocket.disableLatencySim()
window.liveSocket = liveSocket

