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

## Subcommands and options of main command

```
cb <command>

Commands:
  cb set [key]       assigns clipboard contents to data[key]        [aliases: s]
  cb get [key]       loads the value cb[key] to the clipboard       [aliases: g]
  cb remove <key>    deletes the key:value pair         [aliases: rm, r, del, d]
  cb list [pattern]  Outputs list of current clips to the terminal. If the verbo
                     se flag is set, pattern matching checks values as well as k
                     eys.                                           [aliases: l]
  cb open            Opens clips file in editor.                    [aliases: o]
  cb tracker         Start, stop, restart, or interact with clipboard history tr
                     acker.
  cb completion      generate completion script

Options:
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

## Subcommands and options of tracker subcommand

```
cb tracker

Start, stop, restart, or interact with clipboard history tracker.

Commands:
  cb tracker start    Starts the clipboard tracking process in the background.
  cb tracker stop     Stops the clipboard tracking background process.
  cb tracker restart  Restarts the clipboard tracking background process.
  cb tracker status   Checks status of clipboard tracking background process.
  cb tracker open     Opens the clipboard history file in your chosen editor.
  cb tracker list     Lists recent clipboard history and provides an interface f
                      or selecting entries.

Options:
      --version         Show version number                            [boolean]
  -v, --verbose         Provide verbose logging.      [boolean] [default: false]
      --defaultsFile    Path to file to store user specified default settings in
                        .
                      [string] [default: "/home/kevin/.config/cb/defaults.json"]
      --configFile      Path to file to store user specified settings. Overwrite
                        s the the default settings.
                      [string] [default: "/home/kevin/.config/cb/settings.json"]
      --clipsFile       Path to file to store clips in.
                         [string] [default: "/home/kevin/.config/cb/clips.json"]
  -h, --help            Show help                                      [boolean]
      --maxClipHistory  Maximum number of clips to store [number] [default: 100]
      --historyFile     Path to file where clipboard history should be stored.
                       [string] [default: "/home/kevin/.config/cb/history.json"]
      --logsPath        Path to directory to store logs in.
                               [string] [default: "/home/kevin/.config/cb/logs"]
```
