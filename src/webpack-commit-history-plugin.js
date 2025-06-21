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

        const commitLimit = parseInt(process.env.GITHUB_COMMIT_LIMIT || '20', 10);

        const [repoData, allCommits, branches] = await Promise.all([
            this.fetchGitHubData(`https://api.github.com/repos/${owner}/${repo}`, headers),
            this.fetchAllCommits(owner, repo, headers, commitLimit),
            this.fetchGitHubData(`https://api.github.com/repos/${owner}/${repo}/branches`, headers),
        ]);

        const formattedCommits = allCommits.map(this.formatCommit);

        return {
            repository_stats: {
                total_commits: allCommits.length,
                first_commit: this.formatCommitSummary(allCommits[allCommits.length - 1]),
                latest_commit: this.formatCommitSummary(allCommits[0]),
                branches: branches.map(branch => branch.name),
                created_at: repoData.created_at,
                updated_at: repoData.updated_at,
            },
            commit_history: formattedCommits,
        };
    }

    async fetchAllCommits(owner, repo, headers, limit) {
        const allCommits = [];
        let page = 1;

        while (allCommits.length < limit) {
            const commits = await this.fetchCommitsPage(owner, repo, headers, page);

            if (this.isLastPage(commits)) {
                allCommits.push(...commits);
                break;
            }

            allCommits.push(...commits);
            page++;
        }

        return allCommits.slice(0, limit);
    }

    async fetchCommitsPage(owner, repo, headers, page) {
        return this.fetchGitHubData(
            `https://api.github.com/repos/${owner}/${repo}/commits?per_page=100&page=${page}`,
            headers
        );
    }

    isLastPage(commits) {
        return commits.length === 0 || commits.length < 100;
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
        const sha = commit.sha.substring(0, 7);
        const message = commit.commit.message.split('\n')[0];
        return `${sha} - ${message}`;
    }
}

module.exports = CommitHistoryPlugin; 