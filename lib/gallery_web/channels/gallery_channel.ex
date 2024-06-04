defmodule GalleryWeb.GalleryChannel do
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
