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
import { options } from '../help/index.js';

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
  .option('verbose', options.verbose.details('main'))
  .option('img', options.img.details('main'))
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
    f: {
      alias: 'force',
      default: false,
      describe: 'Force action',
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
      yargs.option('img', options.img.details('set'));
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
      yargs.option('img', options.img.details('get'));
    },
    get,
  )
  .command(
    ['remove <key>', 'rm <key>', 'r <key>', 'del <key>', 'd <key>'],
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
    ['list [pattern]', 'l'],
    'Outputs list of current clips to the terminal.',
    (yargs) => {
      yargs.positional('pattern', {
        describe: 'pattern to match',
        default: '',
        type: 'string',
      });
      yargs.option('verbose', options.verbose.details('list'));
      yargs.option('img', options.img.details('list'));
      yargs.option('pretty', {
        description: 'Makes output look nicer, arguably.',
        alias: 'p',
      });
    },
    list,
  )
  .command(
    ['open', 'o'],
    'Opens clips file in editor.',
    () => {
      yargs.option('img', options.img.details('open'));
    },
    open,
  )
  .demandCommand()
  .showHelpOnFail(true)
  .help('h')
  .alias('h', 'help')
  .completion('completion', function (_current, argv, completionFilter, done) {
    if (
      ['g', 'get', 'rm', 'remove', 'd', 'del', 'r'].some((val) =>
        argv._.includes(val),
      )
    ) {
      completionFilter((_err, _defaultCompletions) => {
        const clipKeys = Object.keys(parseJSON(argv.clipsPath));
        done(clipKeys);
      });
    } else if (argv._.includes('c') || argv._.includes('cfg')) {
      completionFilter((_err, _defaultCompletions) => {
        const configKeys = Object.keys(parseJSON(argv.configPath));
        done(configKeys);
      });
    } else {
      completionFilter();
    }
  })

  .config(config).argv;
