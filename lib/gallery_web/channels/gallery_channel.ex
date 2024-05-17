defmodule GalleryWeb.GalleryChannel do
  use Phoenix.Channel

  alias Gallery.PlayerCache

  @room "gallery:main"

  def join(@room, %{}, socket) do
    players = PlayerCache.all()

    {:ok, players, socket}
  end

  def handle_in("new_player", player, socket) do
    broadcast!(socket, "player_joined", player)
    {:noreply, socket}
  end

  def broadcast(event, payload) do
    GalleryWeb.Endpoint.broadcast(@room, event, payload)
  end
end
