defmodule GalleryWeb.GalleryChannel do
  use Phoenix.Channel

  alias Gallery.PlayerCache
  alias Gallery.Player

  require Logger

  @room "gallery:main"

  def join(@room, %{}, %{assigns: %{player_id: player_id}} = socket) do
    {:ok, %{players: PlayerCache.all(), id: player_id}, socket}
  end

  def handle_in("ready", %{"id" => player_id}, %{assigns: %{player_id: player_id}} = socket) do
    incoming_player = Player.new!(player_id)
    PlayerCache.insert(incoming_player)

    broadcast!(socket, "player_joined", %{"player" => incoming_player})
    {:noreply, socket}
  end

  def handle_in(
        "update_position",
        %{"x" => dx, "y" => dy, "z" => dz, "rot" => rot} = payload,
        %{assigns: %{player_id: player_id}} = socket
      ) do
    player = PlayerCache.get(player_id)
    updated_player = %{player | x: dx, y: dy, z: dz, rot: rot}
    PlayerCache.insert(updated_player)

    broadcast!(socket, "player_moved", payload)
    {:noreply, socket}
  end

  def handle_in(event, payload, %{assigns: %{player_id: player_id}} = socket) do
    Logger.debug(
      "[GalleryChannel] Player #{player_id} sent to #{event} an unknown response: #{inspect(payload)}"
    )

    {:noreply, socket}
  end

  def terminate(_reason, %{assigns: %{player_id: player_id}} = socket) do
    PlayerCache.remove(player_id)

    broadcast!(socket, "player_left", %{"id" => player_id})
    socket
  end
end
