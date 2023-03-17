#!/usr/bin/env node

import _yargs from 'yargs';
import clipboard from 'clipboardy';
import { hideBin } from 'yargs/helpers';
import * as dotenv from 'dotenv';
const yargs = _yargs(hideBin(process.argv));
dotenv.config();

import { setFilePath } from '../middleware/index.js';

import set from '../commands/set.js';
import get from '../commands/get.js';
import remove from '../commands/remove.js';
import list from '../commands/list.js';
import open from '../commands/open.js';
import { openFileInEditor, parseJSON } from '../utils/helpers.js';

function parseConfig() {
  const defaults = parseJSON(
    `/home/${process.env.USER}/.config/cb/defaults.json`,
  );
  const configPath = defaults.configPath;
  return parseJSON(configPath);
}
const config = parseConfig();

yargs
  .env('CB')
  .options({
    e: {
      alias: 'editor',
      default: process.env.EDITOR || 'nano',
      describe: 'Editor to use to open config or data files',
      type: 'string',
    },
    c: {
      alias: ['cfg', 'config'],
      default: false,
      describe: 'Run commands on config file instead of clips.',
      type: 'boolean',
    },
  })
  .requiresArg('e')
  .default({
    clipsPath: `/home/${process.env.USER}/.config/cb/clips.json`,
    configPath: `/home/${process.env.USER}/.config/cb/settings.json`,
  })
  .middleware(setFilePath)
  .command(
    ['set [key]', 's'],
    'assigns clipboard contents to data[key]',
    (yargs) => {
      yargs.positional('key', {
        describe: 'key to associate with clipboard contents',
        default: 0,
      });
    },
    (argv) => {
      set({ ...argv, content: clipboard.readSync() });
    },
  )
  .command(
    ['get [key]', 'g'],
    'loads the value cb[key] to the clipboard',
    (yargs) => {
      yargs.positional('key', {
        describe: 'key to access from data file',
        default: 0,
      });
    },
    get,
  )
  .command(
    ['remove <key>', 'rm', 'delcomete', 'del', 'd'],
    'deletes the key:value pair',
    (yargs) => {
      yargs.positional('key', {
        describe: 'key to remove from data',
      });
    },
    remove,
  )
  .command(
    ['config [option]', 'cfg'],
    'Sets a configuration option, or opens configuration file if no option is provided',
    (yargs) => {
      yargs.positional('option', {
        describe: 'the option to configure',
      });
    },
    ({ configPath, option, ...rest }) => {
      option
        ? set({ ...rest, file: configPath, key: option })
        : openFileInEditor(rest.editor, configPath);
    },
  )
  .command(
    ['list', 'l'],
    'Outputs list of current clips to the terminal.',
    (yargs) => {
      yargs.option('pretty', {
        describe: 'makes output look nicer, according to some',
        alias: 'p',
      });
    },
    list,
  )
  .command(['open', 'o'], 'Opens clips file in editor.', () => {}, open)
  .option('verbose', {
    alias: 'v',
    type: 'boolean',
    description: 'run with verbose logging',
  })
  .demandCommand()
  .showHelpOnFail(true)
  .help('h')
  .alias('h', 'help')
  .completion('completion', function (current, argv, completionFilter, done) {
    if (argv._.includes('g') || argv._.includes('get')) {
      completionFilter((err, defaultCompletions) => {
        const clipKeys = Object.keys(parseJSON(argv.clipsPath));
        done(clipKeys);
      });
    } else {
      completionFilter();
    }
  })
  .config(config).argv;
