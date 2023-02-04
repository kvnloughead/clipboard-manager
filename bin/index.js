#!/usr/bin/env node

import clipboard from "clipboardy";
import fs from "fs";
import _yargs from "yargs";
import { hideBin } from "yargs/helpers";
const yargs = _yargs(hideBin(process.argv));

const dataFile = "/home/kevin/Dropbox/cb/clips.json";
const data = JSON.parse(fs.readFileSync(dataFile));
import save from "../commands/save.js";

yargs.command(
  "save [key]",
  'save contents of clipboard with "key" as its hash',
  (yargs) => {
    yargs.positional("key", {
      describe: "key to associate with clipboard contents",
      default: 0,
    });
  },
  save
).argv;

console.log(clipboard.readSync());
