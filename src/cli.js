#!/usr/bin/env node

import { program } from 'commander';
import { createProject } from './commands/create.js';
import { startBatch } from './commands/start.js';
import { listBatches } from './commands/list.js';
import chalk from 'chalk';

program
  .name('aider-batch')
  .description('CLI tool for batch processing Aider commands')
  .version('1.0.0');

program
  .command('create')
  .description('Create a new batch project')
  .argument('<project-name>', 'Name of the project')
  .action(async (projectName) => {
    try {
      await createProject(projectName);
      console.log(chalk.green(`\n✓ Batch project created successfully`));
    } catch (error) {
      console.error(chalk.red(`\n✗ Error creating project: ${error.message}`));
      process.exit(1);
    }
  });

program
  .command('start')
  .description('Start batch processing')
  .argument('<batch-name>', 'Name of the batch to run')
  .action(async (batchName) => {
    try {
      await startBatch(batchName);
    } catch (error) {
      console.error(chalk.red(`\n✗ Error during batch processing: ${error.message}`));
      if (error.message.includes('not found')) {
        console.log(chalk.yellow('\nTip: Use "aider-batch list" to see available batches'));
      }
      process.exit(1);
    }
  });

program
  .command('list')
  .description('List all batch projects')
  .action(async () => {
    try {
      await listBatches();
    } catch (error) {
      console.error(chalk.red(`\n✗ Error listing batches: ${error.message}`));
      process.exit(1);
    }
  });

program.parse();
