import { openFileInEditor } from '../utils/helpers.js';

function open(argv) {
  openFileInEditor(argv.editor, argv.file);
}

export default open;
