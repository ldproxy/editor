# hello-world

The example of how to build the Theia-based applications with the hello-world.

## Getting started

Please install all necessary [prerequisites](https://github.com/eclipse-theia/theia/blob/master/doc/Developing.md#prerequisites).

## Running the browser example

    yarn install
    yarn prepare (in "empty")
    npm run build:browser
    yarn run startPlugin (in "browser-app")

_or:_

    npm run build:browser
    cd browser-app
    npm start

_or:_ launch `Start Browser Backend` configuration from VS code.

Open http://localhost:3000 in the browser.

## Running the Electron example

    npm run build:electron
    npm run start:electron

_or:_

    npm run build:electron
    cd electron-app
    npm start

_or:_ launch `Start Electron Backend` configuration from VS code.

## Developing with the browser example

Start watching all packages, including `browser-app`, of your application with

    npm run watch:browser

_or_ watch only specific packages with

    cd hello-world
    npm run watch

and the browser example.

    cd browser-app
    npm run watch

Run the example as [described above](#Running-the-browser-example)

## Developing with the Electron example

Start watching all packages, including `electron-app`, of your application with

    npm run watch:electron

_or_ watch only specific packages with

    cd hello-world
    npm run watch

and the Electron example.

    cd electron-app
    npm run watch

Run the example as [described above](#Running-the-Electron-example)

## Publishing hello-world

Create a npm user and login to the npm registry, [more on npm publishing](https://docs.npmjs.com/getting-started/publishing-npm-packages).

    npm login

Publish packages with lerna to update versions properly across local packages, [more on publishing with lerna](https://github.com/lerna/lerna#publish).

    npx lerna publish
