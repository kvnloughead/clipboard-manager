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

<pre style="padding-top: 0;">
<code>
<span style="color: green;"># Set the value of the zero key.</span>
<span style="color: green;"># Equivalent to `cb set 0`.</span>
$ cb set

<span style="color: green;"># Create a new key/value pair, or update the value of an existing pair.</span>
$ cb set key
</code>
</pre>
