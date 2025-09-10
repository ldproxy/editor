# ldproxy for VS Code

A [VS Code](https://code.visualstudio.com) extension that supports you in creating and editing [ldproxy](https://docs.ldproxy.net) configurations.

## Features

- Command `Create new entities`: provides a graphical wizard to automatically generate provider and service configurations from data sources.
- Command `Create new values`: provides a graphical wizard to automatically generate value configurations, currently only MapLibre styles.
- IntelliSense: shows available properties in YAML configuration files.
- Syntax checks: detects unknown or deprecated properties in YAML configuration files.
- Tooltips: shows documentation for properties in YAML configuration files.

## Limitations

- The extension is not yet available for Windows, only MacOS and Linux are supported for now.
- The workspace root needs to be a ldproxy store directory for the extension to work properly. Parent directories that contain multiple store directories are not yet supported, and neither are multi-root workspaces.
- Tile Providers cannot be generated yet.

## Usage

Open a ldproxy store directory in VS Code, for example by using `File -> Open Folder` or by calling `code` in a terminal. You can then start editing your files.
Unknown or deprecated properties will automatically be marked in open files. Hovering over a property will show the documentation.

### IntelliSense (autocompletion)

To get a list of all available properties in a certain place in a YAML configuration file, you can press `Ctrl+Space`. (It is called `Trigger suggest` in the [command palette](https://code.visualstudio.com/docs/getstarted/userinterface#_command-palette), which also shows the configured hotkey.)
You can then use the cursor keys to navigate the suggestions and choose one with `Enter`. You might also start typing before or after triggering to narrow the suggestions.

![](https://github.com/ldproxy/editor/raw/HEAD/screenshot2.png)

### Creating new entities

When you open the [command palette](https://code.visualstudio.com/docs/getstarted/userinterface#_command-palette) and start typing `ldproxy`, the command `ldproxy: Create new entities` should appear at the top. Upon selecting, the graphical wizard will open in a new tab.

It allows you to automatically generate provider and service configurations from _PostgreSQL/PostGIS_, _GeoPackage_ and _WFS_ data sources.

![](https://github.com/ldproxy/editor/raw/HEAD/screenshot.png)

### Creating new values

When you open the [command palette](https://code.visualstudio.com/docs/getstarted/userinterface#_command-palette) and start typing `ldproxy`, the command `ldproxy: Create new values` should appear near the top. Upon selecting, the graphical wizard will open in a new tab.

It currently only allows you to automatically generate a MapLibre style from a service configuration.

![](https://github.com/ldproxy/editor/raw/HEAD/screenshot3.png)
