defmodule GalleryWeb.ChannelCase do
  use ExUnit.CaseTemplate

  using do
    quote do
      # Import conveniences for testing with channels
      import Phoenix.ChannelTest
      import GalleryWeb.ChannelCase

      # The default endpoint for testing
      @endpoint GalleryWeb.Endpoint
    end
  end

  setup _tags do
    :ok
  end
end
