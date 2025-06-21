# GitHub Token Setup for Commit History

This project uses GitHub's API to fetch commit history during the build process. This requires a GitHub Personal Access Token.

## Creating a GitHub Token

1. **Go to GitHub Settings**
   - Visit: https://github.com/settings/tokens
   - Or: GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)

2. **Generate New Token**
   - Click "Generate new token (classic)"
   - Give it a descriptive name like "personal-resume-build"
   - Set expiration as needed (recommend 90 days or no expiration for CI/CD)

3. **Select Scopes**
   - ✅ **`repo`** - Full control of private repositories (required for private repos)
   - For public repos only, you could use `public_repo` instead

4. **Copy the Token**
   - ⚠️ **Important**: Copy the token immediately - you won't see it again!

## Setting Environment Variables

### For Local Development
```bash
export GITHUB_TOKEN="your_token_here"
export GITHUB_OWNER="MihaiOnSoftware"  # Optional, defaults to MihaiOnSoftware
export GITHUB_REPO="personal-resume"   # Optional, defaults to personal-resume
```

### For Docker Deployment
Add to your deployment environment:
```bash
GITHUB_TOKEN=your_token_here
GITHUB_OWNER=MihaiOnSoftware
GITHUB_REPO=personal-resume
```

### For DigitalOcean Apps
1. Go to your app settings
2. Add environment variables:
   - `GITHUB_TOKEN` = your token
   - `GITHUB_OWNER` = MihaiOnSoftware (optional)
   - `GITHUB_REPO` = personal-resume (optional)

## Testing the Setup

```bash
# Test locally
npm run build

# Should see: "✅ Commit history generated successfully"
# Instead of: "Could not generate commit history: GITHUB_TOKEN environment variable is required"
```

## Security Notes

- 🔒 **Never commit tokens to git**
- 🔄 **Rotate tokens regularly**
- 🎯 **Use minimal required scopes**
- 🏢 **For organizations, consider using GitHub Apps instead**

## API Rate Limits

- **Authenticated requests**: 5,000 per hour
- **This build uses**: ~3 requests (repo info, commits, branches)
- **Should be fine for**: Regular builds and deployments

## Troubleshooting

### "Failed to fetch repository info: 404"
- Check that `GITHUB_OWNER` and `GITHUB_REPO` are correct
- Ensure token has access to the repository
- For private repos, ensure `repo` scope is selected

### "Failed to fetch commits: 403"
- Token may be expired
- Token may not have sufficient permissions
- Check rate limits: https://docs.github.com/en/rest/overview/resources-in-the-rest-api#rate-limiting

### Build succeeds but no commit history in chatbot
- Check that `dist/commit-history.json` was created during build
- Verify the file contains valid JSON with repository stats 