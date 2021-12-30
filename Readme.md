# Window Calls

This extension allows you to list current windows with some of their properties from command line, super usefull for Wayland to get current focused window.

Credit to [dceee](https://github.com/dceee) for providing example code in [this discussion](https://gist.github.com/rbreaves/257c3edfa301786e66e964d7ac036269).

## Usage

Enable extension and:

```sh
gdbus call --session --dest org.gnome.Shell --object-path /org/gnome/Shell/Extensions/Windows --method org.gnome.Shell.Extensions.Windows.List
```
