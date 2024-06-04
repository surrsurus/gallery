defmodule GalleryWeb.GalleryChannel do
  @moduledoc """
  GalleryChannel - Receive and broadcast updates from players

  # Events

  ## Incoming Messages

  `join` - Joining this channel registers you in the player cache.
           If the join is successful, you'll be given the list of current players and your current player in the payload


  `ready` - Signal to the server that you have received the player data from joining. All other players are given your player payload
            to begin rendering you on their clients. Fires `player_joined` back to the clients.

  `update_position` - Signal to the server that you have changed your position and/or rotation. All other players are given your
                      updated player payload. Fires `player_moved` back to the client.


  ## Outgoing Messages

  `player_joined` - Fired when a new player joins the channel. You will not receive your `player_joined` events you trigger.

  `player_moved` - Fired when a player updates their position and/or rotation. You will not receive `player_moved` events you trigger.

  `player_left` - On disconnect, all players will be notified of your departure so you can stop being rendered on their clients.
  """
  use Phoenix.Channel

  alias Gallery.PlayerCache
  alias Gallery.Player

  require Logger

  intercept ["player_joined", "player_moved"]

  @room "gallery:main"

  @spec join(String.t(), map(), Phoenix.Socket.t()) ::
          {:ok, %{players: [Player.t()], you: Player.t()}, Phoenix.Socket.t()}
  def join(@room, %{}, %{assigns: %{player_id: player_id}} = socket) do
    existing_players = PlayerCache.all()
    incoming_player = Player.new!(player_id)
    PlayerCache.insert(incoming_player)

    {:ok, %{players: existing_players, you: incoming_player}, socket}
  end

  @spec handle_in(String.t(), %{required(:id) => String.t()}, Phoenix.Socket.t()) ::
          {:noreply, Phoenix.Socket.t()}
  def handle_in("ready", %{"id" => player_id}, %{assigns: %{player_id: player_id}} = socket) do
    player = PlayerCache.get(player_id)

    broadcast!(socket, "player_joined", %{"player" => player})
    {:noreply, socket}
  end

  @spec handle_in(
          String.t(),
          %{required(:pos) => map(), required(:rot) => map()},
          Phoenix.Socket.t()
        ) :: {:noreply, Phoenix.Socket.t()}
  def handle_in(
        "update_position",
        %{"pos" => pos, "rot" => rot} = payload,
        %{assigns: %{player_id: player_id}} = socket
      ) do
    player = PlayerCache.get(player_id)
    updated_player = %{player | pos: pos, rot: rot}
    PlayerCache.insert(updated_player)

    broadcast!(socket, "player_moved", payload)
    {:noreply, socket}
  end

  @spec handle_in(String.t(), map(), Phoenix.Socket.t()) :: {:noreply, Phoenix.Socket.t()}
  def handle_in(event, payload, %{assigns: %{player_id: player_id}} = socket) do
    Logger.debug(
      "[GalleryChannel] Player #{player_id} sent to #{event} an unknown response: #{inspect(payload)}"
    )

    {:noreply, socket}
  end

  def handle_out(
        "player_joined",
        %{"player" => player} = payload,
        %{assigns: %{player_id: player_id}} = socket
      )
      when player.id != player_id do
    push(socket, "player_joined", payload)
    {:noreply, socket}
  end

  def handle_out("player_joined", _payload, socket) do
    {:noreply, socket}
  end

  def handle_out(
        "player_moved",
        %{"id" => id} = payload,
        %{assigns: %{player_id: player_id}} = socket
      )
      when id != player_id do
    push(socket, "player_moved", payload)
    {:noreply, socket}
  end

  def handle_out("player_moved", _payload, socket) do
    {:noreply, socket}
  end

  @spec terminate(any(), Phoenix.Socket.t()) :: Phoenix.Socket.t()
  def terminate(_reason, %{assigns: %{player_id: player_id}} = socket) do
    PlayerCache.remove(player_id)

    broadcast!(socket, "player_left", %{"id" => player_id})
    socket
  end
end
