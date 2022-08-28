# Window Calls

This extension allows you to list current windows with some of their properties from command line, super usefull for Wayland to get current focused window.

Also, it allows you to move given window to different workspace.

Credit to [dceee](https://github.com/dceee) for providing example code in [this discussion](https://gist.github.com/rbreaves/257c3edfa301786e66e964d7ac036269)
and to [blueray453](https://github.com/blueray453) for requesting additional functions and providing code example for additional properties returned by List
method in [issue #1](https://github.com/ickyicky/window-calls/issues/1);

## Usage

### Installation

Install extension from [gnome extensions page](https://extensions.gnome.org/extension/4724/window-calls/).

### Listing windows

To get all active windows simply run from terminal:

```sh
gdbus call --session --dest org.gnome.Shell --object-path /org/gnome/Shell/Extensions/Windows --method org.gnome.Shell.Extensions.Windows.List
```

Call returns list of window properties. Example output:
```json
[
  {
    "wm_class": "Caprine",
    "wm_class_instance": "caprine",
    "pid": 62901,
    "id": 1610090767,
    "frame_type": 0,
    "window_type": 0,
    "width": 1910,
    "height": 2100,
    "x": 10,
    "y": 50,
    "in_current_workspace": false,
    "monitor": 0
  }
]
```

### Moving windows between workspaces

To move given window to some workspace, in my case window with id 2205525109 to workspace number 4:

```sh
gdbus call --session --dest org.gnome.Shell --object-path /org/gnome/Shell/Extensions/Windows --method org.gnome.Shell.Extensions.Windows.MoveToWorkspace 2205525109 4
```

### Getting additional information about window

`List` method only returns basic information about the window. There are two more methods:

- `Details`, which returns detailed information about window in JSON format
- `GetTitle`, which returns windows title. Title can contain special characters, which can break ceratin tools like `jq` when parsing JSON

Both methods should be invoked giving desired window's id as a parameter. Example usages:

```sh
gdbus call --session --dest org.gnome.Shell --object-path /org/gnome/Shell/Extensions/Windows --method org.gnome.Shell.Extensions.Windows.Details 2205525109
```

Example result of calling `Details`:
```json
{
  "wm_class": "Caprine",
  "wm_class_instance": "caprine",
  "pid": 62901,
  "id": 1610090767,
  "width": 1910,
  "height": 2100,
  "x": 10,
  "y": 50,
  "maximized": 0,
  "focus": false,
  "in_current_workspace": false,
  "moveable": true,
  "resizeable": true,
  "canclose": true,
  "canmaximize": true,
  "canminimize": true,
  "canshade": true,
  "display": {},
  "frame_bounds": {},
  "frame_type": 0,
  "window_type": 0,
  "layer": 2,
  "monitor": 0,
  "role": "browser-window",
  "area": {},
  "area_all": {},
  "area_cust": {}
}
```

### Resizing and moving

Resizing and moving can be done either together or separetely. There are 3 methods providing this functionality:

1. `Resize` which takes 3 parameters: winid width height
2. `MoveResize` which takes 3 parameters: winid x y width height
3. `Move` which takes 3 parameters: winid x y

### Maximizing, minimizing, activating, closing

Ther are 6 methods providing such functionality:

1. `Maximize`
2. `Minimize`
3. `Unmaximize`
4. `Unminimize`
5. `Activate`
6. `Close`

Each takes only one parameter, winid.

## Using With `jq`

You can realize the full power of this extension when you use it with `jq` or similar tool. As gdbus call returns its own structure, which is not JSON parsable, you need to use cut or gawk in order to retrieve pure JSON output from calls.

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
### Calls using gawk

You can also use gawk to capture desired JSON values. It has to be paired with sed in order to replace escaping done by qawk on quotes. For `List` gawk should look for JSON list:

```sh
dbus call --session --dest org.gnome.Shell --object-path /org/gnome/Shell/Extensions/Windows --method org.gnome.Shell.Extensions.Windows.List | gawk 'match($0, /\[.*\]/, a) {print a[0]}' | sed 's/\\"/"/g' | jq .
```
And for `Details` you want to find just one dictionary:

```sh
gdbus call --session --dest org.gnome.Shell --object-path /org/gnome/Shell/Extensions/Windows --method org.gnome.Shell.Extensions.Windows.Details 1610090767 | gawk 'match($0, /\{.*\}/, a) {print a[0]}' | sed 's/\\"/"/g' | jq .
```
