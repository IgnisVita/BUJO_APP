# Git Protocols and Workflow

## Branch Strategy

### Main Branches
- `main` (or `master`) - Production-ready code
- `develop` - Integration branch for features

### Feature Branches
- Branch from: `develop`
- Merge back to: `develop`
- Naming: `feature/description-of-feature`
- Example: `feature/user-authentication`

### Hotfix Branches
- Branch from: `main`
- Merge back to: `main` and `develop`
- Naming: `hotfix/description-of-fix`
- Example: `hotfix/critical-security-patch`

## Commit Messages

### Format
```
<type>: <subject>

<body>

<footer>
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, semicolons, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks, dependency updates
- `perf`: Performance improvements

### Examples
```
feat: add user authentication system

- Implement JWT token generation
- Add login/logout endpoints
- Create user session management

Closes #123
```

```
fix: resolve memory leak in data processing

Fixed circular reference in cache manager that was preventing
garbage collection of processed items.
```

## Git Commands Reference

### Daily Workflow
```bash
# Start new feature
git checkout develop
git pull origin develop
git checkout -b feature/new-feature

# Regular commits
git add .
git commit -m "feat: implement new feature"

# Push changes
git push -u origin feature/new-feature
```

### Syncing with Remote
```bash
# Update local branch with remote changes
git fetch origin
git merge origin/develop

# Or use pull (fetch + merge)
git pull origin develop

# Rebase instead of merge (cleaner history)
git pull --rebase origin develop
```

### Managing Branches
```bash
# List all branches
git branch -a

# Delete local branch
git branch -d branch-name

# Delete remote branch
git push origin --delete branch-name

# Rename branch
git branch -m old-name new-name
```

### Stashing Changes
```bash
# Save current changes
git stash save "work in progress"

# List stashes
git stash list

# Apply most recent stash
git stash pop

# Apply specific stash
git stash apply stash@{0}
```

## Pull Request Guidelines

### Before Creating PR
1. Update your branch with latest changes from target branch
2. Run all tests locally
3. Review your own code changes
4. Ensure commit messages follow conventions
5. Update documentation if needed

### PR Description Template
```markdown
## Description
Brief description of what this PR does

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No console.log or debug code left
```

## Code Review Process

### As Reviewer
- Check for bugs and logic errors
- Ensure code follows project conventions
- Verify tests are adequate
- Look for performance issues
- Suggest improvements constructively

### As Author
- Respond to all comments
- Make requested changes promptly
- Explain decisions when needed
- Request re-review after changes

## Merge Strategies

### Feature to Develop
```bash
# Option 1: Merge (preserves branch history)
git checkout develop
git merge --no-ff feature/branch-name

# Option 2: Squash (clean history)
git checkout develop
git merge --squash feature/branch-name
git commit -m "feat: complete feature description"
```

### Release Process
```bash
# Create release branch
git checkout -b release/1.0.0 develop

# After testing, merge to main
git checkout main
git merge --no-ff release/1.0.0
git tag -a v1.0.0 -m "Release version 1.0.0"

# Merge back to develop
git checkout develop
git merge --no-ff release/1.0.0
```

## Useful Git Aliases

Add to `~/.gitconfig` or run `git config --global`:

```bash
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.st status
git config --global alias.unstage 'reset HEAD --'
git config --global alias.last 'log -1 HEAD'
git config --global alias.visual '!gitk'
git config --global alias.lg "log --graph --oneline --decorate --all"
```

## Troubleshooting

### Undo Last Commit (not pushed)
```bash
# Keep changes
git reset --soft HEAD~1

# Discard changes
git reset --hard HEAD~1
```

### Fix Commit Message
```bash
# Most recent commit
git commit --amend -m "new message"

# Older commit (interactive rebase)
git rebase -i HEAD~3
```

### Resolve Merge Conflicts
```bash
# See conflicted files
git status

# After fixing conflicts
git add resolved-file.js
git commit -m "resolve merge conflicts"
```

### Recovery
```bash
# Find lost commits
git reflog

# Restore lost commit
git checkout <commit-hash>
```

## GitHub-Specific Features

### Linking Issues
- Use `#123` in commit messages to reference issues
- Use `Closes #123` or `Fixes #123` to auto-close issues

### Draft Pull Requests
- Create as draft when work is in progress
- Convert to ready when complete

### Protected Branches
- `main` branch should require PR reviews
- Enable status checks (CI/CD must pass)
- Require branches to be up-to-date

## Best Practices

1. **Commit Often**: Small, logical commits are easier to review and revert
2. **Pull Before Push**: Always sync with remote before pushing
3. **Branch Protection**: Never commit directly to main/master
4. **Clean History**: Use interactive rebase to clean up commits before PR
5. **Descriptive Names**: Use clear, descriptive branch and commit names
6. **Test Before Merge**: Ensure all tests pass before merging
7. **Document Changes**: Update README and docs with your changes
8. **Review Own Code**: Always review your own PR before requesting reviews