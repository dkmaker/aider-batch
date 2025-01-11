import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';

const defaultConfig = {
  global: {
    readFile: [
      "docs/system-architecture.md",
      "docs/api-guidelines.md",
      "src/types/common.ts"
    ],
    file: [
      "src/handlers/system.ts"
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
    "--no-auto-commits"
  ],
  batches: [
    {
      "file": [
        "src/handlers/user.ts",
        "src/handlers/admin.ts"
      ],
      "params": [],
      "replaceVariables": {
        "HandlerType": "System Handler",
        "HandlerFile": "src/handlers/system.ts",
        "Guidelines": "docs/api-guidelines.md"
      }
    }
  ]
};

const defaultTemplate = `# Update %%HandlerType%%

Please review and update the handler implementation in %%HandlerFile%% to ensure it follows our system architecture and API guidelines.

## Context
The following files provide important context:
- System Architecture: Explains our overall architecture and design principles
- API Guidelines: Contains our API standards and best practices
- Common Types: Shared type definitions used across handlers

## Requirements
1. Ensure the handler follows the structure shown in system.ts
2. Apply the API guidelines from %%Guidelines%%
3. Use appropriate types from common.ts
4. Maintain consistent error handling patterns
5. Add JSDoc comments for public methods

## Task
Please analyze the implementation and:
1. Update the code structure to match our standards
2. Add proper type definitions
3. Implement error handling
4. Add documentation
5. Ensure consistency with other handlers`;

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
