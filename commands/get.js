import fs from 'fs';
import clipboard from 'clipboardy';

import { openFileInEditor } from '../utils/helpers.js';

function get({ key, clipsPath, editor }) {
  if (key === null) {
    openFileInEditor(editor, clipsPath);
  } else {
    const data = JSON.parse(fs.readFileSync(clipsPath));
    clipboard.writeSync(data[key]);
  }
}

export default get;
