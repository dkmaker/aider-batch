import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { spawn } from 'child_process';
import Logger from '../utils/logger.js';

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
      shell: true // Use shell to handle quotes properly
    });

    // Capture stdout and stderr
    aider.stdout.on('data', (data) => {
      const output = data.toString();
      console.log(output.trimEnd());
    });

    aider.stderr.on('data', (data) => {
      const output = data.toString();
      console.error(output.trimEnd());
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
  let logger;
  try {
    // Find and load config
    const { configPath, projectDir } = await findBatchDir(batchName);
    const config = await fs.readJson(configPath);
    const templatePath = path.join(projectDir, 'prompt-template.md');

    // Initialize logger
    logger = new Logger(batchName, config);
    await logger.initialize(projectDir);
    logger.interceptConsole();
    const messageFile = path.join(projectDir, 'LastMessage.txt');

    console.log(chalk.blue(`Starting batch processing for '${batchName}'...`));

    // Process each batch
    for (let i = 0; i < config.batches.length; i++) {
      const batch = config.batches[i];
      const batchNumber = i + 1;
      const totalBatches = config.batches.length;
      
      await logger.writeToLog('\n' + '='.repeat(80));
      await logger.writeToLog(`EXECUTION ${batchNumber}/${totalBatches}`);
      await logger.writeToLog('='.repeat(80));
      await logger.writeToLog('Batch Configuration:');
      await logger.writeToLog(JSON.stringify({
        files: batch.file,
        params: batch.params || [],
        replaceVariables: batch.replaceVariables
      }, null, 2));
      await logger.writeToLog('='.repeat(80));

      console.log(chalk.yellow(`\nProcessing files: ${batch.file.join(', ')}`));

      // Process template
      const processedTemplate = await processTemplate(templatePath, batch.replaceVariables);
      await fs.writeFile(messageFile, processedTemplate);

      // Prepare arguments
      const args = [
        ...config.params,
        ...(batch.params || []),
        // Read files only allowed at global config level
        ...config.global.readFile.map(f => `--read ${f}`),
        // Files can be specified at both levels
        ...config.global.file.map(f => `--file ${f}`),
        ...(batch.file || []).map(f => `--file ${f}`),
        // Add message file parameter in code rather than config
        `--message-file ${messageFile}`
      ];

      // Run Aider
      try {
        await runAider(args, config.env);
        console.log(chalk.green(`✓ Completed processing files`));
      } catch (error) {
        console.error(chalk.red(`✗ Failed processing files`));
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
  } finally {
    // Restore console and close logger
    if (logger) {
      logger.restoreConsole();
      await logger.close();
    }
  }
}
