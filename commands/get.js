import fs from 'fs';
import clipboard from 'clipboardy';

import { openFile } from '../utils/helpers.js';

function get({ key, clipsFile, editor }) {
  if (key === null) {
    openFile(editor, clipsFile);
  } else {
    const data = JSON.parse(fs.readFileSync(clipsFile));
    clipboard.writeSync(data[key]);
  }
}

export default get;
