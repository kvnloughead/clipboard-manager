# CB (Clipboard Manager)

A simple command line key/value focused clipboard manager for Linux, written in TypeScript. It is focused in storing plaintext clips from the clipboard as key/value pairs in a JSON object and easily retrieving them by they key.

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

## Features

- The basic usage is simple. To save the contents of your clipboard as a clip, run `cb set name-of-clip`. To retrieve the clip later, run `cb get name-of-clip`.

- Clips are stored in a JSON file in the directory of your choosing. The default directory is `~/.config/cb`. I use dropbox for easy access across devices.

- The app can be configured with a JSON file. By default, configuration and logs are stored in `~/.config/cb`.

- To make it easier to find and manage clips there is rather robust `list` command. Run `cb list pattern` to bring up a list of all matching clips. You can then select the desired clip and immediately run another command on it (get, set, etc.) See [docs/commands/list.md](docs/commands/list.md) for usage details.

- Support for images is included (just use the `--img` flag) for some commands. See [TODO.md](TODO.md) for a list of commands that don't support images.

- autocompletion for commands and clip names

- aliases for all commands

- A somewhat experimental clipboard tracker is available. Once started the process polls the clipboard every second or so and saves the current contents to a file in an array.
  - Subcommands include: start, stop, restart, status, open, list.
  - For more details, see [docs/tracker.md](docs/tracker.md).
  - Note that currently automatic startup isn't enabled. Moreover, before starting the tracker you would have to manually delete the PID stored in `~/.config/cb/logs/tracker.pid`. This will be resolved in a later release.

## Available subcommands

- `get|g [key]` - retrieve contents of clipboard (see [docs/commands/get.md](docs/commands/get.md))
- `set|s [key]` - save contents of clipboard (see [docs/commands/set.md](docs/commands/set.md))
- `list|l [pattern]` - list clips that match a pattern (see [docs/commands/list.md](docs/commands/list.md))
- `cat|c [key]` - output value of clip to command line (also useful for piping)
- `remove|rm [key]` - remove a clip
- `rename|mv [key]` - rename a clip
- `update|u [key]` - update the value of a clip
- `open|o` - open the clips file in your editor of choice

## Additional documentation

Inline help is available by running `cb --help` or `cb <command> --help` for any of the available subcommands.

More detailed usage notes and examples can be found in the [docs](docs) directory.

## Usage of scripts

The following scripts are included in package.json.

- `gethelp` - copies the output of `cb --help` to the clipboard, using `xsel`.
- `tracker:gethelp` - copies the output of `cb tracker --help` to the clipboard, using `xsel`.
- `build:dev` - builds with `tsc`. The dev build will always mark `dist/bin/index.js` as executable.
- `build:prod` - builds with `tsc`. The prod build only marks `dist/bind/index.js` as executable if no errors are emitted by `tsc`.
- `watch` - watches files and rebuilds with `tsc` on change.
