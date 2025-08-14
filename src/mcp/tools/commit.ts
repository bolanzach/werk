export async function diffCommitTool() {
  // Get the current git branch
  const branchCommand = new Deno.Command("git", {
    args: ["branch", "--show-current"],
    stdout: "piped",
    stderr: "piped",
  });

  const branchOutput = await branchCommand.output();
  const branch = new TextDecoder().decode(branchOutput.stdout).trim();

  // Get the current git diff
  const diffCommand = new Deno.Command("git", {
    args: ["diff", "--staged"],
    stdout: "piped",
    stderr: "piped",
  });

  const { stdout, stderr } = await diffCommand.output();
  const diff = new TextDecoder().decode(stdout);
  const error = new TextDecoder().decode(stderr);

  if (!diff) {
    throw new Error('No staged changes found. Please stage your changes with \'git add\' first.')
  }
  if (error) {
    throw new Error(`Error getting git diff: ${error}`);
  }

  return [branch, diff];
}
