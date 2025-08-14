#!/bin/bash
# Useful to setup a bash alias for this script: gcommit='bash path/to/werk/scripts/git_commit.sh'

set -e

# Check if we're in a git repo
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "Error: Not in a git repository"
    exit 1
fi

# Check if there are staged changes
if git diff --cached --quiet; then
    echo "No staged changes to commit"
    exit 1
fi

echo "Generating commit message 🤖 ..."

# Run the claude command to generate a commit message
raw_response=$(cd "$PROJECT_ROOT" && claude --permission-mode bypassPermissions "Use the commit_message tool to generate a commit message based on the current git diff")

# Clean the response - extract only the commit message
# Look for lines starting with commit types and take everything from there
commit_msg=$(echo "$raw_response" | awk '
    /^(feat|fix|docs|style|refactor|test|chore):/ { found=1 }
    found && /^(Generated with|Co-Authored-By|🤖)/ { exit }
    found { print }
' | sed '/^```/d' | sed 's/^[[:space:]]*•/•/')

# Check if cleaning failed
if [ -z "$commit_msg" ]; then
    echo "Error: Failed to generate a valid commit message"
    exit 1
fi

echo "Proposed commit message:"
echo "------------------------"
echo "$commit_msg"
echo "------------------------"

# Ask for confirmation
read -p "Proceed with this commit? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    git commit -m "$commit_msg"
    echo "Commit successful! 🎉"
else
    echo "Commit cancelled"
fi
