import { openFileInEditor } from "../utils/helpers.js";

function open(args: CommonArgs) {
  openFileInEditor(args.editor, args.img ? args.imagesPath : args.file);
}

export default open;
