defmodule GalleryWeb.GalleryLive do
  use GalleryWeb, :live_view

  require Logger

  alias Gallery.PlayerCache
  alias Gallery.Player
  alias GalleryWeb.GalleryChannel

  def mount(_params, _session, socket) do
    socket =
      if connected?(socket) do
        player = Player.new!()

        PlayerCache.insert(player)
        GalleryChannel.broadcast("player_joined", %{player: player})

        socket
        |> assign(player: player)
        |> push_event("start_scene", %{})
      else
        socket
      end

    {:ok, socket}
  end

  def terminate(_reason, %{assigns: %{player: player}} = socket) do
    PlayerCache.remove(player)
    GalleryChannel.broadcast("player_left", %{player: player})

    socket
  end

  def handle_event("canvas_keydown", %{"key" => "w"}, %{assigns: %{player: player}} = socket) do
    player = %{player | y: player.y + 1}
    PlayerCache.insert(player)
    GalleryChannel.broadcast("player_moved", %{player: player})

    {:noreply, assign(socket, player: player)}
  end

  def handle_event("canvas_keydown", %{"key" => "a"}, %{assigns: %{player: player}} = socket) do
    player = %{player | x: player.x - 1}
    PlayerCache.insert(player)
    GalleryChannel.broadcast("player_moved", %{player: player})

    {:noreply, assign(socket, player: player)}
  end

  def handle_event("canvas_keydown", %{"key" => "s"}, %{assigns: %{player: player}} = socket) do
    player = %{player | y: player.y - 1}
    PlayerCache.insert(player)
    GalleryChannel.broadcast("player_moved", %{player: player})

    {:noreply, assign(socket, player: player)}
  end

  def handle_event("canvas_keydown", %{"key" => "d"}, %{assigns: %{player: player}} = socket) do
    player = %{player | x: player.x + 1}
    PlayerCache.insert(player)
    GalleryChannel.broadcast("player_moved", %{player: player})

    {:noreply, assign(socket, player: player)}
  end

  def handle_event("canvas_keydown", %{"key" => key}, socket) do
    Logger.debug("[GalleryLive] Got key #{key}")

    {:noreply, socket}
  end
end
