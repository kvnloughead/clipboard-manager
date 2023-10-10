import { openFileInEditor } from "../utils/helpers.js";

function open(args) {
  openFileInEditor(args.editor, args.img ? args.imagesPath : args.file);
}

export default open;
