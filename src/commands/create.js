import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import inquirer from 'inquirer';

const defaultConfig = {
  commonFiles: {
    read: [],
    write: []
  },
  env: {
    ANTHROPIC_API_KEY: "your-api-key-here"
  },
  params: [
    "--no-suggest-shell-commands",
    "--edit-format whole",
    "--map-tokens 0",
    "--cache-prompts",
    "--no-stream",
    "--no-auto-lint",
    "--yes-always",
    "--no-git",
    "--no-auto-commits",
    "--message-file Aider-Message.txt"
  ],
  batches: [
    {
      "name": "Initial Batch",
      "read": [],
      "write": [],
      "params": [],
      "variables": {
        "SourceFile": "",
        "SwaggerFile": ""
      }
    }
  ]
};

const defaultTemplate = `# Process %%SourceFile%%

Using the Swagger definition from %%SwaggerFile%%, analyze and update the implementation.

## Context Files
...`;

export async function createProject(projectName) {
  const projectDir = `.aiderBatch_${projectName}`;

  // Check if directory already exists
  if (await fs.pathExists(projectDir)) {
    console.log(chalk.yellow(`\nBatch '${projectName}' already exists`));
    console.log(chalk.gray('\nTip: Use one of these commands:'));
    console.log(chalk.white('  dkmaker-aider-batch start ' + projectName));
    console.log(chalk.white('  dkmaker-aider-batch list'));
    process.exit(1);
  }

  // Get batch configuration
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'sourceFile',
      message: 'Enter source file path:',
      validate: input => input.length > 0 || 'Source file is required'
    },
    {
      type: 'input',
      name: 'swaggerFile',
      message: 'Enter Swagger file path:',
      validate: input => input.length > 0 || 'Swagger file is required'
    },
    {
      type: 'input',
      name: 'readFiles',
      message: 'Enter files to read (comma-separated):',
      filter: input => input ? input.split(',').map(s => s.trim()) : []
    },
    {
      type: 'input',
      name: 'writeFiles',
      message: 'Enter files to write (comma-separated):',
      filter: input => input ? input.split(',').map(s => s.trim()) : []
    }
  ]);

  try {
    // Create project directory
    await fs.mkdir(projectDir);
    console.log(chalk.blue(`Creating batch project: ${projectDir}`));

    // Update config with user input
    const config = { ...defaultConfig };
    config.batches[0].variables.SourceFile = answers.sourceFile;
    config.batches[0].variables.SwaggerFile = answers.swaggerFile;
    config.batches[0].read = answers.readFiles;
    config.batches[0].write = answers.writeFiles;

    // Create batch-config.json
    const configPath = path.join(projectDir, 'batch-config.json');
    await fs.writeJson(configPath, config, { spaces: 2 });
    console.log(chalk.blue('Created batch-config.json'));

    // Create prompt-template.md
    const templatePath = path.join(projectDir, 'prompt-template.md');
    await fs.writeFile(templatePath, defaultTemplate);
    console.log(chalk.blue('Created prompt-template.md'));

    console.log(chalk.gray('\nTip: Start your batch with:'));
    console.log(chalk.white(`  dkmaker-aider-batch start ${projectName}`));

  } catch (error) {
    // Clean up on error
    if (await fs.pathExists(projectDir)) {
      await fs.remove(projectDir);
    }
    throw error;
  }
}
