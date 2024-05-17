defmodule GalleryWeb.GalleryChannelTest do
  use GalleryWeb.ChannelCase

  alias Gallery.Player
  alias Gallery.PlayerCache
  alias GalleryWeb.GalleryChannel
  alias GalleryWeb.GallerySocket

  @id "1234"

  @timeout 500

  describe "GalleryChannel" do
    setup do
      # Create and populate ETS
      PlayerCache.create()

      player_a = Player.new!()
      player_b = Player.new!()

      PlayerCache.insert(player_a)
      PlayerCache.insert(player_b)

      {:ok, _, socket} = join()

      %{player_a: player_a, player_b: player_b, socket: socket}
    end

    test "supports joins", %{player_a: player_a, player_b: player_b} do
      {:ok, %{id: @id, players: players}, _socket} = join()

      assert Enum.sort_by(players, & &1.created_at, Time) == [player_a, player_b]
    end

    test "handles messages from players readying up", %{socket: socket} do
      push(socket, "ready", %{"id" => @id})

      Process.sleep(@timeout)

      expected_player = PlayerCache.get(@id)
      assert_broadcast "player_joined", %{"player" => ^expected_player}, @timeout
    end

    test "handles messages from moving players", %{socket: socket} do
      # Player must exist before they are updated
      PlayerCache.insert(Player.new!(@id))
      push(socket, "update_position", %{"id" => @id, "dx" => 1, "dy" => 1, "dz" => 1})

      assert_broadcast "player_moved", %{"id" => @id, "dx" => 1, "dy" => 1, "dz" => 1}, @timeout
    end

    test "handles unexpected messages from players", %{socket: socket} do
      push(socket, "spiked_manacles", %{})

      refute_broadcast "*", %{}, @timeout
    end

    test "handles players leaving", %{socket: socket} do
      # https://hexdocs.pm/phoenix/Phoenix.ChannelTest.html#module-leave-and-close
      Process.unlink(socket.channel_pid)
      leave(socket)

      assert_broadcast "player_left", %{"id" => @id}, @timeout
    end
  end

  def join() do
    GallerySocket
    |> socket("user:id", %{player_id: @id})
    |> subscribe_and_join(GalleryChannel, "gallery:main")
  end
end
