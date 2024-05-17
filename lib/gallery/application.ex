defmodule Gallery.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  @impl true
  def start(_type, _args) do
    Gallery.ActivePlayerCache.create()

    children = [
      GalleryWeb.Telemetry,
      Gallery.Repo,
      {DNSCluster, query: Application.get_env(:gallery, :dns_cluster_query) || :ignore},
      {Phoenix.PubSub, name: Gallery.PubSub},
      # Start the Finch HTTP client for sending emails
      {Finch, name: Gallery.Finch},
      # Start a worker by calling: Gallery.Worker.start_link(arg)
      # {Gallery.Worker, arg},
      # Start to serve requests, typically the last entry
      GalleryWeb.Endpoint
    ]

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: Gallery.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  @impl true
  def config_change(changed, _new, removed) do
    GalleryWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
