defmodule GalleryWeb.GalleryChannel do
  @moduledoc """
  GalleryChannel - Receive and broadcast updates from players

  # Events

  ## Incoming Messages

  `join` - Joining this channel registers you in the player cache. If the join is successful,
           you'll be given the list of current players and your current player in the payload


  `ready` - Signal to the server that you have received the player data from joining. All other players
            are given your player payload to begin rendering you on their clients. Fires `player_joined` back to the clients.

  `update_position` - Signal to the server that you have changed your position and/or rotation. All other
                      players are given your updated player payload. Fires `player_updated` back to the client.

  ## Outgoing Messages

  `player_joined` - Fired when a new player joins the channel.
                    You will not receive your `player_joined` events you trigger.

  `player_updated` - Fired when a player updates their position and/or rotation.
                   You will not receive `player_updated` events you trigger.

  `player_left` - On disconnect, all players will be notified of your departure so you can stop being rendered on their clients.
  """
  use Phoenix.Channel

  alias Gallery.PlayerCache
  alias Gallery.Player

  require Logger

  intercept ["player_joined", "player_updated"]

  @room "gallery:main"

  @type gallery_socket :: %Phoenix.Socket{assigns: %{player_id: String.t()}}
  @type join_response :: %{players: [Player.t()], you: Player.t()}
  @type ready_payload :: %{required(:id) => String.t()}
  @type update_payload :: %{required(:pos) => map(), required(:rot) => map()}

  @spec join(String.t(), map(), gallery_socket()) :: {:ok, join_response(), gallery_socket()}
  def join(@room, %{}, %{assigns: %{player_id: player_id}} = socket) do
    existing_players = PlayerCache.all()
    incoming_player = Player.new!(player_id)
    PlayerCache.insert(incoming_player)

    {:ok, %{players: existing_players, you: incoming_player}, socket}
  end

  @spec handle_in(String.t(), ready_payload(), gallery_socket()) :: {:noreply, gallery_socket()}
  def handle_in("ready", %{"id" => player_id}, %{assigns: %{player_id: player_id}} = socket) do
    player = PlayerCache.get(player_id)

    broadcast!(socket, "player_joined", %{"player" => player})
    {:noreply, socket}
  end

  @spec handle_in(String.t(), update_payload(), gallery_socket()) :: {:noreply, gallery_socket()}
  def handle_in(
        "update_position",
        %{"pos" => pos, "rot" => rot} = payload,
        %{assigns: %{player_id: player_id}} = socket
      ) do
    player = PlayerCache.get(player_id)
    updated_player = %{player | pos: pos, rot: rot}
    PlayerCache.insert(updated_player)

    broadcast!(socket, "player_updated", payload)
    {:noreply, socket}
  end

  @spec handle_in(String.t(), map(), gallery_socket()) :: {:noreply, gallery_socket()}
  def handle_in(event, payload, %{assigns: %{player_id: player_id}} = socket) do
    Logger.debug(
      "[GalleryChannel] Player #{player_id} sent to #{event} an unknown response: #{inspect(payload)}"
    )

    {:noreply, socket}
  end

  @spec handle_out(String.t(), map(), gallery_socket()) :: {:noreply, gallery_socket()}
  def handle_out("player_joined", %{"player" => player}, %{assigns: %{player_id: player_id}} = socket)
      when player.id == player_id do
    {:noreply, socket}
  end

  def handle_out("player_joined", payload, socket) do
    push(socket, "player_joined", payload)
    {:noreply, socket}
  end

  def handle_out("player_updated", %{"id" => id}, %{assigns: %{player_id: player_id}} = socket)
      when id == player_id do
    {:noreply, socket}
  end

  def handle_out("player_updated", payload, socket) do
    push(socket, "player_updated", payload)
    {:noreply, socket}
  end

  @spec terminate(any(), gallery_socket()) :: gallery_socket()
  def terminate(_reason, %{assigns: %{player_id: player_id}} = socket) do
    PlayerCache.remove(player_id)

    broadcast!(socket, "player_left", %{"id" => player_id})
    socket
  end
end
