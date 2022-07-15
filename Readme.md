# Window Calls

This extension allows you to list current windows with some of their properties from command line, super usefull for Wayland to get current focused window.

Also, it allows you to move given window to different workspace.

Credit to [dceee](https://github.com/dceee) for providing example code in [this discussion](https://gist.github.com/rbreaves/257c3edfa301786e66e964d7ac036269).

## Usage

Install extension from [gnome extensions page](https://extensions.gnome.org/extension/4724/window-calls/).

To get all active windows simply run from terminal:

```sh
gdbus call --session --dest org.gnome.Shell --object-path /org/gnome/Shell/Extensions/Windows --method org.gnome.Shell.Extensions.Windows.List
```

To move given window to some workspace, in my case window with id 2205525109 to workspace number 4:

```sh
gdbus call --session --dest org.gnome.Shell --object-path /org/gnome/Shell/Extensions/Windows --method org.gnome.Shell.Extensions.Windows.MoveToWorkspace 2205525109 4
```
