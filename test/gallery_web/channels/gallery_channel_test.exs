defmodule GalleryWeb.GalleryChannelTest do
  use GalleryWeb.ChannelCase

  alias Gallery.Player
  alias Gallery.PlayerCache
  alias GalleryWeb.GalleryChannel
  alias GalleryWeb.GallerySocket

  @id "1234"

  describe "GalleryChannel" do
    setup do
      # Create and populate ETS
      PlayerCache.create()
      player = Player.new!(@id)
      PlayerCache.insert(player)

      {:ok, _, socket} = join()

      %{player: player, socket: socket}
    end

    test "supports joins", %{player: player} do
      assert {:ok, %{id: @id, players: players}, _socket} = join()

      eventually assert Enum.sort_by(players, & &1.created_at, Time) == [player]
    end

    test "prepares the cache when players ready up", %{player: player, socket: socket} do
      # As to not affect the test beforehand
      PlayerCache.remove(@id)
      assert PlayerCache.get(@id) == nil

      push(socket, "ready", %{"id" => @id})

      eventually assert PlayerCache.get(@id)
      assert_broadcast "player_joined", %{"player" => ready_player}
      assert ready_player.id == player.id
    end

    test "updates the cache and broadcasts updates on request", %{socket: socket} do
      push(socket, "update_position", %{
        "id" => @id,
        "pos" => %{"x" => 0, "y" => 0, "z" => 0},
        "rot" => %{"x" => 0, "y" => 0, "z" => 0}
      })

      assert_broadcast "player_moved", %{
        "id" => @id,
        "pos" => %{"x" => 0, "y" => 0, "z" => 0},
        "rot" => %{"x" => 0, "y" => 0, "z" => 0}
      }
    end

    test "handles unexpected messages from players", %{socket: socket} do
      push(socket, "spiked_manacles", %{})

      refute_broadcast "*", %{}
    end

    test "cleans up the cache and broadcasts an exit message when players leave", %{
      socket: socket
    } do
      Process.unlink(socket.channel_pid)
      leave(socket)

      eventually assert PlayerCache.get(@id) == nil
      assert_broadcast "player_left", %{"id" => @id}
    end

    test "cleans up the cache and broadcasts an exit message when players close the connection",
         %{socket: socket} do
      Process.unlink(socket.channel_pid)
      close(socket)

      eventually assert PlayerCache.get(@id) == nil
      assert_broadcast "player_left", %{"id" => @id}
    end
  end

  def join() do
    GallerySocket
    |> socket("user:id", %{player_id: @id})
    |> subscribe_and_join(GalleryChannel, "gallery:main")
  end
end
