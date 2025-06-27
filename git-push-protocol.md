# Git Push Protocol - Quick Reference

## Quick Push Commands

### Standard Push (for regular updates)
```bash
git add .
git commit -m "type: brief description of changes"
git push
```

### Detailed Push (with comprehensive commit message)
```bash
git add .
git commit -m "$(cat <<'EOF'
type: brief description

- Detailed change 1
- Detailed change 2
- Detailed change 3

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
git push
```

## Commit Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test updates
- `chore`: Maintenance tasks

## Before Pushing Checklist
1. **Check status**: `git status`
2. **Review changes**: `git diff`
3. **Test code**: Run any tests
4. **Stage files**: `git add .` or `git add specific-file.ext`
5. **Commit**: Use descriptive message
6. **Push**: `git push`

## Common Scenarios

### Push specific files only
```bash
git add file1.py file2.js
git commit -m "fix: update specific files"
git push
```

### Amend last commit (before pushing)
```bash
git add .
git commit --amend -m "new message"
git push
```

### View recent commits
```bash
git log --oneline -5
```

### Check what will be pushed
```bash
git diff origin/main..HEAD
```

## If Push Fails

### Pull latest changes first
```bash
git pull --rebase
git push
```

### Force push (use carefully!)
```bash
git push --force
```

## Quick Aliases (add to ~/.bashrc or ~/.zshrc)
```bash
alias gs='git status'
alias ga='git add .'
alias gc='git commit -m'
alias gp='git push'
alias gl='git log --oneline -5'
```

## Your Repository
- **URL**: https://github.com/IgnisVita/BUJO_APP
- **Remote**: origin
- **Default branch**: main

## Example Usage
```bash
# After making changes
git add .
git commit -m "feat: add new timer functionality"
git push

# Check it worked
git log --oneline -1
```