#!/usr/bin/env node

import _yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
const yargs = _yargs(hideBin(process.argv));

import set from '../commands/set.js';
import get from '../commands/get.js';
import remove from '../commands/remove.js';

yargs
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
    ['remove <key>', 'rm', 'delete', 'del', 'd'],
    'deletes the key:value pair',
    (yargs) => {
      yargs.positional('key', {
        describe: 'key to remove from data',
      });
    },
    remove,
  )
  .option('verbose', {
    alias: 'v',
    type: 'boolean',
    description: 'run with verbose logging',
  })
  .demandCommand()
  .showHelpOnFail(true)
  .help('h')
  .alias('h', 'help').argv;
