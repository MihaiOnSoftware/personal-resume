const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: {
    "faq/time": "./src/faq/time.js",
    "faq/weather": "./src/faq/weather.js",
    hamburger: "./src/hamburger.js",
  },
  plugins: [
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: "**/*.html",
	  context: "./src",
        },
        {
          from: "**/*.css",
	  context: "./src",
        },
      ],
    }),
  ],
  devtool: "inline-source-map",
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist"),
  },
};
