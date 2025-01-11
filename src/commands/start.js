import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { spawn } from 'child_process';

async function findBatchDir(batchName) {
  const currentDir = process.cwd();
  const batchDir = path.join(currentDir, `.aiderBatch_${batchName}`);
  
  if (!await fs.pathExists(batchDir)) {
    throw new Error(`Batch '${batchName}' not found`);
  }
  
  return {
    configPath: path.join(batchDir, 'batch-config.json'),
    projectDir: batchDir
  };
}

async function processTemplate(templatePath, variables) {
  let content = await fs.readFile(templatePath, 'utf8');
  for (const [key, value] of Object.entries(variables)) {
    content = content.replace(new RegExp(`%%${key}%%`, 'g'), value);
  }
  return content;
}

function formatArgument(arg) {
  // Handle arguments that contain spaces by wrapping in quotes
  return arg.includes(' ') ? `"${arg}"` : arg;
}

async function runAider(args, env) {
  return new Promise((resolve, reject) => {
    // Convert array of arguments into properly formatted command-line arguments
    const formattedArgs = args.flatMap(arg => {
      // Split on spaces only if not wrapped in quotes
      if (arg.startsWith('"') && arg.endsWith('"')) {
        return [arg];
      }
      return arg.split(' ').map(formatArgument);
    });

    console.log(chalk.gray('Running Aider with arguments:'));
    console.log(chalk.gray(formattedArgs.join(' ')));

    const aider = spawn('aider', formattedArgs, {
      env: { ...process.env, ...env },
      stdio: 'inherit',
      shell: true // Use shell to handle quotes properly
    });

    aider.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Aider process exited with code ${code}`));
      }
    });

    aider.on('error', (err) => {
      reject(new Error(`Failed to start Aider: ${err.message}`));
    });
  });
}

export async function startBatch(batchName) {
  try {
    // Find and load config
    const { configPath, projectDir } = await findBatchDir(batchName);
    const config = await fs.readJson(configPath);
    const templatePath = path.join(projectDir, 'prompt-template.md');
    const messageFile = path.join(projectDir, 'Aider-Message.txt');

    console.log(chalk.blue(`Starting batch processing for '${batchName}'...`));

    // Process each batch
    for (const batch of config.batches) {
      console.log(chalk.yellow(`\nProcessing batch: ${batch.name}`));

      // Process template
      const processedTemplate = await processTemplate(templatePath, batch.variables);
      await fs.writeFile(messageFile, processedTemplate);

      // Prepare arguments
      const args = [
        ...config.params,
        ...(batch.params || []),
        ...config.commonFiles.read.map(f => `--read ${f}`),
        ...config.commonFiles.write.map(f => `--file ${f}`),
        ...(batch.read || []).map(f => `--read ${f}`),
        ...(batch.write || []).map(f => `--file ${f}`)
      ];

      // Run Aider
      try {
        await runAider(args, config.env);
        console.log(chalk.green(`✓ Completed batch: ${batch.name}`));
      } catch (error) {
        console.error(chalk.red(`✗ Failed batch: ${batch.name}`));
        throw error;
      }
    }

    // Cleanup
    if (await fs.pathExists(messageFile)) {
      await fs.remove(messageFile);
    }

    console.log(chalk.green('\n✓ All batches completed successfully'));
  } catch (error) {
    throw error;
  }
}
