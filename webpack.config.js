const path = require("path");
const fs = require("fs");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

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

// Plugin to generate commit history for chatbot knowledge base using GitHub API
class CommitHistoryPlugin {
  apply(compiler) {
    compiler.hooks.afterEmit.tapAsync('CommitHistoryPlugin', async (compilation, callback) => {
      try {
        const repoInfo = await this.fetchGitHubCommitHistory();

        // Write to the dist folder
        const historyPath = path.join(compiler.options.output.path, 'commit-history.json');
        fs.writeFileSync(historyPath, JSON.stringify(repoInfo, null, 2));
        console.log(`✅ Commit history generated successfully (${repoInfo.commit_history.length} commits)`);
        callback();
      } catch (error) {
        console.warn('Could not generate commit history:', error.message);
        callback();
      }
    });
  }

  async fetchGitHubCommitHistory() {
    const owner = process.env.GITHUB_OWNER || 'MihaiOnSoftware';
    const repo = process.env.GITHUB_REPO || 'personal-resume';
    const token = process.env.GITHUB_TOKEN;

    if (!token) {
      throw new Error('GITHUB_TOKEN environment variable is required');
    }

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'personal-resume-build'
    };

    // Fetch repository info
    const repoResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
    if (!repoResponse.ok) {
      throw new Error(`Failed to fetch repository info: ${repoResponse.status}`);
    }
    const repoData = await repoResponse.json();

    // Fetch commits (last 100)
    const commitsResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=100`, { headers });
    if (!commitsResponse.ok) {
      throw new Error(`Failed to fetch commits: ${commitsResponse.status}`);
    }
    const commits = await commitsResponse.json();

    // Fetch branches
    const branchesResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/branches`, { headers });
    if (!branchesResponse.ok) {
      throw new Error(`Failed to fetch branches: ${branchesResponse.status}`);
    }
    const branches = await branchesResponse.json();

    // Format the data
    const formattedCommits = commits.slice(0, 20).map(commit => {
      const date = new Date(commit.commit.author.date).toISOString().split('T')[0];
      const author = commit.commit.author.name;
      const message = commit.commit.message.split('\n')[0]; // First line only
      const sha = commit.sha.substring(0, 7);
      return `${sha} - ${author}, ${date} : ${message}`;
    });

    return {
      repository_stats: {
        total_commits: commits.length, // Note: This is limited to the API response
        first_commit: commits.length > 0 ? `${commits[commits.length - 1].sha.substring(0, 7)} - ${commits[commits.length - 1].commit.message.split('\n')[0]}` : 'Unknown',
        latest_commit: commits.length > 0 ? `${commits[0].sha.substring(0, 7)} - ${commits[0].commit.message.split('\n')[0]}` : 'Unknown',
        branches: branches.map(branch => branch.name),
        created_at: repoData.created_at,
        updated_at: repoData.updated_at
      },
      commit_history: formattedCommits
    };
  }
}

module.exports = {
  entry: {
    hamburger: "./src/hamburger.js",
    navigation: "./src/navigation.js",
    chatbot: ["./src/chatbot.js", "./src/chatbot-ui.js", "./src/chatbot-init.js"],
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
};
