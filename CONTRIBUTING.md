# Contribution

Thank you for your interest in contributing to **Playful Sparkle: Replace Accents**! We value contributions from the community to enhance this Visual Studio Code extension. Whether you're fixing bugs, adding features, improving documentation, or optimizing performance, your efforts are greatly appreciated.

---

## Code of Conduct

By participating in this project, you agree to adhere to our [Code of Conduct](https://github.com/playfulsparkle/.github/blob/main/CODE_OF_CONDUCT.md). Please review it before engaging with the community.

---

## Getting Started

### Prerequisites

To contribute effectively, ensure you have:

- A basic understanding of Git and GitHub workflows
- Familiarity with JavaScript (ES6+), TypeScript, and Node.js development
- Installed Node.js (v16.x or higher) and npm
- Visual Studio Code installed with the [VS Code Extension Development](https://code.visualstudio.com/api) setup
- A local development environment for testing changes

---

## How to Contribute

### Reporting Issues

To report an issue:

1. Review the [existing issues](https://github.com/playfulsparkle/vscode_ps_replace_accents/issues) to avoid duplicates, or open a ticket on the [support page](https://support.playfulsparkle.com/).
2. Provide detailed information, including:
   - Steps to reproduce the issue
   - Expected and actual behavior
   - Relevant error logs or stack traces (if available)
   - Environment details (e.g., VS Code version, Node.js version, OS)

### Suggesting Features

To propose a new feature, open an issue and include:

- The problem your feature addresses
- A clear and concise description of the proposed solution
- Relevant use cases or examples

### Submitting Pull Requests

To submit a pull request (PR):

1. Fork the repository.
2. Create a descriptive branch:
   `git checkout -b feat/your-feature-name` or `fix/your-bug-name`
3. Commit your changes with meaningful messages.
4. Push your branch:
   `git push origin your-branch-name`
5. Open a PR with a clear title and detailed description.

---

## Pull Request Process

1. Ensure your changes pass all linting and tests:
   - Run `npm run lint` to check for code style issues.
   - Run `npm test` to ensure all tests pass.
2. Update relevant documentation (e.g., README, inline comments) as needed.
3. Submit your PR for review. Maintainers may request changes.
4. Once approved, your contribution will be merged into the project.

---

## Style Guidelines

### Code Standards

- Follow best practices for TypeScript and JavaScript, including ES6+ syntax.
- Adhere to the project's ESLint rules (configured in `eslint.config.mjs`).
- Use descriptive and meaningful names for variables and functions.
- Add comments to clarify complex logic.

### Commit Messages

- Write in present tense (e.g., "Add feature" instead of "Added feature").
- Limit the first line to 72 characters.
- Provide additional details in the body if necessary.

---

## Testing Guidelines

To ensure the quality of your contributions:

- Write unit tests for new features or bug fixes.
- Run `npm test` to execute the test suite.
- Validate edge cases, such as different text manipulation scenarios or invalid input.
- Confirm that your changes do not introduce breaking changes.

---

## Development Workflow

1. Clone the repository:
   ```bash
   git clone https://github.com/playfulsparkle/vscode_ps_replace_accents.git
   cd vscode_ps_replace_accents
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the extension:
   ```bash
   vsce package
   ```
4. Launch the extension in a new VS Code instance:
   ```bash
   npm run watch
   ```
   Then press `F5` in VS Code to start debugging the extension.

5. Run tests:
   ```bash
   npm run pretest
   ```

---

## License Agreement

By contributing to this project, you agree that your work will be licensed under the project's [BSD 3-Clause License](LICENSE).

---

## Contributor Recognition

We value and acknowledge significant contributions. Contributors may be recognized in:

- The project's README
- Release notes
- A dedicated "Contributors" section

---

## Questions or Support?

If you have any questions or need assistance, feel free to reach out via:

- [GitHub Issues](https://github.com/playfulsparkle/vscode_ps_replace_accents/issues)
- [support@playfulsparkle.com](mailto:support@playfulsparkle.com)
