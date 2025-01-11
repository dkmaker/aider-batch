import fs from 'fs-extra';
import path from 'path';
import util from 'util';
import chalk from 'chalk';

class Logger {
  constructor(batchName, batchConfig) {
    this.batchName = batchName;
    this.batchConfig = batchConfig;
    this.logStream = null;
    this.originalConsole = {
      log: console.log,
      error: console.error,
      warn: console.warn,
      info: console.info
    };
  }

  async initialize(projectDir) {
    // Create logs directory in the batch project directory
    const logsDir = path.join(projectDir, 'logs');
    await fs.ensureDir(logsDir);

    // Create unique log file name with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const logFile = path.join(logsDir, `batch_${timestamp}.log`);
    
    // Create write stream
    this.logStream = fs.createWriteStream(logFile, { flags: 'a' });

    // Write initial metadata
    const metadata = {
      timestamp: new Date().toISOString(),
      batchName: this.batchName,
      config: this.batchConfig
    };

    await this.writeToLog('\n' + '='.repeat(80));
    await this.writeToLog('BATCH EXECUTION METADATA');
    await this.writeToLog('='.repeat(80));
    await this.writeToLog(JSON.stringify(metadata, null, 2));
    await this.writeToLog('\n' + '='.repeat(80));
    await this.writeToLog('EXECUTION LOG');
    await this.writeToLog('='.repeat(80) + '\n');
  }

  async writeToLog(message) {
    if (this.logStream) {
      return new Promise((resolve, reject) => {
        this.logStream.write(message + '\n', (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }
  }

  interceptConsole() {
    // Store original console methods
    const self = this;

    // Override console methods
    console.log = function() {
      self.originalConsole.log.apply(console, arguments);
      // Strip ANSI color codes and log
      const message = util.format.apply(null, arguments).replace(/\u001b\[\d+m/g, '');
      self.writeToLog(message);
    };

    console.error = function() {
      self.originalConsole.error.apply(console, arguments);
      const message = util.format.apply(null, arguments).replace(/\u001b\[\d+m/g, '');
      self.writeToLog('[ERROR] ' + message);
    };

    console.warn = function() {
      self.originalConsole.warn.apply(console, arguments);
      const message = util.format.apply(null, arguments).replace(/\u001b\[\d+m/g, '');
      self.writeToLog('[WARN] ' + message);
    };

    console.info = function() {
      self.originalConsole.info.apply(console, arguments);
      const message = util.format.apply(null, arguments).replace(/\u001b\[\d+m/g, '');
      self.writeToLog('[INFO] ' + message);
    };
  }

  restoreConsole() {
    // Restore original console methods
    Object.assign(console, this.originalConsole);
  }

  async close() {
    if (this.logStream) {
      await this.writeToLog('='.repeat(80));
      await this.writeToLog('END OF LOG');
      await this.writeToLog('='.repeat(80));
      
      return new Promise((resolve) => {
        this.logStream.end(() => {
          this.logStream = null;
          resolve();
        });
      });
    }
  }
}

export default Logger;
