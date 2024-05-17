defmodule GalleryWeb.GalleryLive do
  @moduledoc """
  The entrypoint to the gallery

  This just sends out an event to cause the browser to attach the three JS canvas to the web page.
  This could have been a controller or something but I prefer the hook syntax, just because I dislike hiding
  script tags in the heex. This makes it more clear what's happening as you look through the JS.
  """
  use GalleryWeb, :live_view

  require Logger

  def mount(_params, _session, socket) do
    if connected?(socket) do
      {:ok, push_event(socket, "start_scene", %{})}
    else
      {:ok, socket}
    end
  end
end
