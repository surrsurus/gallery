defmodule GalleryWeb.GallerySocket do
  use Phoenix.Socket

  channel "gallery:*", GalleryWeb.GalleryChannel

  # Socket params are passed from the client and can
  # be used to verify and authenticate a user. After
  # verification, you can put default assigns into
  # the socket that will be set for all channels, ie
  #
  #     {:ok, assign(socket, :user_id, verified_user_id)}
  #
  # To deny connection, return `:error` or `{:error, term}`. To control the
  # response the client receives in that case, [define an error handler in the
  # websocket
  # configuration](https://hexdocs.pm/phoenix/Phoenix.Endpoint.html#socket/3-websocket-configuration).
  #
  # See `Phoenix.Token` documentation for examples in
  # performing token verification on connect.
  @impl true
  @spec connect(any(), Phoenix.Socket.t(), any()) :: {:ok, Phoenix.Socket.t()}
  def connect(_params, socket, _connect_info) do
    # TODO: We could have persistent player profiles if we saved the player ID to a session cookie
    # the JS could just send the ID back to us and we'd pull the player's data from postgres via ecto
    {:ok, assign(socket, :player_id, Ecto.UUID.generate())}
  end

  # Socket IDs are topics that allow you to identify all sockets for a given user:
  #
  #     def id(socket), do: "user_socket:#{socket.assigns.user_id}"
  #
  # Would allow you to broadcast a "disconnect" event and terminate
  # all active sockets and channels for a given user:
  #
  #     Elixir.GalleryWeb.Endpoint.broadcast("user_socket:#{user.id}", "disconnect", %{})
  #
  # Returning `nil` makes this socket anonymous.
  @impl true
  @spec id(any()) :: nil
  def id(_socket), do: nil
end
