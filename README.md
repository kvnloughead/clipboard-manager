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

## Usage

```
cb set [key]  # adds current clipboard content to clips file, with the given key
cb set        # defaults to a key of `0`
cb get [key]  # loads the value associated with key to the clipboard
cb get        # defaults to a key of `0`
cb rm <key>   # removes the key/value pair from the clips file
cb list       # lists all keys/value pairs in the clip file
cb open       # opens the clip file in your $EDITOR
```

## Options

```
      --version        Show version number                             [boolean]

  -e, --editor         Editor to use to open config or data files       [string]
                                                                [default: "vim"]

  -c, --cfg, --config  Path to JSON config file                        [boolean]
                                                                [default: false]

  -v, --verbose        Run with verbose logging                        [boolean]

  -h, --help           Show help                                       [boolean]

      --clipsPath      File to store clippings in                       [string]
                                        [default: "$HOME/.config/cb/clips.json"]

      --configPath      File to store configuration in                  [string]
                                     [default: "$HOME/.config/cb/settings.json"]
```
