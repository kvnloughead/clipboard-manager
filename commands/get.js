import fs from 'fs';
import clipboard from 'clipboardy';

import { openFile } from '../utils/helpers.js';

function get({ key, clipsPath, editor }) {
  if (key === null) {
    openFile(editor, clipsPath);
  } else {
    const data = JSON.parse(fs.readFileSync(clipsPath));
    clipboard.writeSync(data[key]);
  }
}

export default get;
