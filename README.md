# dkmaker-aider-batch

A Node.js CLI tool for batch processing Aider commands using templates and configuration files.

## Installation

```bash
npx aider-batch create my-batch
```

This will create a new directory with the following structure:

```
.aiderBatch_my-batch/
  ├── prompt-template.md    # Template file with placeholders
  └── batch-config.json     # Configuration file for batch processing
```

Note: Projects are created in a `.aiderBatch_` prefixed directory to keep them organized and easily identifiable.

## Configuration

The `batch-config.json` file is created with example configuration that you can modify:

```json
{
  "global": {
    "readFile": [
      "docs/system-architecture.md",    // System-wide documentation
      "docs/api-guidelines.md",         // API standards
      "src/types/common.ts"            // Shared type definitions
    ],
    "file": [
      "src/handlers/system.ts"         // Reference implementation
    ]
  },
  "env": {
    "ANTHROPIC_API_KEY": "your-api-key-here"
  },
  "params": [
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
  "batches": [
    {
      "file": [                        // Files to be modified
        "src/handlers/user.ts",
        "src/handlers/admin.ts"
      ],
      "params": [],
      "replaceVariables": {            // Template variables
        "HandlerType": "System Handler",
        "HandlerFile": "src/handlers/system.ts",
        "Guidelines": "docs/api-guidelines.md"
      }
    }
  ]
}
```

This example configuration demonstrates a common use case: standardizing multiple system handlers based on a reference implementation and documentation.

### Configuration Sections

1. **global**: Settings that apply across all batch operations
   - `readFile`: Array of files to be used as read-only context (matches Aider's --read argument)
   - `file`: Array of files that may be modified (matches Aider's --file argument)
   - Note: Read-only files can only be specified at the global level to prevent cache invalidation

2. **env**: Environment variables set before invoking Aider
   - These variables will be set in the environment before each Aider execution
   - Common use case: setting API keys and other configuration

3. **params**: Global parameters passed to every Aider invocation
   - Default parameters that configure Aider's behavior
   - These parameters are used for all batch operations
   - Note: The --message-file parameter is handled internally by the tool

4. **batches**: Array of file sets to process with the template
   - `file`: Array of files to be modified (matches Aider's --file argument)
   - `params`: Additional parameters for this set of files
   - `replaceVariables`: Values to replace in the template for this set

## Template File

The `prompt-template.md` file is created with example content that you can customize:

```markdown
# Update %%HandlerType%%

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
5. Ensure consistency with other handlers
```

This example template provides clear instructions for standardizing handler implementations across a system.

## Usage

### Create a New Batch

```bash
npx aider-batch create my-batch
```

This will:
1. Create a new `.aiderBatch_my-batch` directory
2. Generate example configuration files
3. Create a template with placeholders

After creation, edit the batch-config.json file to configure your specific batch settings.

### List Available Batches

```bash
npx aider-batch list
```

Shows all available batches in a table format with their locations.

### Run a Batch

```bash
npx aider-batch start my-batch
```

This will:
1. Load the batch configuration
2. Set environment variables
3. Process template variables
4. Create LastMessage.txt with the processed template
5. Execute Aider with the configured parameters and LastMessage.txt
6. Clean up temporary files after completion

Note: LastMessage.txt is used internally to pass the processed template to Aider. The file is overwritten on each batch operation and removed when processing completes.

## Development and Testing

### Local Development

1. Clone the repository:
```bash
git clone <repository-url>
cd dkmaker-aider-batch
```

2. Install dependencies:
```bash
npm install
```

3. Create a symbolic link to test locally:
```bash
npm link
```

Now you can use the tool locally with:
```bash
aider-batch create test-batch
```

### Testing NPX Installation

1. Create a test directory:
```bash
mkdir test-npx
cd test-npx
```

2. Test the latest published version:
```bash
npx aider-batch create test-batch
```

3. Test a specific version:
```bash
npx aider-batch@1.0.0 create test-batch
```

### Testing Local Build with NPX

1. Pack the project locally:
```bash
npm pack
```

2. Create a test directory:
```bash
mkdir test-local-npx
cd test-local-npx
```

3. Test the local package:
```bash
npx ../dkmaker-aider-batch-1.0.0.tgz create test-batch
```

### Development Tips

- After making changes, run `npm link` again to update the local installation
- Use `npm pack` to test the package before publishing
- Test all commands in a clean directory to ensure proper functionality
- Check the generated .aiderBatch_ directories to verify correct file creation
- Test with both relative and absolute paths in batch configurations

## License

MIT
