# `set (s)`

```
cb set [key]
cb set [key] --img
```

The `set` command is used to create a new key/value pair in the clips file, or to save an image file to the images directory.

The key of the clip (or the image's filename) is specified as an argument. The value of the clip will be taken from the clipboard.

If the key already exists, the user will be prompted before overwriting it. The exception to this is the zero key. This is the default value of the key argument and it can be overwritten without prompting.

Images are saved as PNGs.

## Usage for plaintext clips

```
# Set the value of the zero key.
# Equivalent to `cb set 0`.
$ cb set

# Create a new key/value pair, or update the value of an existing pair.
$ cb set key
```
