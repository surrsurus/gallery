# Gallery ![CI Status](https://github.com/surrsurus/gallery/actions/workflows/ci.yml/badge.svg) ![License](https://img.shields.io/github/license/surrsurus/gallery)

3D Multiplayer Demo with Phoenix Channels + Three.JS

https://github.com/surrsurus/gallery/assets/9388076/78b817d5-1c4d-45f0-8ed6-f3176d369467

## Concept

The goal of this project is to leverage Phoenix's ability to build highly concurrent realtime applications to create a scalable 3D multiplayer game that doesn't need much server hardware to run. 

Each player's web browser connects to a Phoenix channel via a websocket that will broadcast updates about the other players as they occur in realtime. A nice part about this is we'll know exactly when a player enters and leaves the game. 
In addition, each player's browser is also rendering those updates with Three.JS. These updates are processed every frame, resulting in a very low latency experience.

## Sequence

```mermaid
sequenceDiagram
    actor You
    You->>/gallery: Hit endpoint
    /gallery-)Browser: Initialize Three.JS Scene
    Browser-)Gallery Channel: Join channel
    activate Gallery Channel
    Gallery Channel->>Gallery Channel: Create Player
    Gallery Channel->>PlayerCache: Cache player
    activate PlayerCache
    PlayerCache-->>Gallery Channel: Retrieve all cached players
    deactivate PlayerCache
    Gallery Channel--)Browser: Send cached player data
    deactivate Gallery Channel
    Browser->>Browser: Register players, prepare canvas, start rendering
    Browser-)Gallery Channel: Ready up
    activate Gallery Channel
    Gallery Channel--)Browser: Broadcasts your player to everyone else
    deactivate Gallery Channel
    

    Note over /gallery,PlayerCache: Keydown Events
    Browser->>Browser: Handle keydown events
    Browser-)Gallery Channel: Update player
    activate Gallery Channel
    Gallery Channel->>PlayerCache: Update player
    Gallery Channel--)Browser: Broadcasts your player updates to everyone else
    deactivate Gallery Channel


    Note over /gallery,PlayerCache: Disconnect
    Browser-)Gallery Channel: Disconnect
    activate Gallery Channel
    Gallery Channel->>PlayerCache: Delete from cache
    Gallery Channel--)Browser: Broadcasts disconnect
    deactivate Gallery Channel
```

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

This project uses [ASDF](https://asdf-vm.com/) to manage Erlang, Elixir, and Node versions

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


## License

<img src="https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/i/7195e121-eded-45cf-9aab-909deebd81b2/d9ur2lg-28410b47-58fd-4a48-9b67-49c0f56c68ce.png/v1/fill/w_1035,h_772,q_70,strp/mit_license_logo_by_excaliburzero_d9ur2lg-pre.jpg" width="128"/>

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
