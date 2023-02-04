#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import _yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { findUp } from 'find-up';
import * as dotenv from 'dotenv';
const yargs = _yargs(hideBin(process.argv));
dotenv.config();

const configPath = await findUp([path.normalize('.config/cb/settings.json')]);
const config = configPath ? JSON.parse(fs.readFileSync(configPath)) : {};

import set from '../commands/set.js';
import get from '../commands/get.js';
import remove from '../commands/remove.js';

yargs
  .env('CB')
  .default({
    clipsFile: `/home/${process.env.USER}/.config/cb/clips.json`,
    editor: process.env.EDITOR,
    configPath,
  })
  .command(
    ['set [key]', 's'],
    'assigns clipboard contents to data[key]',
    (yargs) => {
      yargs.positional('key', {
        describe: 'key to associate with clipboard contents',
        default: 0,
      });
    },
    set,
  )
  .command(
    ['get [key]', 'g'],
    'loads the value cb[key] to the clipboard',
    (yargs) => {
      yargs.positional('key', {
        describe: 'key to access from data file',
        default: null,
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
  // .command(
  //   ['config [option]', 'cfg'],
  //   'sets a configuration option, or opens configuration file',
  //   (yargs) => {
  //     yargs.positional('option', {
  //       describe: 'the option to configure',
  //     });
  //   },
  //   config,
  // )
  .option('verbose', {
    alias: 'v',
    type: 'boolean',
    description: 'run with verbose logging',
  })
  .demandCommand()
  .showHelpOnFail(true)
  .help('h')
  .alias('h', 'help')
  .config(config).argv;
