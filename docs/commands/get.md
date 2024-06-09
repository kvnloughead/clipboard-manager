# `get (g)`

```
cb get [key]
cb get [key] --img
```

The `get` subcommand is used to retrieve the value of a clip from the clips file or an image from the images directory. The clip or image is loaded to the clipboard.

## Usage for plaintext clips

<pre style="padding-top: 0;">
<code>
<span style="color: green;"># Get the value of the zero key.</span>
<span style="color: green;"># Equivalent to `cb get 0`.</span>
$ cb get

<span style="color: green;"># Load value of the clip with the supplied key to the clipboard.</span>
$ cb get key

<span style="color: green;"># If no clip is found.</span>
$ cb get missing-key

<span style="color: grey;">missing-key: no such key in clips file.
Run `cb list` to see available keys.</span>
</code>
</pre>

## Usage for images

<pre style="padding-top: 0;">
<code>
<span style="color: green;"># Load the image with the supplied filename to the clipboard.</span>
<span style="color: green;"># TODO - make hitting Ctrl+C unnecessary.</span>
$ cb get --img [key]
<span style="color: grey;">Image loaded to clipboard. Hit Ctrl+C to continue.</span>
</code>
</pre>
