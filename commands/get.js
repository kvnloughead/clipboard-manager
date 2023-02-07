import clipboard from 'clipboardy';

import { openFileInEditor, parseJSON } from '../utils/helpers.js';

function get({ key, clipsPath, editor, ...rest }) {
  console.log(rest);
  if (key === null) {
    openFileInEditor(editor, clipsPath);
  } else {
    const data = parseJSON(clipsPath);
    clipboard.writeSync(data[key]);
  }
}

export default get;
