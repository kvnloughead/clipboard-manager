class Option {
  constructor(name, help, settings) {
    this.name = name;
    this._settings = settings;
    this._help = help;
  }

  _getHelp(command) {
    return { description: this._help[command] };
  }

  details(command) {
    let help = this._getHelp(command);
    if (command === 'main') {
      // This prevents duplication of aliases in subcommands
      help = { ...help, ...this._settings };
    }
    return help;
  }
}

export const options = {
  verbose: new Option(
    'verbose',
    {
      main: 'Provide verbose logging',
      list: 'Include values in the printed output. When a pattern is supplied along with the -v flag, the pattern matching applies to the values of the clips, not just their keys.',
    },
    { alias: 'v' },
  ),
  img: new Option(
    'img',
    {
      main: 'Perform action with images instead of text',
      get: 'Load image from images directory to clipboard instead of text',
      set: 'Save image from clipboard to a file in images directory',
      open: 'Open the images directory instead of clips file',
      list: 'List images in image directory instead of clips in clips file',
    },
    {
      default: false,
      type: 'boolean',
      alias: ['i'],
    },
  ),
};
