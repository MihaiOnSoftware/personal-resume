const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: {
    "faq/time": "./src/faq/time.js",
  },
  plugins: [
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin(
      [
        {
          from: "**/*.html",
        },
        {
          from: "**/*.css",
        },
      ],
      { context: "./src" }
    ),
  ],
  output: {
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, "dist"),
  },
};
