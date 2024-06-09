# `list (l)`

```
cb list pattern
cb list pattern --img
```

The `list` subcommand is used to display a list of matching clips or image files, allowing you to select an entry and run one of the other subcommands on it.

By default, pattern matching and output is only done for the keys or filenames. Use the `--verbose` flag to include plaintext values in the pattern matching and output.

## Basic usage for plaintext clips

To display all clips, run `cb list`. Clips are paginated, you can see the next set of matches by typing `n`. You can quit by typing `q`. An example of the interface is shown below. You can select an item by its number

```
# List all clips.
$ cb list

(1) 0
(2) somekey
(3) someotherkey
(4) somethingelse
(...)
(10) tenthkey

prompt: Showing 10 of 337 matches. Enter a number to select a clip. Type 'q' to quit or 'n' to show more matches.:
```

Once you select an item you'll be prompted with a list of commands to choose from.

```
prompt: Enter a command.
(c) cat (g) get (mv) rename
(rm) remove (s) set (u) update
(q) quit
```

Once chosen, the command will be immediately invoked on the chosen item.

## Shorthand notation

It is also possible to immediately run the command. Instead of just typing a number to select the entry, type the number, immediately followed by the command designator from the above list. For example, `1mv` will invoke the `rename` subcommand on entry `(1)`. A later release will improve this feature's in-app documentation.

## Pattern matching

Pattern matching is supported by supplying an argument, and this is the most effective way of using this subcommand. Here are a few examples.

```
# Matches anything with the substring 'some' anywhere in the key.
$ cb list some

# Matches anything with 'some', followed by 0 or more
# characters, followed by 'key'
$ cb list 'some.*key'

# Same as above, but the key must start with 'some'
$ cb list '^some.*key'

# Now the pattern matching will check the values of the clips
# as well, and the output list will show both keys and values.
$ cb list some --verbose
```

## Images

Listing images is supported with the `--img` flag, but with a limited number of subcommands (only `get` and `set` at the time or writing).
