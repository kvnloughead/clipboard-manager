#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import _yargs from 'yargs';
import clipboard from 'clipboardy';
import { hideBin } from 'yargs/helpers';
import { findUp } from 'find-up';
import * as dotenv from 'dotenv';
const yargs = _yargs(hideBin(process.argv));
dotenv.config();

const configPath = await findUp([path.normalize('.config/cb/settings.json')]);
const config = configPath ? JSON.parse(fs.readFileSync(configPath)) : {};

import { setFilePath } from '../middleware/index.js';

import set from '../commands/set.js';
import get from '../commands/get.js';
import remove from '../commands/remove.js';
import list from '../commands/list.js';
import open from '../commands/open.js';
import { openFileInEditor, parseJSON } from '../utils/helpers.js';

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
    configPath,
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
  .completion('completion', function (_current, argv, completionFilter, done) {
    if (
      argv._.includes('g') ||
      argv._.includes('get') ||
      argv._.includes('rm') ||
      argv._.includes('remove') ||
      argv._.includes('d') ||
      argv._.includes('del') ||
      argv._.includes('r')
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
