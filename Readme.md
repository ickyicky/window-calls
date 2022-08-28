# Window Calls

This extension allows you to list current windows with some of their properties from command line, super usefull for Wayland to get current focused window.

Also, it allows you to move given window to different workspace.

Credit to [dceee](https://github.com/dceee) for providing example code in [this discussion](https://gist.github.com/rbreaves/257c3edfa301786e66e964d7ac036269)
and to [blueray453](https://github.com/blueray453) for requesting additional functions and providing code example for additional properties returned by List
method in [issue #1](https://github.com/ickyicky/window-calls/issues/1);

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
## Using With `jq`

You can realize the full power of this extension when you use it with `jq` or similar tool.

For example, To view all windows in json:
```sh
gdbus call --session --dest org.gnome.Shell --object-path /org/gnome/Shell/Extensions/Windows --method org.gnome.Shell.Extensions.Windows.List | cut -c 3- | rev | cut -c4- | rev | jq .
```
To get windowID of all windows in current workspace:
```sh
gdbus call --session --dest org.gnome.Shell --object-path /org/gnome/Shell/Extensions/Windows --method org.gnome.Shell.Extensions.Windows.List | cut -c 3- | rev | cut -c4- | rev | jq -c '.[] | select (.in_current_workspace == true) | .id'
```
To get windowID and wm_class of all windows in current workspace:
```sh
gdbus call --session --dest org.gnome.Shell --object-path /org/gnome/Shell/Extensions/Windows --method org.gnome.Shell.Extensions.Windows.List | cut -c 3- | rev | cut -c4- | rev | jq -c '[.[] | select (.in_current_workspace == true) | {id: .id,wm_class: .wm_class}]'
```
To get windowID and wm_class of all visible window:
```sh
gdbus call --session --dest org.gnome.Shell --object-path /org/gnome/Shell/Extensions/Windows --method org.gnome.Shell.Extensions.Windows.List | cut -c 3- | rev | cut -c4- | rev | jq -c '[.[] | select (.frame_type == 0 and .window_type == 0) | {id: .id,wm_class: .wm_class}]'
```
To get windowID and wm_class of all visible window in current workspace:
```sh
gdbus call --session --dest org.gnome.Shell --object-path /org/gnome/Shell/Extensions/Windows --method org.gnome.Shell.Extensions.Windows.List | cut -c 3- | rev | cut -c4- | rev | jq -c '[.[] | select (.in_current_workspace == true and .frame_type == 0 and .window_type == 0) | {id: .id,wm_class: .wm_class}]' | jq .
```

