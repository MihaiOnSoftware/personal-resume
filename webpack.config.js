const path = require("path");
const fs = require("fs");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const CommitHistoryPlugin = require("./src/webpack-commit-history-plugin");

// Plugin to generate an index of all content files (HTML and Markdown)
class ContentIndexPlugin {
  apply(compiler) {
    compiler.hooks.afterEmit.tap('ContentIndexPlugin', (compilation) => {
      const contentFiles = [];

      // Find all HTML and markdown files in the output
      for (const filename of Object.keys(compilation.assets)) {
        if (filename.endsWith('.html') || filename.endsWith('.md')) {
          contentFiles.push(filename);
        }
      }

      // Write the list to a JSON file (keeping the same name for compatibility)
      const indexPath = path.join(compiler.options.output.path, 'html-files-index.json');
      fs.writeFileSync(indexPath, JSON.stringify(contentFiles, null, 2));
    });
  }
}



module.exports = {
  mode: 'production',
  entry: {
    hamburger: "./src/hamburger.js",
    navigation: "./src/navigation.js",
    "chatbot/chatbot": ["./src/chatbot/chatbot.js", "./src/chatbot/chatbot-ui.js", "./src/chatbot/chatbot-init.js"],
    "faq/time": "./src/faq/time.js",
    "faq/weather": "./src/faq/weather.js",
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
        {
          from: "chatbot-knowledge-base.json",
          context: "./assets",
        },
        {
          from: "2024-2025-work-summary.md",
          context: "./assets",
        },
        {
          from: "*.ico",
          context: "./assets",
          noErrorOnMissing: true,
        },
        {
          from: "*.png",
          context: "./assets",
          noErrorOnMissing: true,
        },
      ],
    }),
    new ContentIndexPlugin(),
    new CommitHistoryPlugin(),
  ],
  devtool: "inline-source-map",
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist"),
  },
  performance: {
    hints: 'warning',
    maxAssetSize: 2000000, // 2MB in bytes
    maxEntrypointSize: 2000000, // 2MB in bytes
  },
};
