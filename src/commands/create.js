import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';

const defaultConfig = {
  commonFiles: {
    read: [
      "src/utils/requestHandlerFactory.js",
      "src/utils/responseFormatter.js",
      "src/utils/errorHandler.js",
      "src/utils/validators.js"
    ],
    write: [
      "src/functions/httpUser.js"
    ]
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
      "name": "Example Batch",
      "read": [
        "src/api/user.js",
        "src/models/user.js"
      ],
      "write": [
        "src/controllers/userController.js"
      ],
      "params": [
        "--file src/api/user.js"
      ],
      "variables": {
        "SourceFile": "src/api/user.js",
        "SwaggerFile": "swagger/user-api.json"
      }
    }
  ]
};

const defaultTemplate = `# Process %%SourceFile%%

Using the Swagger definition from %%SwaggerFile%%, analyze and update the implementation.

## Context Files
The following files provide context for the implementation:
- API Definition: %%SwaggerFile%%
- Source File: %%SourceFile%%

## Task
Please analyze the implementation and suggest improvements based on the Swagger definition.`;

export async function createProject(projectName) {
  const projectDir = `.aiderBatch_${projectName}`;

  // Check if directory already exists
  if (await fs.pathExists(projectDir)) {
    console.log(chalk.yellow(`\nBatch '${projectName}' already exists`));
    console.log(chalk.gray('\nTip: Use one of these commands:'));
    console.log(chalk.white('  aider-batch start ' + projectName));
    console.log(chalk.white('  aider-batch list'));
    process.exit(1);
  }

  try {
    // Create project directory
    await fs.mkdir(projectDir);
    console.log(chalk.blue(`Creating batch project: ${projectDir}`));

    // Create batch-config.json with example configuration
    const configPath = path.join(projectDir, 'batch-config.json');
    await fs.writeJson(configPath, defaultConfig, { spaces: 2 });
    console.log(chalk.blue('Created batch-config.json with example configuration'));

    // Create prompt-template.md
    const templatePath = path.join(projectDir, 'prompt-template.md');
    await fs.writeFile(templatePath, defaultTemplate);
    console.log(chalk.blue('Created prompt-template.md'));

    console.log(chalk.gray('\nTip: Edit batch-config.json to configure your batch settings'));
    console.log(chalk.gray('     Then start your batch with:'));
    console.log(chalk.white(`  aider-batch start ${projectName}`));

  } catch (error) {
    // Clean up on error
    if (await fs.pathExists(projectDir)) {
      await fs.remove(projectDir);
    }
    throw error;
  }
}
