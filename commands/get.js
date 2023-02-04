import fs from 'fs';
import { spawn } from 'child_process';
import clipboard from 'clipboardy';

const dataFile = '/home/kevin/Dropbox/cb/clips.json';
const EDITOR = 'code';

function get({ key }) {
  if (key === null) {
    spawn(EDITOR, [dataFile], { stdio: 'inherit' });
  } else {
    const data = JSON.parse(fs.readFileSync(dataFile));
    clipboard.writeSync(data[key]);
  }
}

export default get;
