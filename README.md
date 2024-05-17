# Gallery

To start your Phoenix server:

  * Run `mix setup` to install and setup dependencies
  * Start Phoenix endpoint with `mix phx.server` or inside IEx with `iex -S mix phx.server`

Now you can visit [`localhost:4000`](http://localhost:4000) from your browser.

Ready to run in production? Please [check our deployment guides](https://hexdocs.pm/phoenix/deployment.html).

## Setup (OSX)

1. Install dependencies with [ASDF](https://asdf-vm.com/)

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

5. Setup ecto

```
mix ecto.setup
```

6. Setup node

```
cd assets
npm install
cd ..
```

7. Start server

```
mix phx.server
```

## Learn more

  * Official website: https://www.phoenixframework.org/
  * Guides: https://hexdocs.pm/phoenix/overview.html
  * Docs: https://hexdocs.pm/phoenix
  * Forum: https://elixirforum.com/c/phoenix-forum
  * Source: https://github.com/phoenixframework/phoenix
