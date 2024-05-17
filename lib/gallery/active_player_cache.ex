defmodule Gallery.ActivePlayerCache do
  @cache :active_players

  def create(), do: :ets.new(@cache, [:public, :named_table])

  def add(player), do: :ets.insert(@cache, {player.id, player})

  def remove(player), do: :ets.delete(@cache, player.id)

  def all(), do: :ets.tab2list(@cache)
end
