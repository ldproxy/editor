# ldproxy Editor

A [VS Code](https://code.visualstudio.com) extension that supports you in creating and updating [ldproxy](https://docs.ldproxy.net) configurations.

## Current state

A preview version (`v0.9.0`) is available.

### Distribution

Currently the only way to use the extension is the provided docker image that contains an open source version of VS Code for the Web.

### Features

Currently the extension only has a single feature, the command `Create new entities`. It provides a graphical wizard to automatically generate provider and service configurations from data sources.

## Outlook

- `v1.0.0` IntelliSense support for YAML configuration files (autocompletion, syntax checks, documentation tooltips)
- `v1.1.0` general availability of the extension for VS Code Desktop (macOS, Windows, Linux)

## Installation

The docker image is available at `ghcr.io/ldproxy/editor`. It expects the workspace to be mounted at `/data`. The application runs on port `80`.

To start the editor with your ldproxy configuration directory in `/home/user/ldproxycfg` and access it at `http://localhost:8080`:

```sh
docker run -d -p 8080:80 -v /home/user/ldproxycfg:/data ghcr.io/ldproxy/editor
```

## Usage

When you open the application at `http://localhost:8080` in the browser, you will see the mounted ldproxy configuration directory on the left. You can now start to edit your files.

For general help, check the documentation for [VS Code](https://code.visualstudio.com/docs).

### Creating new entities

When you open the [command palette](https://code.visualstudio.com/docs/getstarted/userinterface#_command-palette) and start typing `ldproxy`, the command `ldproxy: Create new entities` should appear at the top. Upon selecting, the graphical wizard will open in a new tab.

It allows you to automatically generate provider and service configurations from _PostgreSQL/PostGIS_, _GeoPackage_ and _WFS_ data sources.

> [!NOTE]
> When trying to access a _PostgreSQL_ database on the same host where the docker container is runnning, you have to use `host.docker.internal` instead of `localhost`.

![](screenshot.png)
