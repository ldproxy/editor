/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

//@ts-check
"use strict";

//@ts-check
/** @typedef {import('webpack').Configuration} WebpackConfig **/

const path = require("path");
const webpack = require("webpack");
const CopyPlugin = require("copy-webpack-plugin");

/** @type (env:any,argv:any) => WebpackConfig */
const nativeExtensionConfig = (env, argv) => {
  const out = argv.mode === "development" ? "../dist/dev" : "../dist/native";

  return {
    target: "node",
    node: {
      __dirname: false, // required for native node addons
    },
    //stats: "verbose",
    entry: {
      extension: "./index.ts", // source of the web extension main file
      //'test/suite/index': './src/web/test/suite/index.ts', // source of the web extension test runner
    },
    output: {
      filename: `[name].js`,
      path: path.join(__dirname, out),
      libraryTarget: "commonjs",
      devtoolModuleFilenameTemplate: "../[resource-path]",
    },
    resolve: {
      mainFields: ["module", "main"], // look for `browser` entry point in imported node modules
      extensions: [".ts", ".js"], // support ts-files and js-files
      alias: {
        // provides alternate implementation for node module and source files
      },
      fallback: {
        // Webpack 5 no longer polyfills Node.js core modules automatically.
        // see https://webpack.js.org/configuration/resolve/#resolvefallback
        // for the list of Node.js core module polyfills.
        assert: require.resolve("assert"),
        path: require.resolve("path-browserify"),
      },
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          exclude: /node_modules/,
          use: [
            {
              loader: "ts-loader",
            },
          ],
        },
      ],
    },
    plugins: [
      new webpack.optimize.LimitChunkCountPlugin({
        maxChunks: 1, // disable chunks by default since web extensions must be a single bundle
      }),
      new webpack.ProvidePlugin({
        process: "process", // provide a shim for the global `process` variable
      }),
      new CopyPlugin({
        patterns: [
          {
            context: "../node_modules/@xtracfg/native",
            from: "prebuilds/**/*.node",
            to: "./",
          },
        ],
      }),
    ],
    externals: {
      vscode: "commonjs vscode", // ignored because it doesn't exist
    },
    performance: {
      hints: false,
    },
    devtool: "nosources-source-map", // create a source map that points to the original source file
    infrastructureLogging: {
      level: "log", // enables logging required for problem matchers
    },
  };
};

module.exports = nativeExtensionConfig;
