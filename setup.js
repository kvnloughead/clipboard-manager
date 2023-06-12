// Set up script for clipboard manager
const HELP = `Usage: node setup.js [OPTIONS]

  Prompts the user for input and creates two files with the input provided.
  
  Options:
    -h, --help      Display this help message and exit
    -y, --yes       Choose default file paths and skip the prompts
    -v, --verbose   Print detailed error messages when an error occurs
  
  Examples:
    node setup.js            Start the script and prompt the user for input
    node setup.js -y         Choose default file paths and skip the prompts
    node setup.js -v         Print detailed error messages when an error occurs
    node setup.js -h         Display this help message and exit
  `;

import prompt from 'prompt';

import { createAndWriteToFile } from './utils/helpers.js';

const args = process.argv.slice(2).map((arg) => arg.toLowerCase());
const noPrompt = args.some((val) => ['-y', '--y', 'y', 'yes'].includes(val));
const verbose = args.some((val) => ['-v', '--v', 'verbose'].includes(val));
const showHelp = args.some((val) => ['-h', '--help', 'help'].includes(val));

const defaultConfigPath = `/home/${process.env.USER}/.config/cb/defaults.json`;

async function promptUser(err, result) {
  const [clipsPath, configPath] = [result.clipsPath, result.configPath];
  try {
    await createAndWriteToFile(clipsPath, `{}`, { recursive: true });
    await createAndWriteToFile(
      configPath,
      JSON.stringify({ clipsPath, configPath }, undefined, 2),
      {
        recursive: true,
      },
    );
    await createAndWriteToFile(
      defaultConfigPath,
      JSON.stringify({ clipsPath, configPath }, undefined, 2),
      {
        recursive: true,
      },
    );
  } catch (err) {
    if (verbose) {
      console.error(err);
    } else {
      console.log(
        `\nExiting. Run again with the -v flag for more information.\n`,
      );
    }
    process.exit(1);
  }
}

prompt.start();

if (showHelp) {
  console.log(HELP);
} else if (noPrompt) {
  promptUser(null, {
    clipsPath: `/home/${process.env.USER}/.config/cb/clips.json`,
    configPath: `/home/${process.env.USER}/.config/cb/settings.json`,
  });
} else {
  prompt.get(
    [
      {
        name: `configPath`,
        default: `/home/${process.env.USER}/.config/cb/settings.json`,
        description: `Where would you like to store your default configuration file?`,
        message: `Please enter a valid file path`,
      },
      {
        name: 'clipsPath',
        default: `/home/${process.env.USER}/.config/cb/clips.json`,
        description: `Where would you like to store your clips?`,
        message: `Please enter a valid file path`,
      },
    ],
    promptUser,
  );
}