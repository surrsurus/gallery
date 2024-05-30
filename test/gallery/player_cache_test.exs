defmodule Gallery.PlayerCacheTest do
  use ExUnit.Case

  alias Gallery.PlayerCache
  alias Gallery.Player

  describe "Before the application starts" do
    test "PlayerCache can be created" do
      assert PlayerCache.create() == :active_players
    end
  end

  describe "PlayerCache" do
    setup do
      PlayerCache.create()

      %{player: Player.new!()}
    end

    test "can have entries inserted", %{player: player} do
      assert PlayerCache.insert(player) == true
      assert PlayerCache.get(player.id) == player
    end

    test "can have inserted entries updated", %{player: player} do
      assert PlayerCache.insert(player) == true
      assert PlayerCache.get(player.id) == player

      # Player moves
      new_player = %{player | pos: %{x: 1, y: 0, z: 0}}

      assert PlayerCache.insert(new_player) == true
      assert PlayerCache.get(player.id) == new_player
    end

    test "can have inserted entries removed", %{player: player} do
      assert PlayerCache.insert(player) == true
      assert PlayerCache.get(player.id) == player

      # Player leaves
      assert PlayerCache.remove(player.id) == true
      assert PlayerCache.get(player.id) == nil
    end

    test "can have all entries retrieved", %{player: player} do
      player_two = Player.new!()

      assert PlayerCache.insert(player) == true
      assert PlayerCache.insert(player_two) == true
      assert Enum.sort_by(PlayerCache.all(), & &1.created_at, Time) == [player, player_two]
    end
  end
end
