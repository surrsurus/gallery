defmodule GalleryWeb.GalleryLive do
  use GalleryWeb, :live_view

  require Logger

  def mount(_params, _session, socket) do
    socket =
      if connected?(socket) do
        push_event(socket, "start_scene", %{})
      else
        socket
      end

    {:ok, socket}
  end
end
