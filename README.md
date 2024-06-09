# CB (Clipboard Manager)

A simple command line key/value focused clipboard manager for Linux, written in TypeScript. I wrote it after not finding a clipboard manager that satisfied me and have been using it daily for work and fun for some time.

## Features

- The basic usage is simple. To save the contents of your clipboard as a clip, run `cb set name-of-clip`. To retrieve the clip later, run `cb get name-of-clip`.

- Clips are stored in a JSON file in the directory of your choosing. The default directory is `~/.config/cb`. I use dropbox for easy access across devices.

- The app can be configured with a JSON file. By default, configuration and logs are stored in `~/.config/cb`.

- To make it easier to find and manage clips there is rather robust `list` command. Run `cb list pattern` to bring up a list of all matching clips. You can then select the desired clip and immediately run another command on it (get, set, etc.) See [docs/commands.md](docs/commands.md) for usage details.

- Other available commands are:

  - output value of clip to command line (also useful for piping)
  - remove a clip
  - rename a clip
  - update the value of a clip
  - open the clips file in your editor of choice

- Support for images is included (just use the `--img` flag) for some commands. See [TODO.md](TODO.md) for a list of commands that don't support images.

- autocompletion for commands and clip names

- aliases for all commands

- A somewhat experimental clipboard tracker is available. Once started the process polls the clipboard every second or so and saves the current contents to a file in an array.
  - Subcommands include: start, stop, restart, status, open, list.
  - For more details, see [docs/tracker.md](docs/tracker.md).
  - Note that currently automatic startup isn't enabled. Moreover, before starting the tracker you would have to manually delete the PID stored in `~/.config/cb/logs/tracker.pid`. This will be resolved in a later release.

## Installation on Debian/Ubuntu

```bash
git clone git clone git@github.com:kvnloughead/clipboard-manager.git
cd cb
npm install
sudo apt install xsel
sudo npm install -g .
node setup.js
```

The setup script will prompt you to enter paths for the files where you want to store your clippings and configuration data. For more information, run `node setup.js --help`.

Note that this application uses [clipboardy](https://www.npmjs.com/package/clipboardy), which on Ubuntu/Debian uses `xsel`. Since `xsel` requires an X11 server, if you are connecting to the machine via SSH you will need to use the `-X` flag to enable X11 forwarding.

## Autocompletion

For autocompletion:

```bash
cb completion >> ~/.bashrc
source ~/.bashrc
```

On OSX, use `.bash_profile` instead of `.bashrc`.

## Subcommands and options of main command

For more details on specific command usage, see [docs/commands.md](docs/commands.md).

```
cb <command>

Commands:
  cb set [key]       Assigns clipboard contents to data[key]. By default, prompt
                     s user before overwriting.                     [aliases: s]
  cb cat [key]       Outputs the value cb[key] to the clipboard     [aliases: c]
  cb get [key]       Loads the value cb[key] to the clipboard       [aliases: g]
  cb update [key]    Prompts user to updates the value of cb[key]   [aliases: u]
  cb remove <key>    Deletes the key:value pair         [aliases: rm, r, del, d]
  cb list [pattern]  Outputs list of current clips to the terminal. If the verbo
                     se flag is set, pattern matching checks values as well as k
                     eys.                                           [aliases: l]
  cb open            Opens clips file in editor.                    [aliases: o]
  cb rename <key>    Prompts user to renames a clip or image file. [aliases: mv]
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

## Usage of scripts

The following scripts are included in package.json.

- `gethelp` - copies the output of `cb --help` to the clipboard, using `xsel`.
- `tracker:gethelp` - copies the output of `cb tracker --help` to the clipboard, using `xsel`.
- `build:dev` - builds with `tsc`. The dev build will always mark `dist/bin/index.js` as executable.
- `build:prod` - builds with `tsc`. The prod build only marks `dist/bind/index.js` as executable if no errors are emitted by `tsc`.
- `watch` - watches files and rebuilds with `tsc` on change.
