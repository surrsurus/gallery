# Gallery ![CI Status](https://github.com/surrsurus/gallery/actions/workflows/ci.yml/badge.svg)

3D Multiplayer Demo with Phoenix Channels + Three.JS

https://github.com/surrsurus/gallery/assets/9388076/c42988be-5b59-474e-b255-e648d531d130

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

This project uses [ASDF](https://asdf-vm.com/) to manage dependencies

### Installing

#### OSX

Postgres isn't being used (yet) so feel free to skip those steps.

1. Add and install plugins with ASDF

```
asdf plugin add erlang https://github.com/asdf-vm/asdf-erlang.git
asdf plugin add elixir https://github.com/asdf-vm/asdf-elixir.git
asdf plugin add nodejs https://github.com/asdf-vm/asdf-nodejs.git
asdf install
```

2. Install postgres

```
brew install postgresql@15
brew services restart postgresql@15  
```

3. Install psql

```
brew install libpq
echo 'export PATH="/opt/homebrew/opt/libpq/bin:$PATH"' >> ~/.zshrc
```

4. Setup postgres user

```
$ psql postgres
postgres=# CREATE USER postgres SUPERUSER;
# DB might already exist, if so, you're good
postgres=# CREATE DATABASE postgres WITH OWNER postgres;
```

### Running

To start your Phoenix server:

  * Run `mix setup` to install and setup dependencies
  * Start Phoenix endpoint with `mix phx.server` or inside IEx with `iex -S mix phx.server`

Now you can visit [`localhost:4000/gallery`](http://localhost:4000/gallery) from your browser.

## Learn more

  * Official website: https://www.phoenixframework.org/
  * Guides: https://hexdocs.pm/phoenix/overview.html
  * Docs: https://hexdocs.pm/phoenix
  * Forum: https://elixirforum.com/c/phoenix-forum
  * Source: https://github.com/phoenixframework/phoenix
