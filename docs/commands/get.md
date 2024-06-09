# `get (g)`

```
cb get [key]
cb get [key] --img
```

The `get` subcommand is used to retrieve the value of a clip from the clips file or an image from the images directory. The clip or image is loaded to the clipboard.

## Usage for plaintext clips

```
# Get the value of the zero key.
# Equivalent to `cb get 0`.
$ cb get

# Load value of the clip with the supplied key to the clipboard.
$ cb get key

# If no clip is found.
$ cb get missing-key

missing-key: no such key in clips file.
Run `cb list` to see available keys.
```

## Usage for images

```
# Load the image with the supplied filename to the clipboard.
# TODO - make hitting Ctrl+C unnecessary.
$ cb get --img [key]
Image loaded to clipboard. Hit Ctrl+C to continue.
```
