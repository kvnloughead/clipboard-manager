# CB (Clipboard Manager)

A simple key/value focused clipboard manager.

## Installation

```bash
git clone git clone git@github.com:kvnloughead/clipboard-manager.git cb
cd cb
npm install
npm install -g .
node setup.js
```

The setup script will prompt you to enter paths for the files where you want to store your clippings and configuration data. For more information, run `node setup.js --help`.

## Autocompletion

For autocompletion:

```bash
node bin/index.js completion >> ~/.bashrc
source ~/.bashrc
```

On OSX, use `.bash_profile` instead of `.bashrc`.

## Commands

```
  cb set [key]         assigns clipboard contents to data[key]      [aliases: s]
  cb get [key]         loads the value cb[key] to the clipboard     [aliases: g]
  cb remove <key>      deletes the key:value pair       [aliases: rm, r, del, d]
  cb list [pattern]    Outputs list of current clips to the terminal. If the ver
                       bose flag is set, pattern matching checks values as well
                       as keys.                                     [aliases: l]
  cb open              Opens clips file in editor.                  [aliases: o]
  cb tracker <action>  Check status, start, stop, or restart tracking clipboard
                       history in background.
  cb completion        generate completion script
```

## Options

```
      --version       Show version number                              [boolean]
  -v, --verbose       Provide verbose logging.        [boolean] [default: false]
      --defaultsFile  Path to file to store user specified default settings in.
                      [string] [default: "/home/kevin/.config/cb/defaults.json"]
      --configFile    Path to file to store user specified settings. Overwrites
                      the the default settings.
                      [string] [default: "/home/kevin/.config/cb/settings.json"]
      --clipsFile     Path to file to store clips in.
                         [string] [default: "/home/kevin/.config/cb/clips.json"]
  -h, --help          Show help                                        [boolean]
```
