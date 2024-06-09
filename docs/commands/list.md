# `list (l)`

```
cb list pattern
cb list pattern --img
```

The `list` subcommand is used to display a list of matching clips or image files, allowing you to select an entry and run one of the other subcommands on it.

By default, pattern matching and output is only done for the keys or filenames. Use the `--verbose` flag to include plaintext values in the pattern matching and output.

## Basic usage for plaintext clips

To display all clips, run `cb list`. Clips are paginated, you can see the next set of matches by typing `n`. You can quit by typing `q`. An example of the interface is shown below. You can select an item by its number

<pre style="padding-top: 0;">
<code>
<span style="color: green;"># List all clips.</span>
$ cb list
<span style="color: grey;">
(1) 0
(2) somekey
(3) someotherkey
(4) somethingelse
(...)
(10) tenthkey

prompt: Showing 10 of 337 matches. Enter a number to select a clip. Type 'q' to quit or 'n' to show more matches.: 
</span>
</code>
</pre>

Once you select an item you'll be prompted with a list of commands to choose from.

<pre style="padding-top: 0;">
<code>

prompt: Enter a command.
(c) cat (g) get (mv) rename
(rm) remove (s) set (u) update
(q) quit

</code>
</pre>

prompt: Showing 10 of 337 matches. Enter a number to select a clip. Type 'q' to quit or 'n' to show more matches.: 1
prompt: Enter a command.
(c) cat (g) get (mv) rename
(rm) remove (s) set (u) update
(q) quit

## Shorthand notation

It is also possible to immediately run the command. Instead of just typing a number to select the entry, type the number, immediately followed by the command designator from the above list. For example, `1mv` will invoke the `rename` subcommand on entry `(1)`. A later release will improve this feature's in-app documentation.

## Pattern matching

Pattern matching is supported by supplying an argument, and this is the most effective way of using this subcommand. Here are a few examples.

<pre style="padding-top: 0;">
<code>

<span style="color: green;"># Matches anything with the substring 'some' anywhere in the key.</span>
cb list some

<span style="color: green;"># Matches anything with 'some', followed by 0 or more characters,</span>
<span style="color: green;"># followed by 'key'</span>
cb list 'some.*key'

<span style="color: green;"># Same as above, but the key must start with 'some'</span>
cb list '^some.*key'

<span style="color: green;"># Now the pattern matching will check the values of the clips as well,</span>
<span style="color: green;"># and the output list will show both keys and values.</span>
cb list '^some.*key' --verbose

</code>
</pre>

## Images

Listing images is supported with the `--img` flag, but with a limited number of subcommands (only `get` and `set` at the time or writing).
