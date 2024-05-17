defmodule Gallery.Player do
  use TypedEctoSchema

  @primary_key false
  @derive {Jason.Encoder, only: [:id, :color, :x, :y, :z]}
  typed_schema "player" do
    field :id, :string
    field :color, :string
    field :x, :float
    field :y, :float
    field :z, :float
    timestamps(type: :naive_datetime_usec)
  end

  def new() do
    %__MODULE__{id: Ecto.UUID.generate(), color: RandomColor.hex(), x: 0.0, y: 0.0, z: 0.0}
  end
end
