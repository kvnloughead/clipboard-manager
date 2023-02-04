import fs from 'fs';
import { spawn } from 'child_process';
import clipboard from 'clipboardy';

// const editor = 'code';

function get({ key, clipsFile, editor }) {
  if (key === null) {
    spawn(editor, [clipsFile], { stdio: 'inherit' });
  } else {
    const data = JSON.parse(fs.readFileSync(clipsFile));
    clipboard.writeSync(data[key]);
  }
}

export default get;
