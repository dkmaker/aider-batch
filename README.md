# dkmaker-aider-batch

A Node.js CLI tool for batch processing Aider commands using templates and configuration files.

## Installation

```bash
npx dkmaker-aider-batch create my-batch
```

This will create a new directory with the following structure:

```
.aiderBatch_my-batch/
  ├── prompt-template.md    # Template file with placeholders
  └── batch-config.json     # Configuration file for batch processing
```

Note: Projects are created in a `.aiderBatch_` prefixed directory to keep them organized and easily identifiable.

## Configuration

The `batch-config.json` file contains these main sections:

```json
{
  "commonFiles": {
    "read": [],
    "write": []
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
    "--no-auto-commits",
    "--message-file Aider-Message.txt"
  ],
  "batches": [
    {
      "name": "Initial Batch",
      "read": [
        "src/api/user.js",
        "src/models/user.js"
      ],
      "write": [
        "src/controllers/userController.js"
      ],
      "params": [
        "--file path/to/source.js"
      ],
      "variables": {
        "SourceFile": "path/to/source.js",
        "SwaggerFile": "path/to/swagger.json"
      }
    }
  ]
}
```

### Configuration Sections

1. **commonFiles**: Files that should be included in every batch operation
   - `read`: Array of files to be read in every batch
   - `write`: Array of files that may be modified in every batch

2. **env**: Environment variables set before invoking Aider
   - These variables will be set in the environment before each Aider execution
   - Common use case: setting API keys and other configuration

3. **params**: Global parameters passed to every Aider invocation
   - Default parameters that configure Aider's behavior
   - These parameters are used for all batch operations

4. **batches**: Array of batch operations to perform
   - `name`: Descriptive name for the batch operation
   - `read`: Additional files to read for this specific batch
   - `write`: Additional files that may be modified in this batch
   - `params`: Additional parameters specific to this batch
   - `variables`: Key-value pairs for template variable replacement

## Template File

The `prompt-template.md` file can contain placeholders that will be replaced with values from the batch configuration:

```markdown
# Process %%SourceFile%%

Using the Swagger definition from %%SwaggerFile%%, analyze and update the implementation.

## Context Files
...
```

## Usage

### Create a New Batch

```bash
npx dkmaker-aider-batch create my-batch
```

This will:
1. Create a new `.aiderBatch_my-batch` directory
2. Prompt for configuration:
   - Source file path
   - Swagger file path
   - Files to read
   - Files to write
3. Generate configuration files with default Aider parameters

### List Available Batches

```bash
npx dkmaker-aider-batch list
```

Shows all available batches in a table format with their locations.

### Run a Batch

```bash
npx dkmaker-aider-batch start my-batch
```

This will:
1. Load the batch configuration
2. Set environment variables
3. Process template variables
4. Execute Aider with the configured parameters
5. Clean up temporary files

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
dkmaker-aider-batch create test-batch
```

### Testing NPX Installation

1. Create a test directory:
```bash
mkdir test-npx
cd test-npx
```

2. Test the latest published version:
```bash
npx dkmaker-aider-batch create test-batch
```

3. Test a specific version:
```bash
npx dkmaker-aider-batch@1.0.0 create test-batch
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
