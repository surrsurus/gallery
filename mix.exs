defmodule Gallery.MixProject do
  use Mix.Project

  def project do
    [
      app: :gallery,
      version: "0.1.0",
      elixir: "~> 1.14",
      elixirc_paths: elixirc_paths(Mix.env()),
      start_permanent: Mix.env() == :prod,
      aliases: aliases(),
      deps: deps(),
      test_coverage: [
        ignore_modules: [
          Gallery.Application,
          Gallery.DataCase,
          Gallery.Repo,
          GalleryWeb.CoreComponents,
          GalleryWeb.Layouts,
          GalleryWeb.Router,
          GalleryWeb.Telemetry,
          ~r/.+HTML$/
        ]
      ]
    ]
  end

  # Configuration for the OTP application.
  #
  # Type `mix help compile.app` for more information.
  def application do
    [
      mod: {Gallery.Application, []},
      extra_applications: [:logger, :runtime_tools]
    ]
  end

  # Specifies which paths to compile per environment.
  defp elixirc_paths(:test), do: ["lib", "test/support"]
  defp elixirc_paths(_), do: ["lib"]

  # Specifies your project dependencies.
  #
  # Type `mix help deps` for examples and options.
  defp deps do
    [
      {:assert_eventually, "~> 1.0.0", only: [:dev, :test]},
      {:bandit, "~> 1.2"},
      {:dns_cluster, "~> 0.1.1"},
      {:ecto_sql, "~> 3.10"},
      {:esbuild, "~> 0.8", runtime: Mix.env() == :dev},
      {:finch, "~> 0.13"},
      {:floki, ">= 0.30.0", only: :test},
      {:gettext, "~> 0.20"},
      {:heroicons,
       github: "tailwindlabs/heroicons",
       tag: "v2.1.1",
       sparse: "optimized",
       app: false,
       compile: false,
       depth: 1},
      {:jason, "~> 1.2"},
      {:phoenix_ecto, "~> 4.4"},
      {:phoenix_html, "~> 4.0"},
      {:phoenix_live_dashboard, "~> 0.8.3"},
      {:phoenix_live_reload, "~> 1.2", only: :dev},
      {:phoenix_live_view, "~> 0.20.2"},
      {:phoenix, "~> 1.7.12"},
      {:postgrex, ">= 0.0.0"},
      {:random_color, "~> 0.1.0"},
      {:tailwind, "~> 0.2", runtime: Mix.env() == :dev},
      {:telemetry_metrics, "~> 1.0"},
      {:telemetry_poller, "~> 1.0"},
      {:typed_ecto_schema, "~> 0.4.1", runtime: false}
    ]
  end

  # Aliases are shortcuts or tasks specific to the current project.
  # For example, to install project dependencies and perform other setup tasks, run:
  #
  #     $ mix setup
  #
  # See the documentation for `Mix` for more info on aliases.
  defp aliases do
    [
      setup: ["deps.get", "ecto.setup", "npm.install", "assets.setup", "assets.build"],
      "ecto.setup": ["ecto.create", "ecto.migrate", "run priv/repo/seeds.exs"],
      "ecto.reset": ["ecto.drop", "ecto.setup"],
      test: ["ecto.create --quiet", "ecto.migrate --quiet", "test"],
      "test.cover": [
        "ecto.create --quiet",
        "ecto.migrate --quiet",
        "test --cover --export-coverage default",
        "test.coverage"
      ],
      "assets.setup": ["tailwind.install --if-missing", "esbuild.install --if-missing"],
      "assets.build": ["tailwind gallery", "esbuild gallery"],
      "assets.deploy": [
        "tailwind gallery --minify",
        "esbuild gallery --minify",
        "phx.digest"
      ],
      "npm.install": ["cmd cd assets && npm install"]
    ]
  end

  def cli do
    [preferred_envs: ["test.cover": :test]]
  end
end
