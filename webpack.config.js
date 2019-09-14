const path = require("path");

module.exports = {
  entry: "./src/faq/time.js",
  output: {
    filename: "faq/time.js",
    path: path.resolve(__dirname, "dist"),
  },
};
