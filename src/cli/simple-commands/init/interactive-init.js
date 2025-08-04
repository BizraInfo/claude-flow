// interactive-init.js - Interactive wizard for the init command
import inquirer from 'inquirer';
import chalk from 'chalk';

/**
 * Runs an interactive wizard to gather initialization options from the user.
 * @returns {Promise<object|null>} A promise that resolves to an options object or null if cancelled.
 */
export async function runInteractiveInit() {
  console.log(chalk.bold.cyan('Welcome to the Claude-Flow Interactive Setup Wizard!'));
  console.log("This wizard will guide you through setting up your new project.\n");

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'projectName',
      message: 'What is the name of your project?',
      default: 'my-claude-flow-project',
    },
    {
      type: 'list',
      name: 'useCase',
      message: 'What is your primary use case? (This sets the default coordination mode)',
      choices: [
        { name: `🚀 Quick tasks & single objectives ${chalk.gray('(recommended for most users)')}`, value: 'swarm' },
        { name: `🐝 Complex projects & persistent sessions ${chalk.gray('(for advanced multi-feature projects)')}`, value: 'hive-mind' },
      ],
      default: 'swarm',
    },
    {
      type: 'confirm',
      name: 'neuralEnhanced',
      message: `Enable Neural-Enhanced features? ${chalk.gray('(AI-optimized coordination and performance)')}`,
      default: true,
    },
    {
      type: 'list',
      name: 'projectType',
      message: 'Choose a project template to get started quickly:',
      choices: [
        'General Purpose (Flexible setup)',
        'Web Application (React + Node.js)',
        'Research Project',
        'CLI Tool',
        new inquirer.Separator(),
        'None (Basic setup)',
      ],
      default: 'General Purpose (Flexible setup)',
    },
  ]);

  // Map answers to the options expected by the init command
  const options = {
    force: true, // The wizard implies a fresh start or the user's intent to configure.
    sparc: true, // SPARC is the default for v2.
    projectName: answers.projectName,
    neural: answers.neuralEnhanced,
    template: answers.projectType,
    hiveMind: answers.useCase === 'hive-mind',
    interactive: true, // Flag to indicate this was run interactively
  };

  console.log('\n' + chalk.bold.green('╔════════════════════════════════════════╗'));
  console.log(chalk.bold.green('║         Configuration Summary        ║'));
  console.log(chalk.bold.green('╚════════════════════════════════════════╝'));
  console.log(`  ${chalk.bold('Project Name:')}    ${options.projectName}`);
  console.log(`  ${chalk.bold('Primary Mode:')}      ${answers.useCase}`);
  console.log(`  ${chalk.bold('Neural Features:')}   ${options.neural ? chalk.green('Enabled') : chalk.red('Disabled')}`);
  console.log(`  ${chalk.bold('Project Template:')}  ${options.template}`);
  console.log('\nThis will create a new Claude-Flow project with the settings above.');

  const { proceed } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'proceed',
      message: 'Do you want to proceed with the initialization?',
      default: true,
    }
  ]);

  if (proceed) {
    console.log(chalk.cyan('\nInitializing your project...'));
    return options;
  } else {
    console.log(chalk.yellow('Initialization cancelled.'));
    return null;
  }
}
