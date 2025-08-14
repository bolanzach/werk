#!/bin/bash
# zcommit script

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

echo "Generating commit message..."

# Call Claude with your configured MCP server
commit_msg=$(claude --print "Use the commit_message tool to generate a commit message based on the current git diff")

echo "Proposed commit message:"
echo "------------------------"
echo "$commit_msg"
echo "------------------------"

# Ask for confirmation
read -p "Proceed with this commit? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    git commit -m "$commit_msg"
    echo "Commit successful!"
else
    echo "Commit cancelled"
fi
