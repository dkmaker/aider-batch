import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';

export async function listBatches() {
  const currentDir = process.cwd();
  const files = await fs.readdir(currentDir);
  const batchDirs = files.filter(f => f.startsWith('.aiderBatch_'));
  
  if (batchDirs.length === 0) {
    console.log(chalk.yellow('\nNo batch projects found'));
    console.log(chalk.gray('\nTip: Create a new batch project using:'));
    console.log(chalk.white('  dkmaker-aider-batch create <project-name>'));
    return;
  }

  console.log(chalk.blue('\nAvailable batch projects:'));
  console.log(chalk.gray('─'.repeat(50)));
  console.log(chalk.gray('Name                 Location'));
  console.log(chalk.gray('─'.repeat(50)));

  for (const dir of batchDirs) {
    const name = dir.replace('.aiderBatch_', '');
    console.log(chalk.white(name.padEnd(20)) + chalk.gray(dir));
  }

  console.log(chalk.gray('─'.repeat(50)));
  console.log(chalk.gray('\nTo run a batch:'));
  console.log(chalk.white('  dkmaker-aider-batch start <batch-name>'));
  console.log(chalk.gray('\nTo create a new batch:'));
  console.log(chalk.white('  dkmaker-aider-batch create <batch-name>'));
}
