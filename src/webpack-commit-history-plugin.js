const fs = require('fs');
const path = require('path');

// Plugin to generate commit history for chatbot knowledge base using GitHub API
class CommitHistoryPlugin {
    apply(compiler) {
        compiler.hooks.afterEmit.tapAsync('CommitHistoryPlugin', async (compilation, callback) => {
            try {
                const repoInfo = await this.fetchGitHubCommitHistory();
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
            'User-Agent': 'personal-resume-build',
        };

        const [repoData, commits, branches] = await Promise.all([
            this.fetchGitHubData(`https://api.github.com/repos/${owner}/${repo}`, headers),
            this.fetchGitHubData(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=100`, headers),
            this.fetchGitHubData(`https://api.github.com/repos/${owner}/${repo}/branches`, headers),
        ]);

        const formattedCommits = commits.slice(0, 20).map(this.formatCommit);

        return {
            repository_stats: {
                total_commits: commits.length,
                first_commit: this.formatCommitSummary(commits[commits.length - 1]),
                latest_commit: this.formatCommitSummary(commits[0]),
                branches: branches.map(branch => branch.name),
                created_at: repoData.created_at,
                updated_at: repoData.updated_at,
            },
            commit_history: formattedCommits,
        };
    }

    async fetchGitHubData(url, headers) {
        const response = await fetch(url, { headers });
        if (!response.ok) {
            throw new Error(`GitHub API request failed: ${response.status} for ${url}`);
        }
        return response.json();
    }

    formatCommit(commit) {
        const date = new Date(commit.commit.author.date).toISOString().split('T')[0];
        const author = commit.commit.author.name;
        const message = commit.commit.message.split('\n')[0];
        const sha = commit.sha.substring(0, 7);
        return `${sha} - ${author}, ${date} : ${message}`;
    }

    formatCommitSummary(commit) {
        if (!commit) return 'Unknown';
        const sha = commit.sha.substring(0, 7);
        const message = commit.commit.message.split('\n')[0];
        return `${sha} - ${message}`;
    }
}

module.exports = CommitHistoryPlugin; 