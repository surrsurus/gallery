defmodule Gallery.Player do
  @moduledoc """
  Player - A representation of the player as a typed embedded schema

  ## Why?

  It's probably fine that we just use maps for players, since that's what structs are under the hood anyway.
  The advantage of using a `typed_schema` is that we get to leverage ecto changesets to do a lot of heavy lifting to
  cast and validate the player data that will be coming from the frontend. We also don't need a repo to use ecto.
  """
  use TypedEctoSchema
  import Ecto.Changeset

  @primary_key false
  @derive {Jason.Encoder, only: [:id, :color, :x, :y, :z]}
  typed_schema "player" do
    field :id, :string
    field :color, :string
    field :x, :float
    field :y, :float
    field :z, :float
    timestamps(inserted_at: :created_at, updated_at: false, type: :naive_datetime_usec)
  end

  def new!(), do: new!(Ecto.UUID.generate())

  def new!(id) do
    changeset(%{
      id: id,
      color: RandomColor.hex(),
      x: 0.0,
      y: 0.0,
      z: 0.0,
      created_at: DateTime.utc_now()
    })
    |> apply_action!(:new)
  end

  def changeset(player \\ %__MODULE__{}, params) do
    cast(player, params, [:id, :color, :x, :y, :z, :created_at])
  end
end
