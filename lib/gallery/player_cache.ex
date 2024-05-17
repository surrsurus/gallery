defmodule Gallery.PlayerCache do
  @moduledoc """
  PlayerCache - An ETS table that stores all of the currently active players

  ## Why?

  We want to be able to support a lot of players coming, going, and interacting as they please
  and we need a good way to not only store but update data as players move around. On top of this,
  we'll need to constantly be querying the whole thing all the time as players join so others
  can be rendered.

  An ETS is pretty good for this because it sits in memory, and fetching stuff from memory is a lot
  faster than fetching it from a database. The problem is that data won't be persisted but we don't care.

  We can insert players into the ETS like a dictionary and key them with their ID, then just overwrite that value
  whenever they update.
  """
  @cache :active_players

  def create(), do: :ets.new(@cache, [:public, :named_table])

  def insert(player), do: :ets.insert(@cache, {player.id, player})

  def get(id) do
    case :ets.lookup(@cache, id) do
      [{_id, player}] -> player
      [] -> nil
    end
  end

  def remove(id), do: :ets.delete(@cache, id)

  def all(), do: :ets.tab2list(@cache) |> Enum.map(fn tuple -> elem(tuple, 1) end)
end
