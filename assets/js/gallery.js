import { channel } from "./gallery_socket.js"
import { animate, addCanvas, moveCamera, resetCamera, Player} from './main.js';

// store player id
let my_id = null;

// store players met during the current session
let current_players = {};

// only start up the three.js scene if we get the sign we're all connected from the phoenix live page
window.addEventListener("phx:start_scene", (_e) => {
  prepareCanvas();

  // on join we get our id, and current players
  channel.join()
    .receive("ok", ({ players: players, id: id }) => {
      // we render the players, then tell the server we're ready
      // this will cause the server to send out messages letting everyone else know we can be rendered
      players.map(addNewPlayer);
      my_id = id;

      channel.push("ready", { id: id });
    })
    .receive("error", resp => { console.log("Unable to join", resp) });
});

// new player ready, start rendering them
channel.on("player_joined", ({ player: player_data }) => addNewPlayer(player_data));

// player left, stop rendering them
channel.on("player_left", ({ id: id }) => current_players[id].removeFromScene());

// player position changed, update them
channel.on("player_moved", ({ id: id, dx: dx, dy: dy, dz: dz }) => current_players[id].updatePosition(dx, dy, dz));

function prepareCanvas() {
  const canvas = addCanvas();

  // let canvas be focusable so the event listener can catch key events
  canvas.tabIndex = 1;

  // add movement listener
  canvas.addEventListener('keydown', function (event) {
    switch (event.key) {
      case 'w':
      case 'W':
        channel.push("update_position", { id: my_id, dx: 0, dy: 1, dz: 0 });
        moveCamera(0, 1, 0);
        break;
      case 'a':
      case 'A':
        channel.push("update_position", { id: my_id, dx: -1, dy: 0, dz: 0 });
        moveCamera(-1, 0, 0);
        break;
      case 's':
      case 'S':
        channel.push("update_position", { id: my_id, dx: 0, dy: -1, dz: 0 });
        moveCamera(0, -1, 0);
        break;
      case 'd':
      case 'D':
        channel.push("update_position", { id: my_id, dx: 1, dy: 0, dz: 0 });
        moveCamera(1, 0, 0);
        break;
      case 'r':
      case 'R':
        resetCamera();
        break;
      default:
        return;
    }
  });

  animate();
}

function addNewPlayer(player_data) {
  current_players[player_data.id] = Player.fromPhoenix(player_data);
}